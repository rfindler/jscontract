import { Statement } from "@babel/types";
import template from "@babel/template";
import { CompilerState } from "./types";

export const exportContracts = (state: CompilerState): void => {
  if (state.identifiers.length === 0) return;
  state.contractAst.program.body.push(
    template.ast(
      `module.exports = { ${state.identifiers.join(", ")} }`
    ) as Statement
  );
  return;
};
