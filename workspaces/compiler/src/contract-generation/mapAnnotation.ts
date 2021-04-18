import template from "@babel/template";
import {
  Expression,
  TSTypeAnnotation,
  TSArrayType,
  TSType,
  TSTypeLiteral,
  TSIndexSignature,
} from "@babel/types";
import { makeCtExpression, makeAnyCt } from "./contractFactories";

const makeIndexContract = (index: TSIndexSignature) => {
  return template.expression(
    `{ prop: { contract: %%type%%, index: "string" } }`
  )({
    type: index.typeAnnotation
      ? mapAnnotation(index.typeAnnotation)
      : makeAnyCt(),
  });
};

const buildTypeLiteral = (literal: TSTypeLiteral) => {
  const objectContracts = literal.members.map((member) => {
    switch (member.type) {
      case "TSIndexSignature":
        return makeIndexContract(member);
      default:
        return;
    }
  });
  return template.expression("CT.CTObject(%%objectContracts%%)")({
    objectContracts,
  });
};

const buildArrayType = (annotation: TSArrayType) =>
  template.expression("CT.CTArray(%%arrayContract%%)")({
    arrayContract: mapType(annotation.elementType),
  });

export const mapType = (type: TSType): Expression => {
  switch (type.type) {
    case "TSNumberKeyword":
      return makeCtExpression("CT.numberCT");
    case "TSBooleanKeyword":
      return makeCtExpression("CT.booleanCT");
    case "TSStringKeyword":
      return makeCtExpression("CT.stringCT");
    case "TSArrayType":
      return buildArrayType(type);
    case "TSTypeLiteral":
      return buildTypeLiteral(type);
    default:
      return makeAnyCt();
  }
};

const mapAnnotation = (annotation: TSTypeAnnotation): Expression => {
  return mapType(annotation.typeAnnotation);
};

export default mapAnnotation;
