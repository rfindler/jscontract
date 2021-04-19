import template from "@babel/template";
import {
  Expression,
  TSTypeAnnotation,
  TSArrayType,
  TSType,
  TSTypeLiteral,
  TSIndexSignature,
  TSTypeReference,
  TSQualifiedName,
} from "@babel/types";
import { makeCtExpression, makeAnyCt } from "./contractFactories";
import { CompilerState } from "../util/types";

const makeIndexContract = (index: TSIndexSignature, state: CompilerState) => {
  return template.expression(
    `{ prop: { contract: %%type%%, index: "string" } }`
  )({
    type: index.typeAnnotation
      ? mapAnnotation(index.typeAnnotation, state)
      : makeAnyCt(),
  });
};

const buildTypeLiteral = (literal: TSTypeLiteral, state: CompilerState) => {
  const objectContracts = literal.members.map((member) => {
    switch (member.type) {
      case "TSIndexSignature":
        return makeIndexContract(member, state);
      default:
        return;
    }
  });
  return template.expression("CT.CTObject(%%objectContracts%%)")({
    objectContracts,
  });
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
  annotation: TSTypeAnnotation,
  state: CompilerState
): Expression => {
  return mapType(annotation.typeAnnotation, state);
};

export default mapAnnotation;
