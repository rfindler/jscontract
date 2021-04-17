import template from "@babel/template";
import * as t from "@babel/types";
import { Expression, TSTypeAnnotation } from "@babel/types";
import { makeCtExpression } from "./contractFactories";

const buildArrayType = (annotation: TSTypeAnnotation) => {
  return template.expression("CT.anyCT")({ CT: t.identifier("CT") });
};

const mapAnnotationToContractFunction = (
  annotation: TSTypeAnnotation
): Expression => {
  console.log(annotation.typeAnnotation.type);
  switch (annotation.typeAnnotation.type) {
    case "TSNumberKeyword":
      return makeCtExpression("CT.numberCT");
    case "TSBooleanKeyword":
      return makeCtExpression("CT.booleanCT");
    case "TSArrayType":
      return buildArrayType(annotation);
    default:
      return template.expression("CT.anyCT")({ CT: t.identifier("CT") });
  }
};

export default mapAnnotationToContractFunction;
