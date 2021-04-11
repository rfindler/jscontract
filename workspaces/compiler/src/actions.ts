import { parse } from "@babel/parser";

export const makeAst = () => parse(``);

export const getAst = (typescript: string) => {
  return parse(typescript, {
    plugins: ["typescript"],
    sourceType: "module",
  });
};
