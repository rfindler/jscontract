import { decToHex } from "hex2dec";

const breakTypescript = (): string => {
  const result = decToHex("this is actually null");
  // Error: null.charAt is not a function
  return result.charAt(0);
};

breakTypescript();
