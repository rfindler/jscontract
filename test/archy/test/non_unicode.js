const assert = require( "assert" );
var archy = require('../index_ct.js');

var s = archy({
      label : 'beep',
      nodes : [
        'ity',
        {
          label : 'boop',
          nodes : [
            {
              label : 'o_O',
              nodes : [
                {
                  label : 'oh',
                  nodes : [ 'hello', 'puny' ]
                },
                'human'
              ]
            },
            'party!'
          ]
        }
      ]
    }, '', { unicode : false });

assert.equal( s, [
		 'beep',
		 '--- ity',
		 '--- boop',
		 '  --- o_O',
		 '  - --- oh',
		 '  - - --- hello',
		 '  - - --- puny',
		 '  - --- human',
		 '  --- party!',
		 ''
		 ].join('\n'));

