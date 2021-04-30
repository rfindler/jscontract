"use strict";
"use hopscript";

const CT = require( "contract.js" );
const checksum = require( "./node_modules/checksum/checksum.js" );

// file: undefined
const __checksum = (function() {
  const ChecksumOptionsCT = CT.CTInterface( { "algorithm": { contract: CT.stringCT, optional: true } } );
  const file_ct = CT.CTFunction( CT.trueCT, [ CT.stringCT,CT.CTFunction( CT.trueCT, [ CT.errorCT,CT.stringCT ], CT.voidCT ) ], CT.voidCT ).wrap( checksum.file );
  return {
    ChecksumOptionsCT: ChecksumOptionsCT,
    file_ct: file_ct
  };
})();
const checksum_ct = CT.CTFunction( CT.trueCT, [ CT.anyCT,{ contract: __checksum.ChecksumOptionsCT, optional: true } ], CT.stringCT ).wrap( checksum );

// module exports
module.exports = checksum_ct;
