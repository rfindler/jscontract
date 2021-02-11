"use strict";
"use hopscript";

const CT = require( "../../contract.js" );


// argv.d.ts
const argsCT = CT.CTObject( { "targets": CT.CTArray( CT.stringCT ), 
			      "options": CT.CTObject( { "key": { contract: CT.anyCT, 
								 index: "string"  } } ) } );

const helpOptionCT = CT.CTObject( { "name": CT.stringCT, 
				    "type": CT.CTOr( CT.stringCT, CT.CTFunction( CT.anyCT, [ CT.anyCT, CT.anyCT, CT.anyCT, CT.anyCT ],  CT.anyCT ) ),
				    "short": { contract: CT.stringCT, optional: true },
				    "description": { contract: CT.stringCT, optional: true },
				    "example": { contract: CT.stringCT, optional: true } } );

const moduleCT = CT.CTObject( { "mod": CT.stringCT, 
				"description": CT.stringCT, 
				"options": CT.CTObject( { "key": { contract: helpOptionCT, index: "string"  } } ) } );

const typeFunctionCT = CT.CTFunction( CT.trueCT, [ CT.anyCT,{ contract: CT.anyCT, dotdotdot: true } ], CT.anyCT );
const argvCT = CT.CTRec( () => CT.CTObject( 
			  { "run": CT.CTFunction( CT.trueCT, [ { contract: CT.CTArray( CT.stringCT ), optional: true } ], argsCT ), 
			    "option": CT.CTFunction( CT.trueCT, [ CT.CTOr( helpOptionCT,CT.CTArray( helpOptionCT ) ) ], argvCT ), 
			    "mod": CT.CTFunction( CT.trueCT, [ CT.CTOr( moduleCT,CT.CTArray( moduleCT ) ) ], argvCT ), 
			    "type": CT.CTFunction( CT.trueCT, [ CT.CTOr( CT.stringCT,CT.CTObject( { "key": { contract: typeFunctionCT, index: "string"  } } ) ),{ contract: typeFunctionCT, optional: true } ], CT.anyCT ), 
			    "version": CT.CTFunction( CT.trueCT, [ CT.stringCT ], argvCT ), 
			    "info": CT.CTFunction( CT.trueCT, [ CT.stringCT,{ contract: moduleCT, optional: true } ], argvCT ), 
			    "clear": CT.CTFunction( CT.trueCT, [  ], argvCT ), 
			    "help": CT.CTFunction( CT.trueCT, [ { contract: CT.stringCT, optional: true } ], argvCT ),
 			    "*": { contract:CT.anyCT, index: "string" } } ) );
// unhandled node type: FirstStatement
// unhandled node type: ExportAssignment

const argv = require( "./argv.js" );

module.exports = argvCT.wrap( argv );


