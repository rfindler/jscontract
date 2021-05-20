"use strict";
exports.__esModule = true;
var hex2dec_1 = require("hex2dec");
var breakTypescript = function () {
  var result = hex2dec_1.decToHex("this is actually null");
  // Error: null.charAt is not a function
  return result.charAt(0);
};
breakTypescript();
