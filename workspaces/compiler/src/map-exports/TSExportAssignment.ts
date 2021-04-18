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
  makeAnyCt,
  createAndCt,
  createFunctionCt,
} from "../contract-generation/contractFactories";
import mapParamTypes from "../contract-generation/mapParams";
import mapAnnotation from "../contract-generation/mapAnnotation";
import {
  getDeclarePieces,
  getInterfacePieces,
} from "../contract-generation/extractPieces";
import { CompilerState, CompilerHandler } from "../util/types";

const isFunctionType = (node: Node, name: string): boolean => {
  return node.type === "TSDeclareFunction" && node?.id?.name === name;
};

const isNamespace = (node: Node, name: string): boolean => {
  if (node.type !== "TSModuleDeclaration") return false;
  if (node.id.type !== "Identifier") return false;
  return node.id.name === name;
};

interface ContractIdentifiers {
  namespace: TSModuleDeclaration | null;
  functions: Array<TSDeclareFunction>;
}

const reduceDeclarations = (
  name: string,
  { declarationAst }: CompilerState
): ContractIdentifiers => {
  const identifiers: ContractIdentifiers = { functions: [], namespace: null };
  traverse(declarationAst, {
    enter({ node }) {
      if (isFunctionType(node, name)) {
        identifiers.functions.push(node as TSDeclareFunction);
        return;
      }
      if (isNamespace(node, name)) {
        identifiers.namespace = node as TSModuleDeclaration;
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

const collectIdentifiers = (name: string, state: CompilerState) => {
  const { functions: fns, namespace } = reduceDeclarations(name, state);
  const namespaces = namespace ? getNamespaceContracts(namespace, state) : null;
  const functions = getFunctionContracts(fns, state);
  return { functions, namespaces };
};

const getContract = (exps: Expression[]): Expression | null => {
  if (exps.length === 0) return null;
  if (exps.length === 1) return exps[0];
  return createAndCt(...exps);
};

const markModuleExports: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  state.moduleExports = node.name;
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  const contract = getContract(collectIdentifiers(node.name, state).functions);
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
