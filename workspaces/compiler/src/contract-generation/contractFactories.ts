import * as t from "@babel/types";
import { Statement, Expression } from "@babel/types";
import template from "@babel/template";

export const makeCtExpression = (name: string): Expression =>
  template.expression(name)({ CT: t.identifier("CT") });

export const makeAnyCt = (): Expression => makeCtExpression("CT.anyCT");

export const createAndCt = (...args: Expression[]): Expression => {
  return template.expression(`CT.CTAnd(%%args%%)`)({ args });
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
      domain: t.arrayExpression(contracts.domain),
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
  optional: boolean;
}

const getInterfaceTemplate = (
  interfacePieces: Record<string, InterfaceContractPiece>
): string => {
  const identifierNames = Object.keys(interfacePieces);
  return `CT.CTObject({ ${identifierNames
    .map((key) => `${key}: %%${key}%%`)
    .join(", ")} })`;
};

const getInterfaceObject = (
  interfacePieces: Record<string, InterfaceContractPiece>
) => {
  const identifierNames = Object.keys(interfacePieces);
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
  const templateString = getInterfaceTemplate(interfacePieces);
  const templateObject = getInterfaceObject(interfacePieces);
  return template.expression(templateString)(templateObject);
};

export const exportFunctionCt = (
  contracts: FunctionExportElements
): Statement => {
  const func = createFunctionCt(contracts);
  return template.statement(`const %%name%% = %%func%%.wrap(%%originalCode%%)`)(
    {
      name: t.identifier(contracts.name),
      func,
      originalCode: t.identifier(`originalModule.${contracts.name}`),
    }
  );
};
