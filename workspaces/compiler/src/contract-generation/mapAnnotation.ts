import template from "@babel/template";
import * as t from "@babel/types";
import {
  Expression,
  TSTypeAnnotation,
  TSArrayType,
  TSType,
} from "@babel/types";
import { makeCtExpression, makeAnyCt } from "./contractFactories";

const buildArrayType = (annotation: TSArrayType) =>
  template.expression("CT.CTArray(%%arrayContract%%)")({
    arrayContract: mapTypeToContract(annotation.elementType),
  });

const mapTypeToContract = (type: TSType): Expression => {
  switch (type.type) {
    case "TSNumberKeyword":
      return makeCtExpression("CT.numberCT");
    case "TSBooleanKeyword":
      return makeCtExpression("CT.booleanCT");
    case "TSStringKeyword":
      return makeCtExpression("CT.stringCT");
    case "TSArrayType":
      return buildArrayType(type);
    default:
      return makeAnyCt();
  }
};

const mapAnnotation = (annotation: TSTypeAnnotation): Expression => {
  return mapTypeToContract(annotation.typeAnnotation);
};

export default mapAnnotation;
