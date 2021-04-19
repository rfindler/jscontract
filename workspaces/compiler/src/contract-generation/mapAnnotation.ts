import template from "@babel/template";
import {
  Identifier,
  Expression,
  TSTypeAnnotation,
  TSArrayType,
  TSType,
  TSTypeLiteral,
  TSTypeReference,
  TSFunctionType,
  TSQualifiedName,
} from "@babel/types";
import { buildLiteralObject } from "./extractPieces";
import mapParams from "./mapParams";
import {
  makeCtExpression,
  makeAnyCt,
  createFunctionCt,
} from "./contractFactories";
import { CompilerState } from "../util/types";

const isLiteralObject = (literal: TSTypeLiteral): boolean => {
  return literal.members.every(
    (member) =>
      member.type === "TSIndexSignature" ||
      member.type === "TSPropertySignature"
  );
};

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

const buildTypeIdentifier = (
  annotation: Identifier,
  state: CompilerState
): Expression => {
  return state.contracts[annotation.name] || makeAnyCt();
};

const buildTypeReference = (
  annotation: TSTypeReference,
  state: CompilerState
): Expression => {
  switch (annotation.typeName.type) {
    case "TSQualifiedName":
      return buildQualifiedName(annotation.typeName, state);
    case "Identifier":
      return buildTypeIdentifier(annotation.typeName, state);
  }
};

const buildTSFunctionType = (
  annotation: TSFunctionType,
  state: CompilerState
) => {
  return (
    createFunctionCt({
      domain: mapParams(annotation.parameters, state),
      range: mapAnnotation(annotation.typeAnnotation, state),
    }) || makeAnyCt()
  );
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
    case "TSFunctionType":
      return buildTSFunctionType(type, state);
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
