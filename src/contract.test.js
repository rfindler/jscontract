/* eslint-disable no-unused-expressions, arrow-body-style, no-underscore-dangle */
const assert = require("assert");
const CT = require("./contract.js");

describe("Our contract library", () => {
  test("Works", () => {
    const notAContract = [57];
    // Predicates {{{
    assert.ok(CT.isObject({ x: 3 }), "isObject.1");
    assert.ok(!CT.isObject(undefined), "isObject.2");
    assert.ok(
      CT.isFunction((x) => x),
      "isFunction.1"
    );
    assert.ok(!CT.isFunction("a string"), "isFunction.2");
    assert.ok(CT.isString("3"), "isString.1");
    assert.ok(!CT.isString(3), "isString.2");
    assert.ok(CT.isBoolean(false), "isBoolean.1");
    assert.ok(!CT.isBoolean(undefined), "isBoolean.2");
    assert.ok(CT.isNumber(3), "isNumber.1");
    assert.ok(!CT.isNumber("a string"), "isNumber.2");
    // }}}

    // CT Flat {{{
    assert.ok((() => CT.CTFlat(CT.isNumber).wrap(3))() === 3, "ctflat.1");
    assert.throws(
      () => {
        CT.CTFlat(CT.isNumber).wrap("3");
      },
      /blaming: pos/,
      "ctflat.2"
    );
    // }}}

    // CT Function {{{
    assert.throws(
      () => {
        function f(x) {
          return x + 1;
        }
        const wf = CT.CTFunction(true, [CT.isString], CT.isString).wrap(f);
        wf(3);
        return true;
      },
      /blaming: neg/,
      "ctfunction.1.succeed"
    );
    assert.ok(
      (() => {
        function f(x) {
          return x + 1;
        }
        const wf = CT.CTFunction(CT.trueCT, [CT.isString], CT.isString).wrap(f);
        wf("3");
        return true;
      })(),
      "ctfunction.1.fail"
    );
    assert.throws(
      () => {
        function f() {
          return 1;
        }
        const wf = CT.CTFunction(true, [CT.isString], CT.isString).wrap(f);
        wf("3");
        return true;
      },
      /blaming: pos/,
      "ctfunction.2.fail"
    );
    assert.throws(
      () => {
        function f() {
          return "x";
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, CT.isNumber],
          CT.isString
        ).wrap(f);
        wf("3", "3");
        return true;
      },
      /blaming: neg/,
      "ctfunction.3.fail"
    );
    assert.ok(
      (() => {
        function f() {
          return "x";
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, CT.isNumber],
          CT.isString
        ).wrap(f);
        wf("3", 3);
        return true;
      })(),
      "ctfunction.3.pass"
    );
    assert.throws(
      () => {
        function f() {
          return "x";
        }
        function hasg(x) {
          return "g" in x;
        }
        const wf = CT.CTFunction(
          hasg,
          [CT.isString, CT.isNumber],
          CT.isString
        ).wrap(f);
        const o = { f: wf };
        o.f("3", 3);
        return true;
      },
      /blaming: pos/,
      "ctfunction.4.fail"
    );
    assert.ok(
      (() => {
        function f(x) {
          return x + 1;
        }
        const wf = CT.CTFunction(true, [1], 2).wrap(f);
        wf(1);
        return true;
      })(),
      "ctfunction.5.succeed"
    );
    assert.ok(
      (() => {
        function f() {
          return "abc";
        }
        const wf = CT.CTFunction(CT.trueCT, [], CT.isString).wrap(f);
        wf();
        return true;
      })(),
      "ctfunction.6.succeed"
    );
    assert.throws(
      () => {
        function f() {
          return "abc";
        }
        const wf = CT.CTFunction(CT.trueCT, [], 123).wrap(f);
        wf();
      },
      /blaming: pos/,
      "ctfunction.6.fail"
    );
    assert.ok(
      (() => {
        function f(x, ...y) {
          return parseInt(x, 10) + y.length;
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, { contract: CT.isNumber, dotdotdot: true }],
          CT.isNumber
        ).wrap(f);
        wf("3");
        wf("3", 1);
        wf("3", 1, 2);
        wf("3", 1, 2, 3);
        return true;
      })(),
      "ctfunction.7.succeed"
    );
    assert.throws(
      () => {
        function f(x, ...y) {
          return parseInt(x, 10) + y.length;
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, { contract: CT.isNumber, dotdotdot: true }],
          CT.isNumber
        ).wrap(f);
        wf();
        return true;
      },
      /blaming: neg/,
      "ctfunction.8.succeed"
    );
    assert.throws(
      () => {
        function f(x, ...y) {
          return parseInt(x, 10) + y.length;
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, { contract: CT.isNumber, dotdotdot: true }],
          CT.isNumber
        ).wrap(f);
        wf(1);
        return true;
      },
      /blaming: neg/,
      "ctfunction.9.succeed"
    );
    assert.throws(
      () => {
        function f(x, ...y) {
          return parseInt(x, 10) + y.length;
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, { contract: CT.isNumber, dotdotdot: true }],
          CT.isNumber
        ).wrap(f);
        wf("1", 1, 2, "3");
        return true;
      },
      /blaming: neg/,
      "ctfunction.10.succeed"
    );
    assert.ok(
      (() => {
        function f(x, y = 1, z = true) {
          return parseInt(x, 10) + y + (z ? 10 : -10);
        }
        const wf = CT.CTFunction(
          true,
          [
            CT.isString,
            { contract: CT.isNumber, optional: true },
            { contract: CT.isBoolean, optional: true },
          ],
          CT.isNumber
        ).wrap(f);
        wf("1", 1, false);
        wf("1", 1);
        wf("1");
        return true;
      })(),
      "ctfunction.11.succeed"
    );

    // check errors happen at the right time
    assert.throws(
      () => {
        CT.CTFunction(true, [notAContract], true);
      },
      /CTFunction: not a contract/,
      "ctfunction.arg1-check"
    );
    assert.throws(
      () => {
        CT.CTFunction(true, [true], notAContract);
      },
      /CTFunction: not a contract/,
      "ctfunction.arg2-check"
    );
    assert.throws(
      () => {
        CT.CTFunction(notAContract, [true], true);
      },
      /CTFunction: not a contract/,
      "ctfunction.arg2-check"
    );
    // }}}

    // CTFunctionD {{{
    assert.deepStrictEqual(CT.__topsort([]), []);
    assert.deepStrictEqual(CT.__topsort([{ name: "x" }]), [0]);
    assert.deepStrictEqual(CT.__topsort([{ name: "x" }, { name: "y" }]), [
      0,
      1,
    ]);
    assert.deepStrictEqual(
      CT.__topsort([{ name: "x" }, { name: "y", dep: ["x"] }]),
      [0, 1]
    );
    assert.deepStrictEqual(
      CT.__topsort([{ name: "x", dep: ["y"] }, { name: "y" }]),
      [1, 0]
    );
    assert.deepStrictEqual(
      CT.__topsort([
        { name: "a", dep: ["c"] },
        { name: "b" },
        { name: "c", dep: [] },
        { name: "d" },
        { name: "e", dep: ["f"] },
        { name: "f" },
      ]),
      [2, 0, 1, 3, 5, 4]
    );
    assert.deepStrictEqual(
      CT.__topsort([
        { name: "x", dep: ["y"] },
        { name: "y", dep: ["x"] },
      ]),
      false
    );

    assert.deepStrictEqual(CT.__find_depended_on([]), []);
    assert.deepStrictEqual(
      CT.__find_depended_on([
        { name: "x", dep: ["y"] },
        { name: "y", dep: ["x"] },
      ]),
      [true, true]
    );
    assert.deepStrictEqual(
      CT.__find_depended_on([{ name: "x" }, { name: "y", dep: ["x"] }]),
      [true, false]
    );
    assert.deepStrictEqual(
      CT.__find_depended_on([{ name: "x" }, { name: "y" }]),
      [false, false]
    );

    assert.ok(
      (() => {
        function f() {
          return "y";
        }
        const ctc = CT.CTFunctionD(
          [{ name: "x", ctc: CT.isString }],
          CT.isString
        );
        const wf = ctc.wrap(f);
        return wf("x") === "y";
      })(),
      "ctfunctiond.1"
    );
    assert.ok(
      (() => {
        function f() {
          return "y";
        }
        const ctc = CT.CTFunctionD(
          [
            { name: "x", ctc: CT.isString },
            { name: "y", ctc: CT.isNumber },
          ],
          CT.isString
        );
        const wf = ctc.wrap(f);
        return wf("x", 1) === "y";
      })(),
      "ctfunctiond.2"
    );
    assert.ok(
      (() => {
        function f() {
          return "y";
        }
        const ctc = CT.CTFunctionD(
          [
            { name: "x", ctc: CT.isNumber },
            { name: "y", ctc: (deps) => (y) => deps.x < y, dep: ["x"] },
          ],
          CT.isString
        );
        const wf = ctc.wrap(f);
        return wf(1, 2) === "y";
      })(),
      "ctfunctiond.3"
    );
    assert.ok(
      (() => {
        function f() {
          return "y";
        }
        const ctc = CT.CTFunctionD(
          [
            { name: "x", ctc: (deps) => (x) => x < deps.y, dep: ["y"] },
            { name: "y", ctc: CT.isNumber },
          ],
          CT.isString
        );
        const wf = ctc.wrap(f);
        return wf(1, 2) === "y";
      })(),
      "ctfunctiond.4"
    );
    // check errors happen at the right time
    assert.throws(
      () => {
        CT.CTFunctionD([{ name: "x", ctc: notAContract }], CT.isString);
      },
      /CTFunctionD: not a contract/,
      "ctfunctiond.arg-check"
    );
    assert.throws(
      () => {
        CT.CTFunctionD([{ name: "x", ctc: CT.isString }], notAContract);
      },
      /CTFunctionD: not a contract/,
      "ctfunctiond.rng-check"
    );

    /*
     * CTOr
     */
    assert.throws(() => {
      CT.CTOr(CT.isString, CT.isNumber).wrap(undefined);
    }, "ctor.1");
    assert.ok(
      (() => {
        CT.CTOr(CT.isString, CT.isNumber).wrap("x");
        return true;
      })(),
      "ctor.2"
    );
    assert.ok(
      (() => {
        CT.CTOr(CT.isString, CT.isNumber).wrap(3);
        return true;
      })(),
      "ctor.3"
    );
    assert.ok(
      (() => {
        function f_() {
          return "x";
        }
        const f = CT.CTOr(
          CT.CTFunction(true, [CT.isString], CT.isString),
          CT.isNumber
        ).wrap(f_);
        f("x");
        return true;
      })(),
      "ctor.4"
    );
    assert.throws(
      () => {
        const f = CT.CTOr(
          CT.CTFunction(true, [CT.isString], CT.isString),
          CT.isNumber
        ).wrap(() => 3);
        f("x");
      },
      /blaming: pos/,
      "ctor.5"
    );
    assert.throws(
      () => {
        const f = CT.CTOr(
          CT.CTFunction(true, [CT.isString], CT.isString),
          CT.isNumber
        ).wrap(() => "x");
        f(3);
      },
      /blaming: neg/,
      "ctor.6"
    );

    // check errors happen at the right time
    assert.throws(
      () => {
        CT.CTOr(notAContract, true);
      },
      /CTOr: not a contract/,
      "ctor.arg1-check"
    );
    assert.throws(
      () => {
        CT.CTOr(true, notAContract);
      },
      /CTOr: not a contract/,
      "ctor.arg2-check"
    );

    /*
     * CTObject
     */
    assert.ok(
      (() => {
        CT.CTObject({}).wrap({});
        return true;
      })(),
      "ctobject.1"
    );
    assert.throws(
      () => {
        const tree = CT.CTObject({ l: CT.isString, r: CT.isObject });
        const o = tree.wrap({ l: "x", r: undefined });
        o.l;
        o.r;
      },
      /blaming: pos/,
      "ctobject.2"
    );
    assert.ok(
      (() => {
        const tree = CT.CTObject({ l: CT.isString, r: CT.isNumber });
        const o = tree.wrap({ l: "x", r: 3 });
        return o.l === "x" && o.r === 3;
      })(),
      "ctobject.3"
    );
    assert.ok(
      (() => {
        const person = CT.CTObject({
          id: CT.isNumber,
          prop: {
            contract: CT.CTOr(CT.isString, CT.isBoolean),
            index: "string",
          },
        });
        const o = person.wrap({
          id: 23,
          name: "foo",
          firstname: "bar",
          alive: true,
        });
        return o.id === 23 && o.name === "foo" && o.alive;
      })(),
      "ctobject.4"
    );
    assert.throws(
      () => {
        const person = CT.CTObject({
          id: CT.isNumber,
          prop: {
            contract: CT.CTOr(CT.isString, CT.isBoolean),
            index: "string",
          },
        });
        const o = person.wrap({
          id: 23,
          name: "foo",
          firstname: "bar",
          alive: 23,
        });
        return o.id === 23 && o.name === "foo" && o.alive;
      },
      /CTOr neither applied.*\n.*blaming: pos/,
      "ctobject.index"
    );
    assert.throws(
      () => {
        const person = CT.CTObject({
          id: CT.isNumber,
          prop: {
            contract: CT.CTOr(CT.isString, CT.isBoolean),
            index: "number",
          },
        });
        const o = person.wrap({ id: 23, name: "foo", firstname: "bar" });
        return o.id === 23 && o.name === "foo";
      },
      /Object mismatch.*\n.*blaming: pos/,
      "ctobject.index.2"
    );

    // check errors happen at the right time
    assert.throws(
      () => {
        CT.CTObject({ x: notAContract });
      },
      /CTObject: not a contract/,
      "ctobject.arg-check"
    );

    assert.throws(
      () => {
        CT.CTObject({ x: CT.isString, y: CT.isObject }).wrap({});
      },
      /Object mismatch, expecting "{x, y}"/,
      "ctojbect.tostring"
    );
    // }}}

    // CT Rec {{{
    assert.throws(
      () => {
        CT.CTRec(() => CT.isString).wrap(undefined);
      },
      /blaming: pos/,
      "ctrec.0"
    );
    assert.ok(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap("x");
        return true;
      })(),
      "ctrec.1"
    );
    assert.ok(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap({ l: "x", r: "y" });
        return true;
      })(),
      "ctrec.2"
    );
    assert.ok(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap({ l: "x", r: { l: "y", r: "z" } });
        return true;
      })(),
      "ctrec.3"
    );
    assert.throws(
      () => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap(undefined);
      },
      /blaming: pos/,
      "ctrec.4"
    );
    assert.throws(
      () => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        const o = tree.wrap({ l: "x", r: undefined });
        o.l;
        o.r;
      },
      /blaming: pos/,
      "ctrec.5"
    );
    assert.ok(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        const o = tree.wrap({ l: "x", r: { l: undefined, r: "x" } });
        return o.l === "x";
      })(),
      "ctrec.6"
    );
    assert.throws(
      () => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        const o = tree.wrap({ l: "x", r: { l: undefined, r: "x" } });
        o.l;
        o.r.l;
      },
      /blaming: pos/,
      "ctrec.7"
    );

    /*
     * CTArray
     */
    assert.ok(
      (() => {
        return CT.CTArray(CT.isNumber).wrap([]).length === 0;
      })(),
      "ctarray.0"
    );
    assert.ok(
      (() => {
        return CT.CTArray(CT.isNumber).wrap([11])[0] === 11;
      })(),
      "ctarray.1"
    );
    assert.throws(
      () => {
        CT.CTArray(CT.isNumber).wrap(["string"])[0];
      },
      /blaming: pos/,
      "ctarray.2"
    );
    assert.throws(
      () => {
        CT.CTArray(CT.isNumber).wrap([11, "string", 22])[1];
      },
      /blaming: pos/,
      "ctarray.3"
    );
    assert.ok(
      (() => {
        return CT.CTArray(CT.isNumber).wrap([11, "string", 22])[2] === 22;
      })(),
      "ctarray.4"
    );
    // check errors happen at the right time
    assert.throws(
      () => {
        CT.CTArray(notAContract);
      },
      /CTArray: not a contract/,
      "ctarray.arg-check"
    );
    // }}}

    // CT And {{{
    assert.ok(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
        );
        function f(x, y) {
          return x + y;
        }
        const wf = plusCtc.wrap(f);
        return wf(1, 2) === 3;
      })(),
      "ctand.1"
    );
    assert.ok(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
        );
        function f(x, y) {
          return x + y;
        }
        const wf = plusCtc.wrap(f);
        return wf("1", "2") === "12";
      })(),
      "ctand.2"
    );
    assert.ok(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString),
          CT.CTFunction(true, [CT.isBoolean, CT.isBoolean], CT.isBoolean)
        );
        function f(x, y) {
          return CT.isBoolean(x) ? x && y : x + y;
        }
        const wf = plusCtc.wrap(f);
        return wf(true, false) === false;
      })(),
      "ctand.3a"
    );
    assert.ok(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString),
          CT.CTFunction(true, [CT.isBoolean, CT.isBoolean], CT.isBoolean)
        );
        function f(x, y) {
          return CT.isBoolean(x) ? x && y : x + y;
        }
        const wf = plusCtc.wrap(f);
        return wf(2, 3) === 5;
      })(),
      "ctand.3b"
    );
    assert.ok(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString),
          CT.CTFunction(true, [CT.isBoolean, CT.isBoolean], CT.isBoolean)
        );
        function f(x, y) {
          return CT.isBoolean(x) ? x && y : x + y;
        }
        const wf = plusCtc.wrap(f);
        return wf("x", "y") === "xy";
      })(),
      "ctand.3c"
    );

    assert.throws(
      () => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
        );
        function f(x, y) {
          return x + y;
        }
        const wf = plusCtc.wrap(f);
        wf(1, "2");
      },
      /blaming: neg/,
      "ctand.4"
    );
    assert.throws(
      () => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isNumber)
        );
        function f() {
          return 3;
        }
        const wf = plusCtc.wrap(f);
        wf(1, "2");
      },
      /blaming: neg/,
      "ctand.5"
    );
    assert.throws(
      () => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isNumber, CT.isBoolean], CT.isNumber)
        );
        function f() {
          return 3;
        }
        const wf = plusCtc.wrap(f);
        wf(1, "2");
      },
      /Predicate `isBoolean' not satisfied for value `2'.*\n.*blaming: neg/,
      "ctand.6"
    );
    // }}}
  });
});
