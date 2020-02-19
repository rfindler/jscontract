/*=====================================================================*/
/*    serrano/prgm/project/jscontract/test.js                          */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Feb 18 17:29:10 2020                          */
/*    Last change :  Wed Feb 19 16:57:45 2020 (serrano)                */
/*    Copyright   :  2020 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Test suite for JS contracts                                      */
/*=====================================================================*/

const assert = require( "assert" );
const CT = require( "./contract.js" );

assert.ok( CT.isNumber( 3 ), "isNumber.1" );
assert.ok( !CT.isNumber( "a string" ), "isNumber.2" );

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



