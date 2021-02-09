/*=====================================================================*/
/*    serrano/prgm/project/jscontract/test.js                          */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Feb 18 17:29:10 2020                          */
/*    Last change :  Thu Feb 20 20:59:41 2020 (serrano)                */
/*    Copyright   :  2020 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Test suite for JS contracts                                      */
/*=====================================================================*/
"use strict";
"use hopscript";
const assert = require( "assert" );
const CT = require( "./contract.js" );

const not_a_contract = [57];

/*
 * predicates
 */
assert.ok( CT.isObject( {x : 3} ), "isObject.1" );
assert.ok( !CT.isObject( undefined ), "isObject.2" );
assert.ok( CT.isFunction( (x) => x ), "isFunction.1" );
assert.ok( !CT.isFunction( "a string" ), "isFunction.2" );
assert.ok( CT.isString( "3" ), "isString.1" );
assert.ok( !CT.isString( 3 ), "isString.2" );
assert.ok( CT.isBoolean( false ), "isBoolean.1" );
assert.ok( !CT.isBoolean( undefined ), "isBoolean.2" );
assert.ok( CT.isNumber( 3 ), "isNumber.1" );
assert.ok( !CT.isNumber( "a string" ), "isNumber.2" );


/*
 * CTFlat
 */
assert.ok( (() =>
	    3 === CTFlat(CT.isNumber).wrap(3)
	   ), "ctflat.1");
assert.throws( () => {
    CTFlat(CT.isNumber).wrap("3")
}, "ctflat.2");

/*
 * CTFunction
 */
assert.throws( () => {
      function f( x ) { return x + 1 };
      var wf = CT.CTFunction( true, [ CT.isString ], CT.isString ).wrap(f);
      wf(3);
      return true;
   }, "ctfunction.1.succeed" );
assert.ok( (() => {
      function f( x ) { return x + 1 };
      var wf = CT.CTFunction( CT.trueCT, [ CT.isString ], CT.isString ).wrap(f);
      wf("3");
      return true;
   })(), "ctfunction.1.fail" );
assert.throws( () => {
      function f( x ) { return 1 };
      var wf = CT.CTFunction( true, [ CT.isString ], CT.isString ).wrap(f);
      wf("3");
      return true;
   }, "ctfunction.2.fail" );
assert.throws( () => {
      function f( x ) { return "x" };
    var wf = CT.CTFunction( true, [ CT.isString, CT.isNumber ], CT.isString ).wrap(f);
    wf("3", "3");
      return true;
   }, "ctfunction.3.fail" );
assert.ok( (() => {
      function f( x ) { return "x" };
    var wf = CT.CTFunction( true, [ CT.isString, CT.isNumber ], CT.isString ).wrap(f);
    wf("3", 3);
      return true;
})(), "ctfunction.3.pass" );
assert.throws( () => {
    function f( x ) { return "x" };
    function hasg( x ) { return "g" in x; }
    var wf = CT.CTFunction( hasg , [ CT.isString, CT.isNumber ], CT.isString ).wrap(f);
    var o = { f : wf };
    o.f("3", 3);
    return true;
}, "ctfunction.4.fail" );
assert.ok( (() => {
      function f( x ) { return x + 1 };
      var wf = CT.CTFunction( true, [ 1 ], 2 ).wrap(f);
      wf(1);
      return true;
})(), "ctfunction.5.succeed" );
assert.ok( (() => {
      function f() { return "abc" };
      var wf = CT.CTFunction( CT.trueCT, [ ], CT.isString ).wrap(f);
      wf();
      return true;
})(), "ctfunction.6.succeed" );
assert.throws( () => {
      function f() { return "abc" };
      var wf = CT.CTFunction( CT.trueCT, [ ], 123 ).wrap(f);
      wf();
}, "ctfunction.6.fail" );

// check errors happen at the right time
assert.throws( () => {
    CT.CTFunction(true,[not_a_contract],true);
}, /CTFunction: not a contract/, "ctfunction.arg1-check");
assert.throws( () => {
    CT.CTFunction(true,[true],not_a_contract);
}, /CTFunction: not a contract/, "ctfunction.arg2-check");
assert.throws( () => {
    CT.CTFunction(not_a_contract,[true],true);
}, /CTFunction: not a contract/, "ctfunction.arg2-check");

/*
 * CTFunctionD
 */
assert.deepStrictEqual(CT.__topsort([]), [])
assert.deepStrictEqual(CT.__topsort([ { name : "x" }]), [0])
assert.deepStrictEqual(CT.__topsort([ { name : "x" }, { name : "y" }]), [0 , 1])
assert.deepStrictEqual(CT.__topsort([ { name : "x" }, { name : "y" , dep : ["x"] }]), [0 , 1])
assert.deepStrictEqual(CT.__topsort([ { name : "x" , dep : ["y"] },
				      { name : "y" }]),
		       [1 , 0])
assert.deepStrictEqual(CT.__topsort([ { name : "a" , dep : ["c"] },
				      { name : "b" },
				      { name : "c" , dep : [] },
				      { name : "d" },
				      { name : "e" , dep : ["f"] },
				      { name : "f" }]),
		       [2, 0, 1, 3, 5, 4])
assert.deepStrictEqual(CT.__topsort([ { name : "x" , dep : ["y"] },
				      { name : "y" , dep : ["x"] }]),
		       false)

assert.deepStrictEqual(CT.__find_depended_on([]), []);
assert.deepStrictEqual(CT.__find_depended_on([ { name : "x" , dep : ["y"] },
					       { name : "y" , dep : ["x"] }]),
		       [true, true]);
assert.deepStrictEqual(CT.__find_depended_on([ { name : "x" },
					       { name : "y" , dep : ["x"] }]),
		       [true, false]);
assert.deepStrictEqual(CT.__find_depended_on([ { name : "x" },
					       { name : "y" }]),
		       [false, false]);

assert.ok( (() => {
    function f( x ) { return "y" };
    const ctc = CT.CTFunctionD( [ { name : "x", ctc : CT.isString} ], CT.isString );
    const wf = ctc.wrap(f);
    return wf("x") === "y";
})(), "ctfunctiond.1" );
assert.ok( (() => {
    function f( x , y ) { return "y" };
    const ctc = CT.CTFunctionD( [ { name : "x", ctc : CT.isString } ,
				  { name : "y", ctc : CT.isNumber } ],
				CT.isString );
    const wf = ctc.wrap(f);
    return wf("x", 1) === "y";
})(), "ctfunctiond.2" );
assert.ok( (() => {
    function f( x , y ) { return "y" };
    const ctc = CT.CTFunctionD( [ { name : "x", ctc : CT.isNumber } ,
				  { name : "y", ctc : (deps) => (y) => deps.x < y , dep : ["x"] } ],
				CT.isString );
    const wf = ctc.wrap(f);
    return wf(1,2) === "y";
})(), "ctfunctiond.3" );
assert.ok( (() => {
    function f( x , y ) { return "y" };
    const ctc = CT.CTFunctionD( [ { name : "x", ctc : (deps) => (x) => x < deps.y , dep : ["y"]} ,
				  { name : "y", ctc : CT.isNumber } ],
				CT.isString );
    const wf = ctc.wrap(f);
    return wf(1,2) === "y";
})(), "ctfunctiond.4" );
// check errors happen at the right time
assert.throws( () => {
    CT.CTFunctionD([{name : "x", ctc : not_a_contract}],CT.isString);
}, /CTFunctionD: not a contract/, "ctfunctiond.arg-check");
assert.throws( () => {
    CT.CTFunctionD([{name : "x", ctc : CT.isString}], not_a_contract);
}, /CTFunctionD: not a contract/, "ctfunctiond.rng-check");

/*
 * CTOr
 */
assert.throws( () => {
      CT.CTOr( CT.isString, CT.isNumber ).wrap(undefined);
   }, "ctor.1" );
assert.ok( (() => {
      CT.CTOr( CT.isString, CT.isNumber ).wrap("x");
      return true;
   })(), "ctor.2" );
assert.ok( (() => {
      CT.CTOr( CT.isString, CT.isNumber ).wrap(3);
      return true;
   })(), "ctor.3" );
assert.ok( (() => {
    function f_(x) { return "x"; }
    const f =
	  CT.CTOr( CT.CTFunction( true, [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap(f_);
    f("x");
    return true;
   })(), "ctor.4" );
assert.throws( () => {
    const f =
	  CT.CTOr( CT.CTFunction( true, [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap((x) => 3);
    f("x");
   }, "ctor.5" );
assert.throws( () => {
    const f =
	  CT.CTOr( CT.CTFunction( true, [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap((x) => "x");
    f(3);
   }, "ctor.6" );

// check errors happen at the right time
assert.throws( () => {
    CT.CTOr(not_a_contract,true);
}, /CTOr: not a contract/, "ctor.arg1-check");
assert.throws( () => {
    CT.CTOr(true,not_a_contract);
}, /CTOr: not a contract/, "ctor.arg2-check");

/*
 * CTObject
 */
assert.ok( (() => {
    const tree =
       CT.CTObject({});
    const o = tree.wrap({});
    return true;
})(), "ctobject.1");
assert.throws( () => {
    const tree =
       CT.CTObject({ l: CT.isString, r: CT.isObject});
    const o = tree.wrap({l: "x", r: undefined});
    o.l;
    o.r
}, "ctobject.2");
assert.ok( (() => {
    const tree =
       CT.CTObject({ l: CT.isString, r: CT.isNumber});
    const o = tree.wrap({l: "x", r: 3});
    return o.l === "x" && o.r === 3;
})(), "ctobject.3");

// check errors happen at the right time
assert.throws( () => {
    CT.CTObject({x : not_a_contract});
}, /CTObject: not a contract/, "ctobject.arg-check");

assert.throws( () => {
    CT.CTObject({x : CT.isString, y : CT.isObject}).wrap({});
}, /Not an object {x, y}/, "ctojbect.tostring")

/*
 * CTRec
 */
assert.throws( () => {
    const t2 = CT.CTRec(() => CT.isString);
    const o2 = t2.wrap(undefined);
}, "ctrec.0");
assert.ok( (() => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    tree.wrap("x");
    return true;
   })(), "ctrec.1" );
assert.ok( (() => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    tree.wrap({l: "x", r: "y"});
    return true;
   })(), "ctrec.2" );
assert.ok( (() => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    tree.wrap({l: "x", r: {l: "y", r: "z"}});
    return true;
   })(), "ctrec.3" );
assert.throws( () => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    tree.wrap(undefined);
}, "ctrec.4");
assert.throws( () => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    const o = tree.wrap({l: "x", r: undefined});
    o.l;
    o.r
}, "ctrec.5");
assert.ok( (() => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    const o = tree.wrap({l: "x",r: {l: undefined, r: "x"}});
    return o.l === "x";
})(), "ctrec.6");
assert.throws( () => {
    const tree =
	  CT.CTOr( CT.isString,
		   CT.CTObject({ l: CT.CTRec(() => tree),
				 r: CT.CTRec(() => tree)}));
    const o = tree.wrap({l: "x",r: {l: undefined, r: "x"}});
    o.l;
    o.r.l;
}, "ctrec.7");

/*
 * CTArray
 */
assert.ok( (() => {
    return 0 === CT.CTArray(CT.isNumber).wrap([]).length;
})(),"ctarray.0")
assert.ok( (() => {
    return 11 === CT.CTArray(CT.isNumber).wrap([11])[0];
})(),"ctarray.1")
assert.throws( () => {
    CT.CTArray(CT.isNumber).wrap(["string"])[0];
},"ctarray.2")
assert.throws( () => {
    CT.CTArray(CT.isNumber).wrap([11,"string",22])[1];
},"ctarray.3")
assert.ok( (() => {
    return 22 === CT.CTArray(CT.isNumber).wrap([11,"string",22])[2];
})(),"ctarray.4")
// check errors happen at the right time
assert.throws( () => {
    CT.CTArray(not_a_contract);
}, /CTArray: not a contract/, "ctarray.arg-check");
