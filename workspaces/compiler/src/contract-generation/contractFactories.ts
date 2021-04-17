import * as t from "@babel/types";
import { Statement } from "@babel/types";
import template from "@babel/template";

export const ANY_CT = `CT.anyCT`;
export const NUMBER_CT = `CT.numberCT`;

interface FunctionContractElements {
  domain: string[];
  range: string;
}

const createFunctionCt = (contracts: FunctionContractElements) => {
  return template.expression(`CT.CTFunction(CT.trueCT, %%domain%%, %%range%%)`)(
    {
      domain: t.arrayExpression(
        contracts.domain.map((paramContract) => t.identifier(paramContract))
      ),
      range: t.identifier(contracts.range),
    }
  );
};

export interface FunctionExportElements {
  name: string;
  domain: string[];
  range: string;
}

export const exportFunctionCt = (
  contracts: FunctionExportElements
): Statement => {
  const func = createFunctionCt(contracts);
  return template(`const %%name%% = %%func%%.wrap(%%originalCode%%)`)({
    name: t.identifier(contracts.name),
    func,
    originalCode: t.identifier(`originalModule.${contracts.name}`),
  }) as Statement;
};
