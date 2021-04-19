import { NodePath } from "@babel/core";
import {
  Node,
  TSExportAssignment,
  TSDeclareFunction,
  VariableDeclarator,
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
import { CompilerState, CompilerHandler } from "../util/types";

const isFunctionType = (node: Node, name: string): boolean => {
  return node.type === "TSDeclareFunction" && node?.id?.name === name;
};

interface ContractIdentifiers {
  functions: Array<TSDeclareFunction>;
}

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
  const { functions } = collectIdentifiers(node.name, state);
  const contract = reduceContracts(functions) || state.contracts[node.name];
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
