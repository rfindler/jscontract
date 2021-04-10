const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser");
const generator = require("@babel/generator");
const template = require("@babel/template");

// Entry {{{
const EBADENTRY = `We cannot detect the entry point to this module.`;

const getPackageJson = () =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")));

const getTypes = () => fs.readFileSync(path.join(process.cwd(), "index.d.ts"));

const readPackageFiles = () => {
  const packageJson = getPackageJson();
  if (!packageJson.main) throw new Error(EBADENTRY);
  const typeString = getTypes();
  return {
    packageJson,
    typeString,
  };
};
// }}}

const getAst = (typeString) =>
  parser.parse(typeString, {
    plugins: ["typescript"],
    sourceType: "module",
  });

const addContractLibrary = (ast) => {
  const contractImport = template.default.ast(
    `const CT = require('@jscontract/contract');`
  );
  ast.program.body.unshift(contractImport);
};

const compileContracts = () => {
  const { typeString } = readPackageFiles();
  const ast = getAst(typeString);
  addContractLibrary(ast);
  return generator.default(ast).code;
};

module.exports = { compileContracts, getPackageJson, EBADENTRY };
