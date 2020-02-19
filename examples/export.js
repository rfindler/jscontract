
const CT = require( "./../contract.js" );

var o = { a: (x) => x === 1 ? x +1 : "nogood" };

const ctc = CT.CTObject( {a: CT.CTFunction( [ CT.isNumber ], CT.isNumber ) } );

exports.o = CT.CTexports( ctc, o, __filename );
