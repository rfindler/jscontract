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

assert.ok( CT.isNumber( 3 ), "isNumber.1" );
assert.ok( !CT.isNumber( "a string" ), "isNumber.2" );
assert.ok( CT.isFunction( (x) => x ), "isFunction.1" );
assert.ok( !CT.isFunction( "a string" ), "isFunction.2" );

assert.throws( () => {
      function f( x ) { return x + 1 };
      var wf = CT.CTFunction( [ CT.isString ], CT.isString ).wrap(f);
      wf(3);
      return true;
   }, "ctfunction.1.succeed" );
assert.ok( (() => {
      function f( x ) { return x + 1 };
      var wf = CT.CTFunction( [ CT.isString ], CT.isString ).wrap(f);
      wf("3");
      return true;
   })(), "ctfunction.1.fail" );
assert.throws( () => {
      function f( x ) { return 1 };
      var wf = CT.CTFunction( [ CT.isString ], CT.isString ).wrap(f);
      wf("3");
      return true;
   }, "ctfunction.2.fail" );

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
    const f =
	  CT.CTOr( CT.CTFunction( [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap((x) => "x");
    f("x");
    return true;
   })(), "ctor.4" );
assert.throws( () => {
    const f =
	  CT.CTOr( CT.CTFunction( [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap((x) => 3);
    f("x");
   }, "ctor.5" );
assert.throws( () => {
    const f =
	  CT.CTOr( CT.CTFunction( [ CT.isString ], CT.isString ),
		   CT.isNumber ).wrap((x) => "x");
    f(3);
   }, "ctor.6" );

assert.throws( () => {
    const tree =
       CT.CTObject({ l: CT.isString, r: CT.isObject});
    const o = tree.wrap({l: "x", r: undefined});
    o.l;
    o.r
}, "ctobject.1");

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


