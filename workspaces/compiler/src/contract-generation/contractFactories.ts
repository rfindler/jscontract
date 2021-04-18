import * as t from "@babel/types";
import { Statement, Expression } from "@babel/types";
import template from "@babel/template";

export const makeCtExpression = (name: string): Expression =>
  template.expression(name)({ CT: t.identifier("CT") });

export const makeAnyCt = (): Expression => makeCtExpression("CT.anyCT");

interface FunctionContractElements {
  domain: Expression[];
  range: Expression;
}

export const createAndCt = (...args: Expression[]): Expression => {
  return template.expression(`CT.CTAnd(%%args%%)`)({ args });
};

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
