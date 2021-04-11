import { NodePath } from "@babel/core";
import {
  Identifier,
  TSTypeAnnotation,
  ExportNamedDeclaration,
  TSDeclareFunction,
  VariableDeclaration,
  VariableDeclarator,
} from "@babel/types";
import { CompilerHandler } from "./types";
import {
  makeFunctionCt,
  makeAnyCt,
  makeBooleanCt,
  ANY_CT,
} from "./contractFactories";
import mapParamTypesToContracts from "./mapParamTypesToContracts";
import mapAnnotationToContractFunction from "./mapAnnotationToContractFunction";

interface IdentifierWithType {
  node: Identifier;
  typeNode: TSTypeAnnotation;
}

const handleTSTypeAnnotation: CompilerHandler<IdentifierWithType> = (
  node,
  state
) => {
  const { node: identifier, typeNode } = node;
  const body = state.contractAst.program.body;
  switch (typeNode.typeAnnotation.type) {
    case "TSBooleanKeyword":
      return body.push(makeBooleanCt(identifier));
    default:
      return body.push(makeAnyCt(identifier));
  }
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  const { name } = node;
  const body = state.contractAst.program.body;
  state.identifiers.push(name);
  switch (node?.typeAnnotation?.type) {
    case "TSTypeAnnotation":
      return handleTSTypeAnnotation(
        { node, typeNode: node.typeAnnotation },
        state
      );
    default:
      return body.push(makeAnyCt(node));
  }
};

const handleVariableDeclarator: CompilerHandler<VariableDeclarator> = (
  node,
  state
) => {
  switch (node.id.type) {
    case "Identifier":
      return handleIdentifier(node.id as Identifier, state);
    default:
      return;
  }
};

const handleVariableDeclaration: CompilerHandler<VariableDeclaration> = (
  node,
  state
) => {
  node.declarations.forEach((declaration) => {
    handleVariableDeclarator(declaration, state);
  });
};

const handleTSDeclareFunction: CompilerHandler<TSDeclareFunction> = (
  node,
  state
) => {
  if (!node?.id) return;
  const { name } = node.id;
  state.identifiers.push(name);
  const domain = mapParamTypesToContracts(node.params);
  const range =
    node.returnType?.type === "TSTypeAnnotation"
      ? mapAnnotationToContractFunction(node.returnType)
      : ANY_CT;
  state.contractAst.program.body.push(makeFunctionCt({ domain, range, name }));
};

const handleExportNamedDeclaration: CompilerHandler<
  NodePath<ExportNamedDeclaration>
> = (node, state) => {
  const declaration = node.node?.declaration;
  if (!declaration) return;
  switch (declaration.type) {
    case "TSDeclareFunction":
      return handleTSDeclareFunction(declaration as TSDeclareFunction, state);
    case "VariableDeclaration":
      return handleVariableDeclaration(
        declaration as VariableDeclaration,
        state
      );
    default:
      return;
  }
};

export default handleExportNamedDeclaration;
