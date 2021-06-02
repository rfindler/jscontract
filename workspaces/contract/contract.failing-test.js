/* These are tests that are known to be failing; separate them out so that
   contract.test.js is still useful
 */

"use strict";
"use hopscript";
const assert = require("assert");
const CT = require("./contract.js");

assert.throws( 
   () => {
      const c1 = CT.CTFunction(true, [CT.CTArray(CT.isString)], CT.isString);
      const c2 = CT.CTFunction(true, [CT.isString], CT.isString);
      const c3 = CT.CTAnd(c1, c2);

      function f() {
   	 return "foo bar";
      }
      
      const ctf = c3.wrap(f);
      ctf();
   },
   /No function matches/,
   "ctand.8"
);


assert.throws( 
   () => {
      const c1 = CT.CTFunction(true, [CT.CTArray(CT.isString)], CT.isString);
      const c2 = CT.CTFunction(true, [{ contract: CT.isString, dotdotdot: true }], CT.isString);
      const c3 = CT.CTAnd(c1, c2);

      function f() {
   	 return "foo bar";
      }
      
      const ctf = c3.wrap(f);
      return typeof ctf() === "string";
   },
   /Function 2 matches/,
   "ctand.9"
);


/*
 * Promise
 */
// NB: this test case fails because we do not yet understand how to
// add contracts to promises, so leave it at the end of the file
// console.log("\nstarting failing test\n");
// assert.ok( (() => {
//    function open( string ) {
//       return new Promise( function( res, rej ) {
// 	 if( string.length > 0 ) {
// 	    res( string );
// 	 } else {
// 	    rej( string );
// 	 }
//       } );
//    }

//    const openCT = CT.CTFunction( CT.trueCT, [ CT.isString ],
//       CT.CTPromise( CT.isString, CT.isNumber ) );
//    const ctopen = openCT.wrap( open );

//    const x = ctopen( "foo" );
//    console.log("hi " + x);
//    x.then( v => console.log( "res=", v ) ); // ok

//    ctopen( "" ).then( v => 0, v => console.log( "rej=", v ) ); // wrong
// })(), "promise.1" )
