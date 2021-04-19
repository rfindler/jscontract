import {
  TSTypeLiteral,
  TSDeclareFunction,
  TSTypeAliasDeclaration,
  TSInterfaceDeclaration,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSPropertySignature,
  TSMethodSignature,
  TSIndexSignature,
  Expression,
} from "@babel/types";
import template from "@babel/template";
import {
  makeAnyCt,
  buildInterfaceCt,
  InterfaceContractPiece,
  createFunctionCt,
} from "./contractFactories";
import mapParams from "./mapParams";
import mapAnnotation, { mapType } from "./mapAnnotation";
import { CompilerState } from "../util/types";

interface DeclarationPieces {
  name: string;
  domain: Expression[];
  range: Expression;
  contract: Expression;
}

interface Pieces {
  name: string;
  contract: Expression;
}

export const getDeclarePieces = (
  node: TSDeclareFunction,
  state: CompilerState
): DeclarationPieces | null => {
  if (!node?.id) return null;
  const { name } = node.id;
  const domain = mapParams(node.params, state);
  const range =
    node.returnType?.type === "TSTypeAnnotation"
      ? mapAnnotation(node.returnType, state)
      : makeAnyCt();
  return { name, contract: createFunctionCt({ domain, range }), domain, range };
};

type InterfaceChild =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSMethodSignature
  | TSIndexSignature
  | TSPropertySignature;

const handleTSIndexSignature = (
  index: TSIndexSignature,
  state: CompilerState
): InterfaceContractPiece => ({
  keyName: "prop",
  contract: template.expression(`{ contract: %%contract%%, index: "string" }`)({
    contract: mapAnnotation(index.typeAnnotation, state),
  }),
});

const handleTsPropertySignature = (
  piece: TSPropertySignature,
  state: CompilerState
): InterfaceContractPiece | null => {
  if (piece.key.type !== "Identifier" || !piece.typeAnnotation) return null;
  const keyName = piece.key.name;
  const contract = mapAnnotation(piece.typeAnnotation, state);
  return { keyName, contract, optional: Boolean(piece.optional) };
};

const compileInterfaceChild = (piece: InterfaceChild, state: CompilerState) => {
  switch (piece.type) {
    case "TSPropertySignature":
      return handleTsPropertySignature(piece, state);
    case "TSIndexSignature":
      return handleTSIndexSignature(piece, state);
    default:
      return null;
  }
};

const getObjectRecord = (children: InterfaceChild[], state: CompilerState) => {
  const interfacePieces: Record<string, InterfaceContractPiece> = {};
  children.forEach((child) => {
    const childContract = compileInterfaceChild(child, state);
    if (!childContract) return;
    interfacePieces[childContract.keyName] = childContract;
  });
  return interfacePieces;
};

export const buildLiteralObject = (
  literal: TSTypeLiteral,
  state: CompilerState
): Expression => buildInterfaceCt(getObjectRecord(literal.members, state));

export const getInterfacePieces = (
  node: TSInterfaceDeclaration,
  state: CompilerState
): Pieces => {
  const { name } = node.id;
  const interfacePieces = getObjectRecord(node.body.body, state);
  return { name, contract: buildInterfaceCt(interfacePieces) };
};

export const getTypeAliasPieces = (
  node: TSTypeAliasDeclaration,
  state: CompilerState
): Pieces => {
  return { name: node.id.name, contract: mapType(node.typeAnnotation, state) };
};
