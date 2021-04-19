import {
  identifier,
  arrayExpression,
  Statement,
  Expression,
  TSPropertySignature,
} from "@babel/types";
import template from "@babel/template";
import { CompilerState } from "../util/types";
import mapAnnotation from "./mapAnnotation";

export const makeCtExpression = (name: string): Expression =>
  template.expression(name)({ CT: identifier("CT") });

export const makeAnyCt = (): Expression => makeCtExpression("CT.anyCT");

export const createAndCt = (...args: Expression[]): Expression => {
  return template.expression(`CT.CTAnd(%%args%%)`)({ args });
};

export const reduceContracts = (exps: Expression[]): Expression | null => {
  if (exps.length === 0) return null;
  if (exps.length === 1) return exps[0];
  return createAndCt(...exps);
};

interface FunctionContractElements {
  domain: Expression[];
  range: Expression;
}

export const createFunctionCt = (
  contracts: FunctionContractElements
): Expression => {
  return template.expression(`CT.CTFunction(CT.trueCT, %%domain%%, %%range%%)`)(
    {
      domain: arrayExpression(contracts.domain),
      range: contracts.range,
    }
  );
};

export interface FunctionExportElements {
  name: string;
  domain: Expression[];
  range: Expression;
}

export interface InterfaceContractPiece {
  keyName: string;
  contract: Expression;
  optional?: boolean;
}

export const getInterfaceTemplate = (identifierNames: string[]): string => {
  return `CT.CTObject({ ${identifierNames
    .map((key) => `${key}: %%${key}%%`)
    .join(", ")} })`;
};

export const getInterfaceObject = (
  identifierNames: string[],
  interfacePieces: Record<string, InterfaceContractPiece>
): Record<string, Expression> => {
  return identifierNames.reduce(
    (acc: Record<string, Expression>, el: string) => {
      const piece = interfacePieces[el];
      return {
        ...acc,
        [el]: piece.optional
          ? template.expression(`{ optional: true, contract: %%contract%% }`)({
              contract: piece.contract,
            })
          : piece.contract,
      };
    },
    {}
  );
};

export const buildInterfaceCt = (
  interfacePieces: Record<string, InterfaceContractPiece>
): Expression => {
  const identifierNames = Object.keys(interfacePieces);
  if (identifierNames.length === 0)
    return template.expression(`CT.objectCT`)({ CT: identifier("CT") });
  const templateString = getInterfaceTemplate(identifierNames);
  const templateObject = getInterfaceObject(identifierNames, interfacePieces);
  return template.expression(templateString)(templateObject);
};

export const exportFunctionCt = (
  contracts: FunctionExportElements
): Statement => {
  const func = createFunctionCt(contracts);
  return template.statement(`const %%name%% = %%func%%.wrap(%%originalCode%%)`)(
    {
      name: identifier(contracts.name),
      func,
      originalCode: identifier(`originalModule.${contracts.name}`),
    }
  );
};
