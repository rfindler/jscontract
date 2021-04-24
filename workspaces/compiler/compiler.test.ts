import path from "path";
import compileContracts from "./compiler";

const gotoFixture = (fixture: string) =>
  process.chdir(path.join(__dirname, "fixtures", fixture));

const compile = () =>
  compileContracts().replace(/\n/gm, "").replace(/\s\s+/g, " ");

describe("Our compiler", () => {
  test("Blows up when it can't find any types to compile.", () => {
    gotoFixture("missing-types");
    expect(() => compileContracts()).toThrow("ENOENT");
  });
  test("Succeeds on a super basic package", () => {
    gotoFixture("constants");
    compile();
  });
  test.only("Works on the checksum package", () => {
    gotoFixture("checksum");
    compile();
  });
  test("Works on the archy package", () => {
    gotoFixture("archy");
    compile();
  });
});
