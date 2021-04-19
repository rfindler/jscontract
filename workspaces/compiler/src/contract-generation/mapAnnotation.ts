import template from "@babel/template";
import {
  Expression,
  TSTypeAnnotation,
  TSArrayType,
  TSType,
  TSTypeLiteral,
  TSTypeReference,
  TSQualifiedName,
  TSIndexSignature,
  TSPropertySignature,
  TSTypeElement,
} from "@babel/types";
import {
  buildInterfaceCt,
  makeCtExpression,
  makeAnyCt,
} from "./contractFactories";
import { CompilerState } from "../util/types";

const isLiteralObject = (literal: TSTypeLiteral): boolean => {
  return literal.members.every(
    (member) =>
      member.type === "TSIndexSignature" ||
      member.type === "TSPropertySignature"
  );
};

interface ObjectPiece {
  keyName: string;
  contract: Expression;
  optional?: boolean;
}

const buildPropertySignature = (
  property: TSPropertySignature,
  state: CompilerState
): ObjectPiece | null => {
  if (property.key.type !== "Identifier") return null;
  return {
    keyName: property.key.name,
    contract: mapAnnotation(property.typeAnnotation, state),
    optional: Boolean(property.optional),
  };
};

const buildIndexSignature = (
  index: TSIndexSignature,
  state: CompilerState
): ObjectPiece | null => ({
  keyName: "prop",
  contract: template.expression(`{ contract: %%contract%%, index: "string" }`)({
    contract: mapAnnotation(index.typeAnnotation, state),
  }),
});

const toObjectPiece = (member: TSTypeElement, state: CompilerState) => {
  return member.type === "TSIndexSignature"
    ? buildIndexSignature(member, state)
    : buildPropertySignature(member as TSPropertySignature, state);
};

const getObjectPieces = (
  literal: TSTypeLiteral,
  state: CompilerState
): ObjectPiece[] =>
  literal.members
    .map((member) => toObjectPiece(member, state))
    .filter((piece) => piece !== null) as ObjectPiece[];

const getObjectRecord = (literal: TSTypeLiteral, state: CompilerState) => {
  return getObjectPieces(literal, state).reduce(
    (acc: Record<string, ObjectPiece>, el: ObjectPiece) => {
      return {
        ...acc,
        [el.keyName]: el,
      };
    },
    {}
  );
};

const buildLiteralObject = (literal: TSTypeLiteral, state: CompilerState) =>
  buildInterfaceCt(getObjectRecord(literal, state));

const buildTypeLiteral = (literal: TSTypeLiteral, state: CompilerState) => {
  if (isLiteralObject(literal)) return buildLiteralObject(literal, state);
  return makeAnyCt();
};

const buildArrayType = (annotation: TSArrayType, state: CompilerState) =>
  template.expression("CT.CTArray(%%arrayContract%%)")({
    arrayContract: mapType(annotation.elementType, state),
  });

const buildQualifiedName = (
  annotation: TSQualifiedName,
  state: CompilerState
): Expression => {
  return state.contracts[annotation.right.name] || makeAnyCt();
};

const buildTypeReference = (
  annotation: TSTypeReference,
  state: CompilerState
): Expression => {
  switch (annotation.typeName.type) {
    case "TSQualifiedName":
      return buildQualifiedName(annotation.typeName, state);
    default:
      return makeAnyCt();
  }
};

export const mapType = (type: TSType, state: CompilerState): Expression => {
  switch (type.type) {
    case "TSNumberKeyword":
      return makeCtExpression("CT.numberCT");
    case "TSBooleanKeyword":
      return makeCtExpression("CT.booleanCT");
    case "TSStringKeyword":
      return makeCtExpression("CT.stringCT");
    case "TSArrayType":
      return buildArrayType(type, state);
    case "TSTypeLiteral":
      return buildTypeLiteral(type, state);
    case "TSTypeReference":
      return buildTypeReference(type, state);
    default:
      return makeAnyCt();
  }
};

const mapAnnotation = (
  annotation: TSTypeAnnotation | null | undefined,
  state: CompilerState
): Expression =>
  annotation ? mapType(annotation.typeAnnotation, state) : makeAnyCt();

export default mapAnnotation;
