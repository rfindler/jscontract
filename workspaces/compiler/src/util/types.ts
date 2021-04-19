import { File, Expression } from "@babel/types";

export interface CompilerState {
  identifiers: string[];
  contractAst: File;
  declarationAst: File;
  packageJson: {
    main: string;
  };
  moduleExports?: string;
  contracts: Record<string, Expression>;
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
