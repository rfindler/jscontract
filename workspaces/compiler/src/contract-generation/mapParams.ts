import {
  Identifier,
  TSParameterProperty,
  Pattern,
  Expression,
  RestElement,
  TSType,
  TSTypeAnnotation,
} from "@babel/types";
import template from "@babel/template";
import mapAnnotation, { mapType } from "./mapAnnotation";
import { makeAnyCt } from "./contractFactories";

const getIdentifierContract = (param: Identifier): Expression => {
  switch (param?.typeAnnotation?.type) {
    case "TSTypeAnnotation":
      return mapAnnotation(param.typeAnnotation);
    default:
      return makeAnyCt();
  }
};

const getRestArrayType = (aType: TSTypeAnnotation): TSType | null => {
  switch (aType?.typeAnnotation?.type) {
    case "TSArrayType": {
      return aType.typeAnnotation.elementType || null;
    }
    default:
      return null;
  }
};

const getRestElement = (param: RestElement): Expression => {
  const restArrayType =
    param.typeAnnotation?.type === "TSTypeAnnotation"
      ? getRestArrayType(param.typeAnnotation)
      : null;
  return template.expression(`{ dotdotdot: true, contract: %%contract%% }`)({
    contract: restArrayType ? mapType(restArrayType) : makeAnyCt(),
  });
};

type ParameterChild = Identifier | RestElement | TSParameterProperty | Pattern;

const getParameterContract = (param: ParameterChild): Expression => {
  switch (param.type) {
    case "Identifier":
      return getIdentifierContract(param);
    case "RestElement":
      return getRestElement(param);
    default:
      return makeAnyCt();
  }
};

const mapParams = (params: ParameterChild[]): Expression[] => {
  return params.map((param) => getParameterContract(param));
};

export default mapParams;
