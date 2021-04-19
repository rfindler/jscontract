import { readPackageFiles } from "./util/entry";
import addContracts from "./walk-ast/addContracts";
import collectContracts from "./walk-ast/collectContracts";
import { File } from "@babel/types";
import generator from "@babel/generator";
import {
  requireDependencies,
  exportContracts,
  REPLACEMENT_NAME,
} from "./util/requires";
import { parse } from "@babel/parser";
import { CompilerOutput } from "./util/types";

export const ORIGINAL_MODULE_FILE = REPLACEMENT_NAME;

export const compileContracts = (): CompilerOutput => {
  const { typeString, packageJson } = readPackageFiles();
  const contractAst: File = parse(``);
  const declarationAst: File = parse(typeString, {
    plugins: ["typescript"],
    sourceType: "module",
  });
  const state = {
    contractAst,
    declarationAst,
    packageJson,
    identifiers: [],
    contracts: {},
  };
  requireDependencies(state);
  collectContracts(state);
  addContracts(state);
  exportContracts(state);
  const { code } = generator(contractAst);
  return {
    ...state,
    code,
  };
};
