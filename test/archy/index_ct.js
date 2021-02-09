"use strict";
"use hopscript";

//import * as CT from "../../contract.js";
const CT = require( "../../contract.js" );

const archy = require( "./index.js" );

const archyDataCT = CT.CTRec( () => 
	    CT.CTOr( CT.CTObject( { label: CT.stringCT } ), 
   			       	  CT.CTObject( { label: CT.stringCT, nodes: CT.CTArray( CT.CTOr( archyDataCT, CT.stringCT ) ) } ) ) );

const archyOptionsCT = CT.CTOr( CT.CTObject( {} ), CT.CTObject( { unicode: CT.booleanCT } ) );

const archyCT = CT.CTFunction( CT.trueCT, 
   [ CT.CTOr( archyDataCT, CT.stringCT ), CT.CTOr( CT.stringCT, CT.undefinedCT ), CT.CTOr( archyOptionsCT, CT.undefinedCT ) ], CT.stringCT )

const archy_ct = archyCT.wrap( archy );

module.exports = archy_ct;
