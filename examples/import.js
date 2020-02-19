
const CT = require( "./../contract.js" );
const m = CT.CTimports( require( "./export.js" ), __filename );

console.log( m.o.a( 1 ) );
try {
   console.log( m.o.a( 2 ) );
} catch( e ) { 
   console.log( e );
}
try {
   console.log( m.o.a( "2" ) );
} catch( e ) {
   console.log( e );
}

