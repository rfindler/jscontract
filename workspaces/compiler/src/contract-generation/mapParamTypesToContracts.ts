import {
  Identifier,
  RestElement,
  TSParameterProperty,
  Pattern,
} from "@babel/types";
import mapAnnotationToContractFunction from "./mapAnnotationToContractFunction";
import { ANY_CT } from "./contractFactories";

const getIdentifierContract = (param: Identifier): string => {
  switch (param?.typeAnnotation?.type) {
    case "TSTypeAnnotation":
      return mapAnnotationToContractFunction(param.typeAnnotation);
    default:
      return ANY_CT;
  }
};

type ParameterChild = Identifier | RestElement | TSParameterProperty | Pattern;

const getParameterContract = (param: ParameterChild): string => {
  switch (param.type) {
    case "Identifier":
      return getIdentifierContract(param);
    default:
      return ANY_CT;
  }
};

const mapParamTypesToContracts = (params: ParameterChild[]): string[] => {
  return params.map((param) => getParameterContract(param));
};

export default mapParamTypesToContracts;
