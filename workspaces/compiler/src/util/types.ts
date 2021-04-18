import { File } from "@babel/types";

export interface CompilerState {
  identifiers: string[];
  moduleExports?: string;
  contractAst: File;
  declarationAst: File;
  packageJson: {
    main: string;
  };
}

interface Code {
  code: string;
}

export type CompilerOutput = CompilerState & Code;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompilerHandler<T = any> = (
  astNode: T,
  state: CompilerState
) => void;
