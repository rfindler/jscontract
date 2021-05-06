/* eslint-disable no-unused-vars, no-underscore-dangle, yoda, arrow-body-style, no-unused-expressions */
const CT = require("./contract.js");

describe("Our contract library", () => {
  const notAContract = [57];
  test("Works on predicates", () => {
    expect(CT.isObject({ x: 3 })).toBeTruthy();
    expect(!CT.isObject(undefined)).toBeTruthy();
    expect(CT.isFunction((x) => x)).toBeTruthy();
    expect(!CT.isFunction("a string")).toBeTruthy();
    expect(CT.isString("3")).toBeTruthy();
    expect(!CT.isString(3)).toBeTruthy();
    expect(CT.isBoolean(false)).toBeTruthy();
    expect(!CT.isBoolean(undefined)).toBeTruthy();
    expect(CT.isNumber(3)).toBeTruthy();
    expect(!CT.isNumber("a string")).toBeTruthy();
  });
  test("Works on flat values", () => {
    expect((() => CT.CTFlat(CT.isNumber).wrap(3))() === 3).toBeTruthy();
    expect(() => {
      CT.CTFlat(CT.isNumber).wrap("3");
    }).toThrow(/blaming: pos/);
  });
  test("Works on function values", () => {
    expect(() => {
      function f(x) {
        return x + 1;
      }
      const wf = CT.CTFunction(true, [CT.isString], CT.isString).wrap(f);
      wf(3);
      return true;
    }).toThrow(/blaming: neg/);
    expect(
      (() => {
        function f(x) {
          return x + 1;
        }
        const wf = CT.CTFunction(CT.trueCT, [CT.isString], CT.isString).wrap(f);
        wf("3");
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      function f(x) {
        return 1;
      }
      const wf = CT.CTFunction(true, [CT.isString], CT.isString).wrap(f);
      wf("3");
      return true;
    }).toThrow(/blaming: pos/);
    expect(() => {
      function f(x) {
        return "x";
      }
      const wf = CT.CTFunction(
        true,
        [CT.isString, CT.isNumber],
        CT.isString
      ).wrap(f);
      wf("3", "3");
      return true;
    }).toThrow(/blaming: neg/);
    expect(
      (() => {
        function f(x) {
          return "x";
        }
        const wf = CT.CTFunction(
          true,
          [CT.isString, CT.isNumber],
          CT.isString
        ).wrap(f);
        wf("3", 3);
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      function f(x) {
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
    }).toThrow(/blaming: pos/);
    expect(
      (() => {
        function f(x) {
          return x + 1;
        }
        const wf = CT.CTFunction(true, [1], 2).wrap(f);
        wf(1);
        return true;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        function f() {
          return "abc";
        }
        const wf = CT.CTFunction(CT.trueCT, [], CT.isString).wrap(f);
        wf();
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      function f() {
        return "abc";
      }
      const wf = CT.CTFunction(CT.trueCT, [], 123).wrap(f);
      wf();
    }).toThrow(/blaming: pos/);
    expect(
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
      })()
    ).toBeTruthy();
    expect(() => {
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
    }).toThrow(/blaming: neg/);
    expect(() => {
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
    }).toThrow(/blaming: neg/);
    expect(() => {
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
    }).toThrow(/blaming: neg/);
    expect(
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
      })()
    ).toBeTruthy();
    // check errors happen at the right time
    expect(() => {
      CT.CTFunction(true, [notAContract], true);
    }).toThrow(/CTFunction: not a contract/);
    expect(() => {
      CT.CTFunction(true, [true], notAContract);
    }).toThrow(/CTFunction: not a contract/);
    expect(() => {
      CT.CTFunction(notAContract, [true], true);
    }).toThrow(/CTFunction: not a contract/);
  });
  test("Works with CTFunctionD", () => {
    expect(CT.__topsort([])).toEqual([]);
    expect(CT.__topsort([{ name: "x" }])).toEqual([0]);
    expect(CT.__topsort([{ name: "x" }, { name: "y" }])).toEqual([0, 1]);
    expect(CT.__topsort([{ name: "x" }, { name: "y", dep: ["x"] }])).toEqual([
      0,
      1,
    ]);
    expect(CT.__topsort([{ name: "x", dep: ["y"] }, { name: "y" }])).toEqual([
      1,
      0,
    ]);
    expect(
      CT.__topsort([
        { name: "a", dep: ["c"] },
        { name: "b" },
        { name: "c", dep: [] },
        { name: "d" },
        { name: "e", dep: ["f"] },
        { name: "f" },
      ])
    ).toEqual([2, 0, 1, 3, 5, 4]);
    expect(
      CT.__topsort([
        { name: "x", dep: ["y"] },
        { name: "y", dep: ["x"] },
      ])
    ).toEqual(false);

    expect(CT.__find_depended_on([])).toEqual([]);
    expect(
      CT.__find_depended_on([
        { name: "x", dep: ["y"] },
        { name: "y", dep: ["x"] },
      ])
    ).toEqual([true, true]);
    expect(
      CT.__find_depended_on([{ name: "x" }, { name: "y", dep: ["x"] }])
    ).toEqual([true, false]);
    expect(CT.__find_depended_on([{ name: "x" }, { name: "y" }])).toEqual([
      false,
      false,
    ]);

    expect(
      (() => {
        function f(x) {
          return "y";
        }
        const ctc = CT.CTFunctionD(
          [{ name: "x", ctc: CT.isString }],
          CT.isString
        );
        const wf = ctc.wrap(f);
        return wf("x") === "y";
      })()
    ).toBeTruthy();
    expect(
      (() => {
        function f(x, y) {
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
      })()
    ).toBeTruthy();
    expect(
      (() => {
        function f(x, y) {
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
      })()
    ).toBeTruthy();
    expect(
      (() => {
        function f(x, y) {
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
      })()
    ).toBeTruthy();
    // check errors happen at the right time
    expect(() => {
      CT.CTFunctionD([{ name: "x", ctc: notAContract }], CT.isString);
    }).toThrow(/CTFunctionD: not a contract/);
    expect(() => {
      CT.CTFunctionD([{ name: "x", ctc: CT.isString }], notAContract);
    }).toThrow(/CTFunctionD: not a contract/);
  });
  test("Works with CTOr", () => {
    expect(() => {
      CT.CTOr(CT.isString, CT.isNumber).wrap(undefined);
    }).toThrow("CTOr neither applied");
    expect(
      (() => {
        CT.CTOr(CT.isString, CT.isNumber).wrap("x");
        return true;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        CT.CTOr(CT.isString, CT.isNumber).wrap(3);
        return true;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        function f_(x) {
          return "x";
        }
        const f = CT.CTOr(
          CT.CTFunction(true, [CT.isString], CT.isString),
          CT.isNumber
        ).wrap(f_);
        f("x");
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      const f = CT.CTOr(
        CT.CTFunction(true, [CT.isString], CT.isString),
        CT.isNumber
      ).wrap((x) => 3);
      f("x");
    }).toThrow(/blaming: pos/);
    expect(() => {
      const f = CT.CTOr(
        CT.CTFunction(true, [CT.isString], CT.isString),
        CT.isNumber
      ).wrap((x) => "x");
      f(3);
    }).toThrow(/blaming: neg/);

    // check errors happen at the right time
    expect(() => {
      CT.CTOr(notAContract, true);
    }).toThrow(/CTOr: not a contract/);
    expect(() => {
      CT.CTOr(true, notAContract);
    }).toThrow(/CTOr: not a contract/);
  });
  test("Works with CTObject", () => {
    expect(
      (() => {
        const tree = CT.CTObject({});
        const o = tree.wrap({});
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      const tree = CT.CTObject({ l: CT.isString, r: CT.isObject });
      const o = tree.wrap({ l: "x", r: undefined });
      o.l;
      o.r;
    }).toThrow(/blaming: pos/);
    expect(
      (() => {
        const tree = CT.CTObject({ l: CT.isString, r: CT.isNumber });
        const o = tree.wrap({ l: "x", r: 3 });
        return o.l === "x" && o.r === 3;
      })()
    ).toBeTruthy();
    expect(
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
      })()
    ).toBeTruthy();
    expect(() => {
      const person = CT.CTObject({
        id: CT.isNumber,
        prop: { contract: CT.CTOr(CT.isString, CT.isBoolean), index: "string" },
      });
      const o = person.wrap({
        id: 23,
        name: "foo",
        firstname: "bar",
        alive: 23,
      });
      return o.id === 23 && o.name === "foo" && o.alive;
    }).toThrow(/CTOr neither applied.*\n.*blaming: pos/);
    expect(() => {
      const person = CT.CTObject({
        id: CT.isNumber,
        prop: { contract: CT.CTOr(CT.isString, CT.isBoolean), index: "number" },
      });
      const o = person.wrap({ id: 23, name: "foo", firstname: "bar" });
      return o.id === 23 && o.name === "foo";
    }).toThrow(/Object mismatch.*\n.*blaming: pos/);

    // check errors happen at the right time
    expect(() => {
      CT.CTObject({ x: notAContract });
    }).toThrow(/CTObject: not a contract/);

    expect(() => {
      CT.CTObject({ x: CT.isString, y: CT.isObject }).wrap({});
    }).toThrow(/Object mismatch, expecting "{x, y}"/);
  });
  test("Works with CTRec", () => {
    expect(() => {
      const t2 = CT.CTRec(() => CT.isString);
      const o2 = t2.wrap(undefined);
    }).toThrow(/blaming: pos/);
    expect(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap("x");
        return true;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap({ l: "x", r: "y" });
        return true;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        tree.wrap({ l: "x", r: { l: "y", r: "z" } });
        return true;
      })()
    ).toBeTruthy();
    expect(() => {
      const tree = CT.CTOr(
        CT.isString,
        CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
      );
      tree.wrap(undefined);
    }).toThrow(/blaming: pos/);
    expect(() => {
      const tree = CT.CTOr(
        CT.isString,
        CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
      );
      const o = tree.wrap({ l: "x", r: undefined });
      o.l;
      o.r;
    }).toThrow(/blaming: pos/);
    expect(
      (() => {
        const tree = CT.CTOr(
          CT.isString,
          CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
        );
        const o = tree.wrap({ l: "x", r: { l: undefined, r: "x" } });
        return o.l === "x";
      })()
    ).toBeTruthy();
    expect(() => {
      const tree = CT.CTOr(
        CT.isString,
        CT.CTObject({ l: CT.CTRec(() => tree), r: CT.CTRec(() => tree) })
      );
      const o = tree.wrap({ l: "x", r: { l: undefined, r: "x" } });
      o.l;
      o.r.l;
    }).toThrow(/blaming: pos/);
  });
  test("Works with CTArray", () => {
    expect(
      (() => {
        return 0 === CT.CTArray(CT.isNumber).wrap([]).length;
      })()
    ).toBeTruthy();
    expect(
      (() => {
        return 11 === CT.CTArray(CT.isNumber).wrap([11])[0];
      })()
    ).toBeTruthy();
    expect(() => {
      CT.CTArray(CT.isNumber).wrap(["string"])[0];
    }).toThrow(/blaming: pos/);
    expect(() => {
      CT.CTArray(CT.isNumber).wrap([11, "string", 22])[1];
    }).toThrow(/blaming: pos/);
    expect(
      (() => {
        return 22 === CT.CTArray(CT.isNumber).wrap([11, "string", 22])[2];
      })()
    ).toBeTruthy();
    // check errors happen at the right time
    expect(() => {
      CT.CTArray(notAContract);
    }).toThrow(/CTArray: not a contract/);
  });
  test("Works with CTAnd", () => {
    expect(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
        );
        function f(x, y) {
          return x + y;
        }
        const wf = plusCtc.wrap(f);
        return 3 === wf(1, 2);
      })()
    ).toBeTruthy();
    expect(
      (() => {
        const plusCtc = CT.CTAnd(
          CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
          CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
        );
        function f(x, y) {
          return x + y;
        }
        const wf = plusCtc.wrap(f);
        return "12" === wf("1", "2");
      })()
    ).toBeTruthy();
    expect(
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
      })()
    ).toBeTruthy();
    expect(
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
        return 5 === wf(2, 3);
      })()
    ).toBeTruthy();
    expect(
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
      })()
    ).toBeTruthy();

    expect(() => {
      const plusCtc = CT.CTAnd(
        CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
        CT.CTFunction(true, [CT.isString, CT.isString], CT.isString)
      );
      function f(x, y) {
        return x + y;
      }
      const wf = plusCtc.wrap(f);
      wf(1, "2");
    }).toThrow(/blaming: neg/);
    expect(() => {
      const plusCtc = CT.CTAnd(
        CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
        CT.CTFunction(true, [CT.isString, CT.isString], CT.isNumber)
      );
      function f(x, y) {
        return 3;
      }
      const wf = plusCtc.wrap(f);
      wf(1, "2");
    }).toThrow(/blaming: neg/);
    expect(() => {
      const plusCtc = CT.CTAnd(
        CT.CTFunction(true, [CT.isNumber, CT.isNumber], CT.isNumber),
        CT.CTFunction(true, [CT.isNumber, CT.isBoolean], CT.isNumber)
      );
      function f(x, y) {
        return 3;
      }
      const wf = plusCtc.wrap(f);
      wf(1, "2");
    }).toThrow(
      /Predicate `isBoolean' not satisfied for value `2'.*\n.*blaming: neg/
    );
  });
  test("Flat predicates work correctly", () => {
    expect(CT.isObject(null)).toBe(false);
    expect(() => CT.numberCT.wrap(3)).not.toThrow();
    expect(() => CT.nullCT.wrap(null)).not.toThrow();
    expect(() => {
      CT.arrayBufferCT.wrap(new ArrayBuffer());
    }).not.toThrow();
  });
});
