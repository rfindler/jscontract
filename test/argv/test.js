
var argv = require( './argv_ct.js' );

argv.option({
    name: 'option',
    short: 'o',
    type: 'string',
    description: 'Defines an option for your script',
    example: "'script --opiton=value' or 'script -o value'"
});

console.log( argv.run([ '--option=123', '-o', '123' ]) );
