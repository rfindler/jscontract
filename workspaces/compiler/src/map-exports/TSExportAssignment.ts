import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  TSExportAssignment,
  TSDeclareFunction,
  Identifier,
  Statement,
} from "@babel/types";
import traverse from "@babel/traverse";
import template from "@babel/template";
import {
  makeAnyCt,
  createAndCt,
  createFunctionCt,
} from "../contract-generation/contractFactories";
import mapParamTypes from "../contract-generation/mapParams";
import mapReturnType from "../contract-generation/mapAnnotation";
import { CompilerState, CompilerHandler } from "../util/types";

const collectIdentifiers = (name: string, state: CompilerState) => {
  const functions: Array<TSDeclareFunction> = [];
  traverse(state.declarationAst, {
    enter(node) {
      switch (node.node.type) {
        case "TSDeclareFunction": {
          if (node.node?.id?.name === name) {
            functions.push(node.node);
          }
          break;
        }
        default:
          return;
      }
    },
  });
  return functions
    .map((identifier) => ({
      domain: mapParamTypes(identifier.params),
      range:
        identifier?.returnType?.type === "TSTypeAnnotation"
          ? mapReturnType(identifier.returnType)
          : makeAnyCt(),
    }))
    .map(createFunctionCt);
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  const contract = createAndCt(...collectIdentifiers(node.name, state));
  state.contractAst.program.body.push(
    template(`const %%name%% = %%and%%.wrap(%%originalCode%%);`)({
      name: node.name,
      and: contract,
      originalCode: `originalModule.${node.name}`,
    }) as Statement
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
