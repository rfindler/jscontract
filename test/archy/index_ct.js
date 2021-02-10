"use strict";
"use hopscript";

//import * as CT from "../../contract.js";
const CT = require( "../../contract.js" );

const archy = require( "./index.js" );

const archyDataCT = CT.CTRec( () => 
	    CT.CTObject( { label: CT.stringCT,
			   nodes: { contract: CT.CTArray( 
				       CT.CTOr( archyDataCT, CT.stringCT ) ), 
				    optional: true } } ) );

const archyOptionsCT = 
   CT.CTObject( { unicode: { contract: CT.booleanCT, optional: true } } );

const archyCT = CT.CTFunction( CT.trueCT, 
   [ CT.CTOr( archyDataCT, CT.stringCT ), CT.CTOr( CT.stringCT, CT.undefinedCT ), CT.CTOr( archyOptionsCT, CT.undefinedCT ) ], CT.stringCT )

const archy_ct = archyCT.wrap( archy );

module.exports = archy_ct;
