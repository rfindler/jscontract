import path from "path";
import compileContracts, { orderGraphNodes } from "./compiler";

const gotoFixture = (fixture: string) =>
  process.chdir(path.join(__dirname, "fixtures", fixture));

const compile = () =>
  compileContracts().replace(/\n/gm, "").replace(/\s\s+/g, " ");

describe("Our graph ordering algorithm", () => {
  test("Works on a degenerate case", () => {
    expect(orderGraphNodes({})).toEqual([]);
  });
  test("Works when the nodes have no dependencies", () => {
    expect(
      orderGraphNodes({
        a: { name: "a", dependencies: [] },
        b: { name: "b", dependencies: [] },
        c: { name: "c", dependencies: [] },
      })
    ).toEqual([
      { name: "a", dependencies: [] },
      { name: "b", dependencies: [] },
      { name: "c", dependencies: [] },
    ]);
  });
  test("Works when the nodes have dependencies", () => {
    expect(
      orderGraphNodes({
        a: { name: "a", dependencies: ["b", "c"] },
        b: { name: "b", dependencies: [] },
        c: { name: "c", dependencies: ["b"] },
      })
    ).toEqual([
      { name: "b", dependencies: [] },
      { name: "c", dependencies: ["b"] },
      { name: "a", dependencies: ["b", "c"] },
    ]);
  });
  test("Throws an exception in the presence of cycles", () => {
    expect(() => {
      orderGraphNodes({
        a: { name: "a", dependencies: ["b"] },
        b: { name: "b", dependencies: ["a"] },
      });
    }).toThrow();
  });
  test("Works with more realistic code", () => {
    expect(
      orderGraphNodes({
        "checksum.ChecksumOptions": {
          name: "checksum.ChecksumOptions",
          dependencies: [],
        },
        "checksum.file": {
          name: "checksum.file",
          dependencies: ["checksum.ChecksumOptions"],
        },
        checksum: {
          name: "checksum",
          dependencies: ["checksum.ChecksumOptions"],
        },
      })
    ).toEqual([
      {
        name: "checksum.ChecksumOptions",
        dependencies: [],
      },
      {
        name: "checksum.file",
        dependencies: ["checksum.ChecksumOptions"],
      },
      {
        name: "checksum",
        dependencies: ["checksum.ChecksumOptions"],
      },
    ]);
  });
});

describe("Our compiler", () => {
  test("Blows up when it can't find any types to compile.", () => {
    gotoFixture("missing-types");
    expect(() => compileContracts()).toThrow("ENOENT");
  });
  test("Succeeds with abbrev", () => {
    gotoFixture("abbrev-js");
    const code = compile();
    expect(code).toMatch(`contract: CT.stringCT, dotdotdot: true`);
    expect(code).toMatch(
      `module.exports = abbrevContract.wrap(originalModule)`
    );
  });
  test("Works on the checksum package", () => {
    gotoFixture("checksum");
    const code = compile();
    expect(code).toMatch(
      `{ algorithm: { contract: CT.stringCT, optional: true, }`
    );
    expect(code).not.toMatch("ErrorContract");
  });
  test("Works on the archy package", () => {
    gotoFixture("archy");
    const code = compile();
    expect(code).toMatch(`CT.CTRec(() => CT.CTObject`);
    expect(code).toMatch(`[ DataContract`);
  });
  test("Works on the argv package", () => {
    gotoFixture("argv");
    const code = compileContracts();
    expect(code).toMatch(`CT.CTRec`);
    expect(code).toMatch(`contract: typeFunctionContract`);
  });
  test("Works on the 7zip-min package", () => {
    gotoFixture("7zip-min");
    const code = compileContracts();
    const resultPosition = code.indexOf("ResultContract");
    const listPosition = code.indexOf("listContract");
    expect(resultPosition).toBeLessThan(listPosition);
  });
  test("Works on the base64-arraybuffer", () => {
    gotoFixture("base64-arraybuffer");
    const code = compileContracts();
    expect(code).toMatch(`CT.arrayBufferCT`);
  });
  test("Works on array types", () => {
    gotoFixture("array-generic");
    const code = compile();
    expect(code).toMatch(`CT.numberCT, { immutable: true,`);
    expect(code).toMatch(
      `const MyGenericContract = CT.CTFunction(CT.trueCT, [CT.anyCT], CT.nullCT);`
    );
    expect(code).toMatch(
      `{ length: CT.numberCT, prop: { contract: CT.stringCT, index: "string"`
    );
  });
  test("Works with country code lookup", () => {
    gotoFixture("country-code-lookup");
    const code = compile();
    expect(code).not.toMatch(
      "module.exports.Country = CountryContract.wrap(originalModule.Country)"
    );
  });
  test("Succeeds with some constants", () => {
    gotoFixture("constants");
    const code = compileContracts();
    expect(code).toMatch(`const CT = require("@jscontract/contract")`);
    expect(code).toMatch(
      `const originalModule = require("./__ORIGINAL_UNTYPED_MODULE__.js")`
    );
    expect(code).toMatch(`const numContract = CT.numberCT`);
    expect(code).toMatch(`const strContract = CT.stringCT`);
    expect(code).toMatch(`const nilContract = CT.nullCT`);
    expect(code).toMatch(`const boolContract = CT.booleanCT`);
    expect(code).toMatch(`module.exports = {}`);
    expect(code).toMatch(
      `module.exports.num = numContract.wrap(originalModule.num)`
    );
    expect(code).toMatch(
      `module.exports.str = strContract.wrap(originalModule.str)`
    );
    expect(code).toMatch(
      `module.exports.nil = nilContract.wrap(originalModule.nil)`
    );
    expect(code).toMatch(
      `module.exports.bool = boolContract.wrap(originalModule.bool)`
    );
  });
  test("Succeeds with our promise library", () => {
    gotoFixture("promise-example");
    const code = compile();
    expect(code).toMatch(
      `CT.CTPromise(CT.CTFunction(true, [CT.stringCT], CT.anyCT))`
    );
  });
  test("Succeeds with our primtive constructors", () => {
    gotoFixture("primitive-constructors");
    const code = compile();
    expect(code).toMatch(`CT.StringCT`);
    expect(code).toMatch(`CT.NumberCT`);
    expect(code).toMatch(`CT.BooleanCT`);
    expect(code).toMatch(`CT.ObjectCT`);
    expect(code).toMatch(`CT.SymbolCT`);
  });
});
