import { NodePath } from "@babel/core";
import { ExportNamedDeclaration } from "@babel/types";
import { CompilerState } from "./types";
import traverse from "@babel/traverse";
import handleExportNamedDeclaration from "./ExportNamedDeclaration";

const addContracts = (state: CompilerState): void => {
  traverse(state.declarationAst, {
    enter(node) {
      switch (node.type) {
        case "ExportNamedDeclaration":
          return handleExportNamedDeclaration(
            node as NodePath<ExportNamedDeclaration>,
            state
          );
        default:
          return;
      }
    },
  });
};

export default addContracts;
