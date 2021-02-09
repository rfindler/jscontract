"use strict";
"use hopscript";

//import * as CT from "../../contract.js";
const CT = require( "../../contract.js" );

const abbrev = require( "./abbrev.js" );

const abbrevCT = CT.CTOr( 
   CT.CTFunction( CT.trueCT, [ CT.CTArray( CT.stringCT ) ], CT.objectCT ),
   CT.CTFunctionOpt( CT.trueCT, [ CT.stringCT ], CT.objectCT ) );

//export const abbrev_ct = abbrevCT.wrap( abbrev );
const abbrev_ct = abbrevCT.wrap( abbrev );

module.exports = abbrev_ct;
   
