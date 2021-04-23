import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import * as t from "@babel/types";

// Util {{{
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fail = (el: any) => {
  console.error(el);
  throw new Error("UNEXPECTED ELEMENT");
};
// }}}

// Parse the Types into an AST {{{
const readTypesFromFile = (): string =>
  fs.readFileSync(path.join(process.cwd(), "index.d.ts"), "utf-8");

const getAst = (code: string): t.File =>
  parse(code, {
    plugins: ["typescript"],
    sourceType: "module",
  });
// }}}

// Parse the AST into Contract Tokens {{{
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
  isExported: boolean;
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
    return [{ name, type: null, isExported: false, isMainExport: true }];
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
        isExported: false,
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
        isExported: false,
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
    return [{ ...statement, isExported: true }];
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
        isExported: false,
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
// }}}

// Transform the Graph into an AST {{{
// }}}

const compile = (code: string): string => {
  const ast = getAst(code);
  const tokens = getContractTokens(ast);
  console.log(tokens);
  return code;
};

const compileContracts = (): string => compile(readTypesFromFile());

export default compileContracts;
