/* These are tests that are known to be failing; separate them out so that
   contract.test.js is still useful
 */

"use strict";
"use hopscript";
const assert = require("assert");
const CT = require("./contract.js");


// this test case fails becuase it is a nested and inside
// and or and the semantics of it that, it seems to me,
// says that we should blame the negative party here because
// they have to supply an argument is that satisfies one of
// these four possiblities:
//   - even and odd
//   - even and neg
//   - pos and odd
//   - pos and neg
// changing the 21 to a 22 causes the test case to pass
// (and that variation is in the other file)
assert.ok(
  (() => {
    function even(x) {
      return x % 2 == 0;
    }
    function pos(x) {
      return x > 0;
    }
    function odd(x) {
      return x % 2 != 0;
    }
    function neg(x) {
      return x < 0;
    }
    const even_to_even_and_pos_to_pos = CT.CTAnd(
      CT.CTFunction(CT.trueCT, [even], even),
      CT.CTFunction(CT.trueCT, [pos], pos)
    );
    const odd_to_odd_and_neg_to_neg = CT.CTAnd(
      CT.CTFunction(CT.trueCT, [odd], odd),
      CT.CTFunction(CT.trueCT, [neg], neg)
    );
    const ee_a_pp_or_oo_a_nn = CT.CTOr(
      even_to_even_and_pos_to_pos,
      odd_to_odd_and_neg_to_neg
    );

    function id(x) {
      return x;
    }
    const f =  ee_a_pp_or_oo_a_nn.wrap(id);
    return 22 == f(22);
  })(),
  "ctand.7"
);




/*
 * Promise
 */
// this test case fails because we do not yet understand how to
// add contracts to promises
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
