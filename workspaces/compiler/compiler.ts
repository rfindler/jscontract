import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import generate from "@babel/generator";

// Util {{{
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fail = (el: any) => {
  console.error(el);
  throw new Error("UNEXPECTED ELEMENT");
};

interface GraphNode {
  name: string;
  dependencies: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [otherProperty: string]: any;
}

type Graph = Record<string, GraphNode>;

const getNextIndex = (values: GraphNode[], output: GraphNode[]): number => {
  const index = values.findIndex((node) =>
    node.dependencies.every((dependency) =>
      output.some((val) => val.name === dependency)
    )
  );
  if (index >= 0) return index;
  throw new Error("ERROR: CYCLE IN TYPES DETECTED");
};

export const orderGraphNodes = (graph: Graph): GraphNode[] => {
  const output: GraphNode[] = [];
  const values = Object.values(graph);
  while (values.length > 0) {
    const [element] = values.splice(getNextIndex(values, output), 1);
    output.push(element);
  }
  return output;
};
// }}}

// Parse the Type Declarations into an AST {{{
const readTypesFromFile = (): string =>
  fs.readFileSync(path.join(process.cwd(), "index.d.ts"), "utf-8");

const getAst = (code: string): t.File =>
  parse(code, {
    plugins: ["typescript"],
    sourceType: "module",
  });
// }}}

// Map the AST into Contract Tokens {{{
type ContractHint = "flat" | "function" | "object";

interface FunctionSyntax {
  domain: t.TSType[];
  range: t.TSType;
}

type InterfaceType = Record<string, t.TSType>;

interface TypescriptType {
  hint: ContractHint;
  syntax: FunctionSyntax | InterfaceType | t.TSType;
}

interface ContractToken {
  name: string;
  type: TypescriptType | null;
  isSubExport: boolean;
  isMainExport: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenHandler = (el: any) => ContractToken[];

type ParameterChild =
  | t.Identifier
  | t.RestElement
  | t.TSParameterProperty
  | t.Pattern;

const getParameterType = (el: ParameterChild): t.TSType =>
  el.type !== "TSParameterProperty" &&
  el?.typeAnnotation?.type === "TSTypeAnnotation"
    ? el.typeAnnotation.typeAnnotation
    : t.tsAnyKeyword();

const getParameterTypes = (els: ParameterChild[]): t.TSType[] =>
  els.map((el) => getParameterType(el));

type InterfaceChild =
  | t.TSPropertySignature
  | t.TSIndexSignature
  | t.TSCallSignatureDeclaration
  | t.TSConstructSignatureDeclaration
  | t.TSMethodSignature;

const getInterfaceTypes = (els: InterfaceChild[]): Record<string, t.TSType> => {
  return els.reduce((acc: Record<string, t.TSType>, el) => {
    if (el.type === "TSPropertySignature" && el.key.type === "Identifier") {
      const name = el.key.name;
      const type = el?.typeAnnotation?.typeAnnotation;
      if (!type) return acc;
      return { ...acc, [name]: type };
    }
    return acc;
  }, {});
};

const tokenMap: Record<string, TokenHandler> = {
  File(el: t.File): ContractToken[] {
    return reduceTokens(el.program.body);
  },
  TSExportAssignment(el: t.TSExportAssignment) {
    if (el.expression.type !== "Identifier") return [];
    const { name } = el.expression;
    return [{ name, type: null, isSubExport: false, isMainExport: true }];
  },
  TSModuleBlock(el: t.TSModuleBlock) {
    return reduceTokens(el.body);
  },
  TSModuleDeclaration(el: t.TSModuleDeclaration) {
    const tokens = getContractTokens(el.body);
    if (el.id.type !== "Identifier") return [];
    const { name } = el.id;
    return tokens.map((token) => ({ ...token, name: `${name}.${token.name}` }));
  },
  TSInterfaceDeclaration(el: t.TSInterfaceDeclaration) {
    const name = el.id.name;
    const { body } = el.body;
    const syntax = getInterfaceTypes(body);
    return [
      {
        name,
        type: { hint: "object", syntax },
        isSubExport: false,
        isMainExport: false,
      },
    ];
  },
  TSDeclareFunction(el: t.TSDeclareFunction) {
    const name = el.id?.name;
    if (!name) return [];
    if (el?.returnType?.type !== "TSTypeAnnotation") return [];
    const syntax: FunctionSyntax = {
      range: el.returnType.typeAnnotation,
      domain: getParameterTypes(el.params),
    };
    return [
      {
        name,
        type: { hint: "function", syntax },
        isSubExport: false,
        isMainExport: false,
      },
    ];
  },
  ExportNamedDeclaration(el: t.ExportNamedDeclaration) {
    if (!el.declaration) return [];
    const tokens = getContractTokens(el.declaration);
    if (tokens.length === 0) return [];
    if (tokens.length > 1) return fail(tokens);
    const statement = tokens[0];
    return [{ ...statement, isSubExport: true }];
  },
  VariableDeclaration(el: t.VariableDeclaration) {
    if (el.declarations.length !== 1) return fail(el);
    const declaration = el.declarations[0];
    return getContractTokens(declaration);
  },
  VariableDeclarator(el: t.VariableDeclarator) {
    if (el.id.type !== "Identifier") return [];
    return getContractTokens(el.id);
  },
  Identifier(el: t.Identifier) {
    const { name } = el;
    if (el?.typeAnnotation?.type !== "TSTypeAnnotation") return [];
    const syntax = el.typeAnnotation.typeAnnotation;
    return [
      {
        name,
        type: { syntax, hint: "flat" },
        isSubExport: false,
        isMainExport: false,
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noToken = (_: t.Node) => [];

const reduceTokens = (l: t.Statement[]) =>
  l.reduce((acc: ContractToken[], el) => acc.concat(getContractTokens(el)), []);

/**
 * If you're adding another handler to the map above, I suggest
 * inserting this statement into the middle of the function below:
 *
 * if (!tokenMap[el.type]) console.log(el.type);
 *
 * This will print out whichever parts of TypeScript's syntax we're
 * not handling yet.
 */
const getContractTokens = (el: t.Node): ContractToken[] => {
  const fn = tokenMap[el.type] || noToken;
  return fn(el);
};

// }}}

// Construct a Graph from the Tokens {{{
interface ContractNode {
  name: string;
  dependencies: string[];
  types: TypescriptType[];
  isSubExport: boolean;
  isMainExport: boolean;
}

type ContractGraph = Record<string, ContractNode>;

const getReferenceDeps = (ref: t.TSTypeReference): string => {
  const loop = (curType: t.TSEntityName | t.Identifier): string => {
    if (curType.type === "Identifier") return curType.name;
    const { left, right } = curType;
    return `${loop(left)}.${right.name}`;
  };
  return loop(ref.typeName);
};

const getDeps = (type: t.TSType): string[] => {
  if (type.type === "TSTypeReference") {
    return [getReferenceDeps(type)];
  }
  return [];
};

const getTypeDependencies = (type: TypescriptType): string[] => {
  if (type.hint === "flat") return getDeps(type.syntax as t.TSType);
  if (type.hint === "function") {
    const syntax = type.syntax as FunctionSyntax;
    return [
      ...syntax.domain.flatMap((stx) => getDeps(stx)),
      ...getDeps(syntax.range),
    ];
  }
  const syntax = type.syntax as InterfaceType;
  return Object.values(syntax).flatMap((type) => getDeps(type));
};

const getDependencies = (types: TypescriptType[]): string[] =>
  Array.from(new Set(types.flatMap(getTypeDependencies)));

const buildNode = (nodeName: string, tokens: ContractToken[]): ContractNode => {
  const nodeTokens = tokens.filter((token) => token.name === nodeName);
  const isSubExport = nodeTokens.some((token) => token.isSubExport);
  const isMainExport = nodeTokens.some((token) => token.isMainExport);
  const types = nodeTokens
    .filter((token) => token.type !== null)
    .map((token) => token.type) as TypescriptType[];
  return {
    name: nodeName,
    isSubExport,
    isMainExport,
    types,
    dependencies: getDependencies(types),
  };
};

const fixGraphDependencies = (graph: ContractGraph): ContractGraph => {
  const nameList = Object.keys(graph);
  const nameSet = new Set(nameList);
  return Object.entries(graph).reduce((acc, [name, node]) => {
    return {
      ...acc,
      [name]: {
        ...node,
        dependencies: node.dependencies.map((dep) => {
          if (nameSet.has(dep)) return dep;
          const realName = nameList.find((name) => name.endsWith(dep));
          if (!realName) throw new Error(`UNIDENTIFIED TYPE REFERENCE ${dep}`);
          return realName;
        }),
      },
    };
  }, {});
};

const getContractGraph = (tokens: ContractToken[]): ContractGraph => {
  const names = Array.from(new Set(tokens.map((token) => token.name)));
  return fixGraphDependencies(
    names.reduce((acc: ContractGraph, el) => {
      return { ...acc, [el]: buildNode(el, tokens) };
    }, {})
  );
};
// }}}

// Transform the Graph into an AST {{{
const getContractAst = (graph: ContractGraph): t.File => {
  const statements = orderGraphNodes(graph);
  console.log(statements);
  return parse("");
};
// }}}

const compile = (code: string): string => {
  const declarationAst = getAst(code);
  const tokens = getContractTokens(declarationAst);
  const graph = getContractGraph(tokens);
  const contractAst = getContractAst(graph);
  return generate(contractAst).code;
};

const compileContracts = (): string => compile(readTypesFromFile());

export default compileContracts;
