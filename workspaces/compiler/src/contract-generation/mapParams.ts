import {
  Identifier,
  RestElement,
  TSParameterProperty,
  Pattern,
  Expression,
} from "@babel/types";
import mapAnnotation from "./mapAnnotation";
import { makeAnyCt } from "./contractFactories";

const getIdentifierContract = (param: Identifier): Expression => {
  switch (param?.typeAnnotation?.type) {
    case "TSTypeAnnotation":
      return mapAnnotation(param.typeAnnotation);
    default:
      return makeAnyCt();
  }
};

type ParameterChild = Identifier | RestElement | TSParameterProperty | Pattern;

const getParameterContract = (param: ParameterChild): Expression => {
  switch (param.type) {
    case "Identifier":
      return getIdentifierContract(param);
    default:
      return makeAnyCt();
  }
};

const mapParams = (params: ParameterChild[]): Expression[] => {
  return params.map((param) => getParameterContract(param));
};

export default mapParams;
