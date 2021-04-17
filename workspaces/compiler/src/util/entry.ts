import fs from "fs";
import path from "path";

export const EBADENTRY = `We cannot detect the entry point to this module.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPackageJson = (): any =>
  JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
  );

const getTypes = () =>
  fs.readFileSync(path.join(process.cwd(), "index.d.ts"), "utf-8");

interface PackageFiles {
  packageJson: {
    main: string;
  };
  typeString: string;
}

export const readPackageFiles = (): PackageFiles => {
  const packageJson = getPackageJson();
  if (!packageJson.main) throw new Error(EBADENTRY);
  const typeString = getTypes();
  return {
    packageJson,
    typeString,
  };
};
