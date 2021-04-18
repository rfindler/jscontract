import {
  TSDeclareFunction,
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
import mapAnnotation from "./mapAnnotation";

interface DeclarationPieces {
  name: string;
  domain: Expression[];
  range: Expression;
  contract: Expression;
}

export const getDeclarePieces = (
  node: TSDeclareFunction
): DeclarationPieces | null => {
  if (!node?.id) return null;
  const { name } = node.id;
  const domain = mapParams(node.params);
  const range =
    node.returnType?.type === "TSTypeAnnotation"
      ? mapAnnotation(node.returnType)
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
  piece: InterfacePiece<TSPropertySignature>
): InterfaceContractPiece | null => {
  if (piece.child.key.type !== "Identifier" || !piece.child.typeAnnotation)
    return null;
  const keyName = piece.child.key.name;
  const contract = mapAnnotation(piece.child.typeAnnotation);
  return { keyName, contract, optional: Boolean(piece.child.optional) };
};

const compileInterfaceChild = (piece: InterfacePiece<InterfaceChild>) => {
  switch (piece.child.type) {
    case "TSPropertySignature":
      return handleTsPropertySignature({
        name: piece.name,
        child: piece.child,
      });
    default:
      return null;
  }
};

interface InterfacePieces {
  name: string;
  contract: Expression;
}

export const getInterfacePieces = (
  node: TSInterfaceDeclaration
): InterfacePieces => {
  const { name } = node.id;
  const interfacePieces: Record<string, InterfaceContractPiece> = {};
  node.body.body.forEach((child) => {
    const childContract = compileInterfaceChild({ name, child });
    if (!childContract) return;
    interfacePieces[childContract.keyName] = childContract;
  });
  return { name, contract: buildInterfaceCt(interfacePieces) };
};
