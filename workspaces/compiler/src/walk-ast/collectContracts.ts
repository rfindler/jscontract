import { CompilerState } from "../util/types";
import traverse from "@babel/traverse";
import { Expression, Identifier } from "@babel/types";
import mapAnnotation from "../contract-generation/mapAnnotation";
import {
  reduceContracts,
  makeAnyCt,
} from "../contract-generation/contractFactories";
import {
  getDeclarePieces,
  getInterfacePieces,
} from "../contract-generation/extractPieces";

type RawContracts = Record<string, Expression[]>;

type ModuleContracts = Record<string, Expression>;

const pushOrCreate = (
  map: RawContracts,
  key: string,
  element: Expression
): void => {
  if (Array.isArray(map[key])) {
    map[key].push(element);
  } else {
    map[key] = [element];
  }
};

type Handler<T> = (
  node: T,
  contracts: RawContracts,
  state: CompilerState
) => void;

const handleIdentifier: Handler<Identifier> = (node, contracts, state) => {
  if (node?.typeAnnotation?.type !== "TSTypeAnnotation") return;
  const contract = mapAnnotation(node.typeAnnotation, state);
  pushOrCreate(contracts, node.name, contract);
};

interface ExtractorOutput {
  name: string;
  contract: Expression;
}

type Extractor<T> = (node: T, state: CompilerState) => ExtractorOutput | null;

const makeHandler = <T>(extractor: Extractor<T>): Handler<T> => {
  const compilerHandler: Handler<T> = (node, contracts, state) => {
    const pieces = extractor(node, state);
    if (!pieces) return;
    const { name, contract } = pieces;
    pushOrCreate(contracts, name, contract);
  };
  return compilerHandler;
};

const addFunctionDeclaration = makeHandler(getDeclarePieces);

const addInterface = makeHandler(getInterfacePieces);

const getRawContracts = (state: CompilerState): RawContracts => {
  const { declarationAst } = state;
  const rawContracts: RawContracts = {};
  traverse(declarationAst, {
    enter(node) {
      switch (node.node.type) {
        case "Identifier":
          return handleIdentifier(node.node, rawContracts, state);
        case "TSInterfaceDeclaration":
          return addInterface(node.node, rawContracts, state);
        case "TSDeclareFunction":
          return addFunctionDeclaration(node.node, rawContracts, state);
      }
    },
  });
  return rawContracts;
};

const reduceRawContracts = (rawContracts: RawContracts): ModuleContracts => {
  const init: ModuleContracts = {};
  Object.keys(rawContracts).forEach((key) => {
    init[key] = reduceContracts(rawContracts[key]) || makeAnyCt();
  });
  return init;
};

const collectContracts = (state: CompilerState): void => {
  state.contracts = reduceRawContracts(getRawContracts(state));
};

export default collectContracts;
