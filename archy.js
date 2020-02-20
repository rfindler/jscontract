/*=====================================================================*/
/*    serrano/prgm/project/hop/work/contract/benchs/archy.js           */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Fri Jul 12 12:45:28 2019 (serrano)                */
/*    Copyright   :  2019 Manuel Serrano                               */
/*    -------------------------------------------------------------    */
/*=====================================================================*/
"use strict";
const CT = require ("./contract.js");

/*---------------------------------------------------------------------*/
/*    archy                                                            */
/*---------------------------------------------------------------------*/
function archy (obj, prefix, opts) {
    var chr = function(s) {
        var chars = {
            '│' : '|',
            '└' : '`',
            '├' : '+',
            '─' : '-',
            '┬' : '-'
        };
        return opts.unicode === false ? chars[s] : s;
    };
    
    if (typeof obj === 'string') obj = { label : obj };
    
    var nodes = obj.nodes || [];
    var lines = (obj.label || '').split('\n');
    var splitter = '\n' + prefix + (nodes.length ? chr('│') : ' ') + ' ';
    
    return prefix
        + lines.join(splitter) + '\n'
        + nodes.map(function (node, ix) {
            var last = ix === nodes.length - 1;
            var more = node.nodes && node.nodes.length;
            var prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

            return prefix
                + (last ? chr('└') : chr('├')) + chr('─')
                + (more ? chr('┬') : chr('─')) + ' '
                + archy(node, prefix_, opts).slice(prefix.length + 2)
            ;
        }).join('')
};

const ctOpt = CT.CTObject( { unicode: CT.isBoolean } );
const ctNode = CT.CTOr( CT.isString, CT.isString,
			CT.isObject, CT.CTRec( () => ctData));
const ctData = CT.CTObject( { label: CT.isString, nodes: CT.CTArray( ctNode ) } );
const ctApi = CT.CTFunction( [ ctData, CT.isString, ctOpt ], CT.isString );

const ctarchy = ctApi.wrap( archy );

/*---------------------------------------------------------------------*/
/*    testing                                                          */
/*---------------------------------------------------------------------*/
const o = {
   label : 'beep\none\ntwo',
   nodes : [
      'ity',
      {
	 label : 'boop',
	 nodes : [
	    {
	       label : 'o_O\nwheee',
	       nodes : [
		  {
		     label : 'oh',
		     nodes : [ 'hello', 'puny\nmeat' ]
		  },
		  'creature'
	       ]
	    },
	    'party\ntime!'
	 ]
      }
      ]
};

const opt = { unicode: false };

function test( fun ) {
   var s = fun(o, "", opt );
   return s;
}

function bench( count, fun ) {
   console.log( "bench...", count );
   const n = count / 10;
   let r;
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < n; i++ ) {
	 r = test( fun );
      }
      console.log( j );
   }
   console.log( r );
   
   return r;
}

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
const TEST = process.argv[ 2 ] || "regular";
const N = parseInt( process.argv[ 3 ] || "100000" );

console.log( "./a.out [regular|contract] [iteration]" );
console.log( "runnning: ", TEST );

bench( N, TEST === "contract" ? ctarchy : archy );
