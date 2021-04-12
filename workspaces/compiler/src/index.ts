import { readPackageFiles } from "./entry";
import addContracts from "./addContracts";
import { File } from "@babel/types";
import generator from "@babel/generator";
import { makeAst, getAst } from "./actions";
import { requireDependencies, REPLACEMENT_NAME } from "./requires";
import { exportContracts } from "./exports";

export const ORIGINAL_MODULE_FILE = REPLACEMENT_NAME;

export const compileContracts = () => {
  const { typeString, packageJson } = readPackageFiles();
  const contractAst: File = makeAst();
  const declarationAst: File = getAst(typeString);
  const state = { contractAst, declarationAst, packageJson, identifiers: [] };
  requireDependencies(state);
  addContracts(state);
  exportContracts(state);
  const { code } = generator(contractAst);
  return {
    ...state,
    code,
  };
};
