import { NodePath } from "@babel/core";
import { ExportNamedDeclaration, TSExportAssignment } from "@babel/types";
import { CompilerState } from "../util/types";
import traverse from "@babel/traverse";
import handleExportNamedDeclaration from "./ExportNamedDeclaration";
import handleTSExportAssignment from "./TSExportAssignment";

const addContracts = (state: CompilerState): void => {
  const { declarationAst } = state;
  traverse(declarationAst, {
    enter(node) {
      switch (node.type) {
        case "ExportNamedDeclaration":
          return handleExportNamedDeclaration(
            node as NodePath<ExportNamedDeclaration>,
            state
          );
        case "TSExportAssignment": {
          return handleTSExportAssignment(
            node as NodePath<TSExportAssignment>,
            state
          );
        }
        default:
          return;
      }
    },
  });
};

export default addContracts;
