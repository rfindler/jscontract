import template from "@babel/template";
import * as t from "@babel/types";
import { Statement } from "@babel/types";
import { CompilerState } from "./types";

export const REPLACEMENT_NAME = "__ORIGINAL_UNTYPED_MODULE__.js";

const requireContractLibrary = (state: CompilerState): void => {
  const contractImport = template.ast(
    `const CT = require('@jscontract/contract');`
  ) as Statement;
  state.contractAst.program.body.push(contractImport);
};

const requireOriginalModule = (state: CompilerState): void => {
  const originalModuleImport = template(
    `const %%identifier%% = require(%%source%%)`
  )({
    identifier: t.identifier("originalModule"),
    source: t.stringLiteral(`./${REPLACEMENT_NAME}`),
  }) as Statement;
  state.contractAst.program.body.push(originalModuleImport);
};

export const requireDependencies = (state: CompilerState): void => {
  requireContractLibrary(state);
  requireOriginalModule(state);
};
