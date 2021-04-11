import template from "@babel/template";
import * as t from "@babel/types";
import { Statement } from "@babel/types";
import path from "path";
import { CompilerState, MainJson } from "./types";

export const REPLACEMENT_NAME = "__ORIGINAL_UNTYPED_MODULE__.js";

const getRequirePath = (json: MainJson): string => {
  const requireArray = json.main.split(path.sep);
  requireArray.pop();
  requireArray.push(REPLACEMENT_NAME);
  return requireArray.join(path.sep);
};

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
    source: t.stringLiteral(`./${getRequirePath(state.packageJson)}`),
  }) as Statement;
  state.contractAst.program.body.push(originalModuleImport);
};

export const requireDependencies = (state: CompilerState): void => {
  requireContractLibrary(state);
  requireOriginalModule(state);
};
