import fs from "fs";
import path from "path";
import { MainJson } from "./types";

export const EBADENTRY = `We cannot detect the entry point to this module.`;

export const getPackageJson = () =>
  JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
  );

const getTypes = () =>
  fs.readFileSync(path.join(process.cwd(), "index.d.ts"), "utf-8");

export const readPackageFiles = () => {
  const packageJson = getPackageJson();
  if (!packageJson.main) throw new Error(EBADENTRY);
  const typeString = getTypes();
  const mainJson = packageJson as MainJson;
  return {
    packageJson: mainJson,
    typeString,
  };
};
