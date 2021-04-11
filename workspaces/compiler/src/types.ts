import { File } from "@babel/types";

export interface MainJson {
  main: string;
}

export interface CompilerState {
  identifiers: string[];
  contractAst: File;
  declarationAst: File;
  packageJson: MainJson;
}

export type CompilerHandler<T = any> = (
  astNode: T,
  state: CompilerState
) => void;
