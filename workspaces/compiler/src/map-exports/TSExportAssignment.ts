import { NodePath } from "@babel/core";
import {
  TSExportAssignment,
  TSDeclareFunction,
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

const getContract = (exps: Expression[]): Expression | null => {
  if (exps.length === 0) return null;
  if (exps.length === 1) return exps[0];
  return createAndCt(...exps);
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  state.moduleExports = node.name;
  const contract = getContract(collectIdentifiers(node.name, state));
  if (!contract) return;
  state.contractAst.program.body.push(
    template.statement(`const %%name%% = %%contract%%.wrap(%%originalCode%%);`)(
      {
        name: node.name,
        contract,
        originalCode: `originalModule.${node.name}`,
      }
    )
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
