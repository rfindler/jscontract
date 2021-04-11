import { readPackageFiles } from "./entry";
import addContracts from "./addContracts";
import { File } from "@babel/types";
import generator from "@babel/generator";
import { makeAst, getAst } from "./actions";
import { requireDependencies } from "./requires";
import { exportContracts } from "./exports";

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
