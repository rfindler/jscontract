import {
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

interface InterfacePiece<T> {
  child: T;
  name: string;
}

type InterfaceChild =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSMethodSignature
  | TSIndexSignature
  | TSPropertySignature;

const handleTsPropertySignature = (
  piece: InterfacePiece<TSPropertySignature>,
  state: CompilerState
): InterfaceContractPiece | null => {
  if (piece.child.key.type !== "Identifier" || !piece.child.typeAnnotation)
    return null;
  const keyName = piece.child.key.name;
  const contract = mapAnnotation(piece.child.typeAnnotation, state);
  return { keyName, contract, optional: Boolean(piece.child.optional) };
};

const compileInterfaceChild = (
  piece: InterfacePiece<InterfaceChild>,
  state: CompilerState
) => {
  switch (piece.child.type) {
    case "TSPropertySignature":
      return handleTsPropertySignature(
        {
          name: piece.name,
          child: piece.child,
        },
        state
      );
    default:
      return null;
  }
};

export const getInterfacePieces = (
  node: TSInterfaceDeclaration,
  state: CompilerState
): Pieces => {
  const { name } = node.id;
  const interfacePieces: Record<string, InterfaceContractPiece> = {};
  node.body.body.forEach((child) => {
    const childContract = compileInterfaceChild({ name, child }, state);
    if (!childContract) return;
    interfacePieces[childContract.keyName] = childContract;
  });
  return { name, contract: buildInterfaceCt(interfacePieces) };
};

export const getTypeAliasPieces = (
  node: TSTypeAliasDeclaration,
  state: CompilerState
): Pieces => {
  return { name: node.id.name, contract: mapType(node.typeAnnotation, state) };
};
