/* These are tests that are known to be failing; separate them out so that
   contract.test.js is still useful
 */

"use strict";
"use hopscript";
const assert = require("assert");
const CT = require("./contract.js");

/*
 * I think we've narrowed down the bug to the interplay between
 * object contracts and function contracts; both work fine in
 * isolation, but these test cases fail because we're trying to
 * use both features at the same time.
 */
assert.ok(
  (() => {
    const fn = ({ name }) => name || "Bob";
    const fnContract = CT.CTFunction(
      CT.trueCT,
      [
        CT.CTObject({
          name: {
            contract: CT.stringCT,
            optional: true,
          },
        }),
      ],
      CT.stringCT
    );
    const fnWithCt = fnContract.wrap(fn);
    // Is this a problem?
    return fnWithCt({}) === "hello";
  })()
);

assert.ok(
  (() => {
    const fn = ({ name, nickName }) => name || nickName || "neither";
    const fnContract = CT.CTFunction(
      CT.trueCT,
      [
        CT.CTObject({
          name: {
            contract: CT.stringCT,
            optional: true,
          },
          nickName: {
            contract: CT.stringCT,
            optional: true,
          },
        }),
      ],
      CT.stringCT
    );
    const fnWithCt = fnContract.wrap(fn);
    // I think this should work...
    return fnWithCt({ name: "hello" }) === "hello";
  })()
);

/*
 * Promise
 */
// NB: this test case fails because we do not yet understand how to
// add contracts to promises, so leave it at the end of the file
assert.ok(
  (() => {
    function open(string) {
      return new Promise(function (res, rej) {
        if (string.length > 0) {
          res(string);
        } else {
          rej(string);
        }
      });
    }

    const openCT = CT.CTFunction(
      CT.trueCT,
      [CT.isString],
      CT.CTPromise(CT.isString, CT.isNumber)
    );
    const ctopen = openCT.wrap(open);

    const x = ctopen("foo");
    console.log("hi " + x);
    x.then((v) => console.log("res=", v)); // ok

    ctopen("").then(
      (v) => 0,
      (v) => console.log("rej=", v)
    ); // wrong
  })(),
  "promise.1"
);
