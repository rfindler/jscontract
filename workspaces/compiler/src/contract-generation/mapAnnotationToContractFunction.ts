import { TSTypeAnnotation } from "@babel/types";

const mapAnnotationToContractFunction = (
  annotation: TSTypeAnnotation
): string => {
  switch (annotation.typeAnnotation.type) {
    case "TSNumberKeyword":
      return "CT.numberCT";
    case "TSBooleanKeyword":
      return "CT.booleanCT";
    default:
      return "CT.anyCT";
  }
};

export default mapAnnotationToContractFunction;
