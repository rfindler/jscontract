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
import mapReturnType from "../contract-generation/mapAnnotation";
import { CompilerState, CompilerHandler } from "../util/types";

/**
 * TODO:
 * - Compile everything in the body of the namespace as though it were a function.
 * - Check for the namespace information while compiling contracts.
 */

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

const getFunctionContracts = (types: TSDeclareFunction[]): Expression[] =>
  types
    .map((identifier) => ({
      domain: mapParamTypes(identifier.params),
      range:
        identifier?.returnType?.type === "TSTypeAnnotation"
          ? mapReturnType(identifier.returnType)
          : makeAnyCt(),
    }))
    .map(createFunctionCt);

const collectIdentifiers = (name: string, state: CompilerState) => {
  const identifiers = reduceDeclarations(name, state);
  return { functions: getFunctionContracts(identifiers.functions) };
};

const getContract = (exps: Expression[]): Expression | null => {
  if (exps.length === 0) return null;
  if (exps.length === 1) return exps[0];
  return createAndCt(...exps);
};

const handleIdentifier: CompilerHandler<Identifier> = (node, state) => {
  state.identifiers.push(node.name);
  state.moduleExports = node.name;
  const contract = getContract(collectIdentifiers(node.name, state).functions);
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
