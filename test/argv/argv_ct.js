"use strict";
"use hopscript";

const argv = require( "./argv.js" );
const argvCT = require( "./argv.ct.js" );

module.exports = argvCT.wrap( argv );


