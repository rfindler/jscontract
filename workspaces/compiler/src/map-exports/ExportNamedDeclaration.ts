import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import template from "@babel/template";
import {
  Identifier,
  Statement,
  TSTypeAnnotation,
  ExportNamedDeclaration,
  TSDeclareFunction,
  VariableDeclaration,
  VariableDeclarator,
} from "@babel/types";
import { CompilerHandler } from "../util/types";
import {
  exportFunctionCt,
  makeAnyCt,
} from "../contract-generation/contractFactories";
import mapParams from "../contract-generation/mapParams";
import mapAnnotation from "../contract-generation/mapAnnotation";

interface IdentifierWithType {
  node: Identifier;
  typeNode: TSTypeAnnotation;
}

const flatExportTypeMap: Record<string, string> = {
  TSBooleanKeyword: "booleanCT",
};

const handleTSTypeAnnotation: CompilerHandler<IdentifierWithType> = (
  node,
  state
) => {
  const { node: identifier, typeNode } = node;
  state.contractAst.program.body.push(
    template.statement(`const %%name%% = CT.%%type%%.wrap(%%originalCode%%)`)({
      name: t.identifier(identifier.name),
      type: t.identifier(flatExportTypeMap[typeNode.type] || "anyCT"),
      originalCode: t.identifier(`originalModule.${identifier.name}`),
    })
  );
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
      return body.push(
        template.statement(`const %%name%% = CT.anyCT.wrap(%%originalCode%%)`)({
          name: t.identifier(name),
          originalCode: t.identifier(`originalModule.${name}`),
        })
      );
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
  const domain = mapParams(node.params);
  const range =
    node.returnType?.type === "TSTypeAnnotation"
      ? mapAnnotation(node.returnType)
      : makeAnyCt();
  state.contractAst.program.body.push(
    exportFunctionCt({ domain, range, name })
  );
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
