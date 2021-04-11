import { NodePath } from "@babel/core";
import {
  Identifier,
  ExportNamedDeclaration,
  TSDeclareFunction,
  VariableDeclaration,
  VariableDeclarator,
} from "@babel/types";
import { CompilerHandler } from "./types";

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  // TODO: Look at the type definitions and build up the contracts.
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
  state.identifiers.push(node.id.name);
  // TODO: Look at the type definition and build up the contract.
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
