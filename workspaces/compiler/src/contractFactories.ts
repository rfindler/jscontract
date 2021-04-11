import * as t from "@babel/types";
import { Statement, Identifier } from "@babel/types";
import template from "@babel/template";

export const ANY_CT = `CT.anyCT`;
export const NUMBER_CT = `CT.numberCT`;

const makeFlatContractGenerator = (contractName: string) => {
  const contractGenerator = (node: Identifier): Statement => {
    const contract = template(
      `const %%name%% = CT.%%flatContract%%.wrap(%%originalCode%%)`
    )({
      name: t.identifier(node.name),
      flatContract: t.identifier(contractName),
      originalCode: t.identifier(`originalModule.${node.name}`),
    }) as Statement;
    return contract as Statement;
  };
  return contractGenerator;
};

export const makeAnyCt = makeFlatContractGenerator("anyCT");
export const makeBooleanCt = makeFlatContractGenerator("booleanCT");

export interface FunctionContractElements {
  name: string;
  domain: string[];
  range: string;
}

export const makeFunctionCt = (contracts: FunctionContractElements) => {
  return template(
    `const %%name%% = CT.FunctionCT(CT.trueCT, %%domain%%, %%range%%).wrap(%%originalCode%%)`
  )({
    name: t.identifier(contracts.name),
    domain: t.arrayExpression(
      contracts.domain.map((paramContract) => t.identifier(paramContract))
    ),
    range: t.identifier(contracts.range),
    originalCode: t.identifier(`originalModule.${contracts.name}`),
  }) as Statement;
};
