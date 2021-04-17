import { compileContracts } from "./index";
import { gotoFixture } from "./util/entry.test";
import { REPLACEMENT_NAME } from "./util/requires";

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
    console.log(code);
    expect(code).toMatch(
      `CT.CTFunction(CT.trueCT, [], CT.booleanCT).wrap(originalModule.isJsDom);`
    );
  });
  test("We can handle the abbrev package", () => {
    gotoFixture("abbrev-js");
    const { code } = compileContracts();
    console.log(code);
  });
});
