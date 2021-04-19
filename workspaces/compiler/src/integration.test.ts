import { compileContracts } from "./index";
import { gotoFixture } from "./util/entry.test";
import { REPLACEMENT_NAME } from "./util/requires";
import generate from "@babel/generator";

const makeMatchable = (code: string): string =>
  code.replace(/\n/gm, "").replace(/\s\s+/g, " ");

describe("Simple packages", () => {
  test("Our compiler works on an empty package", () => {
    gotoFixture("the-empty-package");
    expect(compileContracts().code).toBe(
      `const CT = require('@jscontract/contract');

const originalModule = require("./__ORIGINAL_UNTYPED_MODULE__.js");`
    );
  });
  test("We pick up on all of the exports in a simple case", () => {
    gotoFixture("browser-or-node");
    expect(compileContracts().identifiers.sort()).toEqual([
      "isBrowser",
      "isJsDom",
      "isNode",
      "isWebWorker",
    ]);
  });
  test("Imports paths work correctly in a simple case", () => {
    gotoFixture("browser-or-node");
    expect(compileContracts().code).toMatch(
      `= require("./${REPLACEMENT_NAME}")`
    );
  });
  test("Import paths work correctly when the package name is relative", () => {
    gotoFixture("relative-browser-or-node");
    expect(compileContracts().code).toMatch(
      `= require("./${REPLACEMENT_NAME}")`
    );
  });
  test("We can handle simple functions", () => {
    gotoFixture("simple-function");
    const { code } = compileContracts();
    expect(code).toMatch(
      `CT.CTFunction(CT.trueCT, [CT.numberCT], CT.numberCT).wrap(originalModule.addFive);`
    );
  });
  test("We can handle functions that don't take any arguments", () => {
    gotoFixture("browser-or-node");
    const { code } = compileContracts();
    expect(code).toMatch(
      `CT.CTFunction(CT.trueCT, [], CT.booleanCT).wrap(originalModule.isJsDom);`
    );
  });
  test("We can handle the abbrev package", () => {
    gotoFixture("abbrev-js");
    const { code } = compileContracts();
    const matchableCode = makeMatchable(code);
    expect(matchableCode).toMatch("CT.CTAnd");
    expect(matchableCode).toMatch("dotdotdot: true, contract: CT.stringCT");
    expect(matchableCode).toMatch("CT.CTArray(CT.stringCT)");
    expect(matchableCode).toMatch('contract: CT.stringCT, index: "string"');
    expect(matchableCode).toMatch("module.exports = abbrev");
  });
  test("We can handle the Abs package", () => {
    gotoFixture("abs");
    const { code } = compileContracts();
    expect(code).not.toMatch("CT.CTAnd");
    expect(code).toMatch("[CT.stringCT], CT.stringCT");
  });
  test("We can handle the checksum package", () => {
    gotoFixture("checksum");
    const { code } = compileContracts();
    const matchableCode = makeMatchable(code);
    expect(matchableCode).toMatch(
      "algorithm: { optional: true, contract: CT.stringCT }"
    );
    expect(matchableCode).toMatch("module.exports = checksum");
  });
  // test.only("We can handle the archy package", () => {
  //   gotoFixture("archy");
  //   const { code } = compileContracts();
  //   console.log(code);
  // });
  test("We can handle the argv package", () => {
    gotoFixture("argv");
    const { contracts } = compileContracts();
    console.log(generate(contracts.args).code);
  });
});
