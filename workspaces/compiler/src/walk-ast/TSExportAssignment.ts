import { NodePath } from "@babel/core";
import {
  Node,
  TSExportAssignment,
  TSDeclareFunction,
  TSModuleDeclaration,
  Identifier,
  Expression,
} from "@babel/types";
import traverse from "@babel/traverse";
import template from "@babel/template";
import {
  reduceContracts,
  makeAnyCt,
  createFunctionCt,
} from "../contract-generation/contractFactories";
import mapParamTypes from "../contract-generation/mapParams";
import mapAnnotation from "../contract-generation/mapAnnotation";
import {
  getDeclarePieces,
  getInterfacePieces,
} from "../contract-generation/extractPieces";
import { CompilerState, CompilerHandler } from "../util/types";

const isNamespace = (node: Node, name: string): boolean => {
  if (node.type !== "TSModuleDeclaration") return false;
  if (node.id.type !== "Identifier") return false;
  return node.id.name === name;
};

interface ExtractorOutput {
  name: string;
  contract: Expression;
}

type Extractor<T> = (node: T, state: CompilerState) => ExtractorOutput | null;

const makeExtractor = <T>(extractor: Extractor<T>): CompilerHandler<T> => {
  const compilerHandler: CompilerHandler<T> = (node, state) => {
    const pieces = extractor(node, state);
    if (!pieces || !state.namespace) return;
    const { name, contract } = pieces;
    const contracts = state.namespace.contracts;
    if (Array.isArray(contracts[pieces.name])) {
      contracts[name].push(contract);
    } else {
      contracts[name] = [contract];
    }
  };
  return compilerHandler;
};

const addNamespaceFunction = makeExtractor(getDeclarePieces);

const addNamespaceInterface = makeExtractor(getInterfacePieces);

const getNamespaceContracts: CompilerHandler<TSModuleDeclaration> = (
  ns,
  state
): void => {
  if (!Array.isArray(ns.body.body) || ns.id.type !== "Identifier") return;
  state.namespace = { name: ns.id.name, contracts: {} };
  ns.body.body.forEach((child) => {
    switch (child.type) {
      case "TSDeclareFunction":
        return addNamespaceFunction(child, state);
      case "TSInterfaceDeclaration":
        return addNamespaceInterface(child, state);
      default:
        return;
    }
  });
};

const isFunctionType = (node: Node, name: string): boolean => {
  return node.type === "TSDeclareFunction" && node?.id?.name === name;
};

interface ContractIdentifiers {
  functions: Array<TSDeclareFunction>;
}

const isVariableDeclarator = (node: Node, name: string): boolean => {
  if (node.type !== "VariableDeclarator") return false;
  if (node.id.type !== "Identifier") return false;
  return node.id.name === name;
};

const reduceDeclarations = (
  name: string,
  state: CompilerState
): ContractIdentifiers => {
  const identifiers: ContractIdentifiers = { functions: [] };
  const types: string[] = [];
  traverse(state.declarationAst, {
    enter({ node }) {
      types.push(node.type);
      if (isFunctionType(node, name)) {
        identifiers.functions.push(node as TSDeclareFunction);
        return;
      }
      if (isNamespace(node, name)) {
        getNamespaceContracts(node as TSModuleDeclaration, state);
        return;
      }
      if (isVariableDeclarator(node, name)) {
        return;
      }
    },
  });
  return identifiers;
};

const getFunctionContracts = (
  types: TSDeclareFunction[],
  state: CompilerState
): Expression[] =>
  types
    .map((identifier) => ({
      domain: mapParamTypes(identifier.params, state),
      range:
        identifier?.returnType?.type === "TSTypeAnnotation"
          ? mapAnnotation(identifier.returnType, state)
          : makeAnyCt(),
    }))
    .map(createFunctionCt);

const collectIdentifiers = (name: string, state: CompilerState) => {
  const { functions: fns } = reduceDeclarations(name, state);
  const functions = getFunctionContracts(fns, state);
  return { functions };
};

const markModuleExports: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  state.moduleExports = node.name;
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  const contract = reduceContracts(
    collectIdentifiers(node.name, state).functions
  );
  if (!contract) return;
  markModuleExports(node, state);
  state.contractAst.program.body.push(
    template.statement(`const %%name%% = %%contract%%.wrap(originalModule);`)({
      name: node.name,
      contract,
    })
  );
};

const handleTSExportAssignment: CompilerHandler<
  NodePath<TSExportAssignment>
> = (node, state) => {
  switch (node.node.expression.type) {
    case "Identifier":
      return handleIdentifier(node.node.expression, state);
    default:
      return;
  }
};

export default handleTSExportAssignment;
