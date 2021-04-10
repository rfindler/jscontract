const path = require("path");
const { compileContracts, getPackageJson, EBADENTRY } = require("./compiler");

const gotoFixture = (packageName) =>
  process.chdir(path.join(__dirname, "fixtures", packageName));

beforeEach(() => {
  process.chdir(__dirname);
});

describe("Entry errors", () => {
  test("Throws an error if it can't find a package JSON", () => {
    gotoFixture("not-a-package");
    expect(() => getPackageJson()).toThrow("ENOENT");
  });
  test("Can get a package.json file", () => {
    gotoFixture("the-unsupported-package");
    const json = getPackageJson();
    expect(json.name).toBe("the-unsupported-package");
  });
  test("Throws an error if it can't find index.d.ts", () => {
    expect(() => compileContracts()).toThrow("ENOENT");
  });
  test("Throws an exception when it can't compile anything", () => {
    gotoFixture("the-unsupported-package");
    expect(() => compileContracts()).toThrow(EBADENTRY);
  });
});

describe("Simple packages", () => {
  test("Our compiler works on an empty package", () => {
    gotoFixture("the-empty-package");
    expect(compileContracts()).toBe(
      `const CT = require('@jscontract/contract');`
    );
  });
});
