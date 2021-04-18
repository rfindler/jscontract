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
import { CompilerState } from "../util/types";
import mapAnnotation, { mapType } from "./mapAnnotation";
import { makeAnyCt } from "./contractFactories";

const getIdentifierContract = (
  param: Identifier,
  state: CompilerState
): Expression => {
  switch (param?.typeAnnotation?.type) {
    case "TSTypeAnnotation":
      return mapAnnotation(param.typeAnnotation, state);
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

const getRestElement = (
  param: RestElement,
  state: CompilerState
): Expression => {
  const restArrayType =
    param.typeAnnotation?.type === "TSTypeAnnotation"
      ? getRestArrayType(param.typeAnnotation)
      : null;
  return template.expression(`{ dotdotdot: true, contract: %%contract%% }`)({
    contract: restArrayType ? mapType(restArrayType, state) : makeAnyCt(),
  });
};

type ParameterChild = Identifier | RestElement | TSParameterProperty | Pattern;

const getParameterContract = (
  param: ParameterChild,
  state: CompilerState
): Expression => {
  switch (param.type) {
    case "Identifier":
      return getIdentifierContract(param, state);
    case "RestElement":
      return getRestElement(param, state);
    default:
      return makeAnyCt();
  }
};

const mapParams = (
  params: ParameterChild[],
  state: CompilerState
): Expression[] => {
  return params.map((param) => getParameterContract(param, state));
};

export default mapParams;
