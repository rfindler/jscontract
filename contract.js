/*=====================================================================*/
/*    serrano/prgm/project/jscontract/contract.js                      */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Feb 18 17:19:39 2020                          */
/*    Last change :  Thu Feb 20 20:41:32 2020 (serrano)                */
/*    Copyright   :  2020-21 manuel serrano                            */
/*    -------------------------------------------------------------    */
/*    Basic contract implementation                                    */
/*=====================================================================*/
"use strict";
"use hopscript";

/* TODO:
    - make infot, infof into a blame object
*/

/*---------------------------------------------------------------------*/
/*    CT                                                               */
/*---------------------------------------------------------------------*/
class CT {
   constructor( firstOrder, wrapper ) {
      this.cache = {};
/*       this.wrapper = ( info ) => {                                  */
/* 	 if( this.cache[ info ] ) {                                    */
/* 	    return this.cache[ info ];                                 */
/* 	 } else {                                                      */
/* 	    const nv = wrapper( info );                                */
/* 	    this.cache[ info ] = nv;                                   */
/* 	    console.log( "adding to cache ", info );                   */
/* 	    return nv;                                                 */
/* 	 }                                                             */
/*       }                                                             */
      this.firstOrder = firstOrder;
      this.wrapper = wrapper;
   }
   
   wrap( value, locationt = true, locationf = false ) {
      const { t: tval, f: fval } = this.wrapper( locationt, locationf );
      return tval.ctor( value );
   }
}

/*---------------------------------------------------------------------*/
/*    CTwrapper ...                                                    */
/*---------------------------------------------------------------------*/
class CTWrapper {
   constructor( ctor ) {
      this.ctor = ctor;
   }
}

/*---------------------------------------------------------------------*/
/*    CTFlat ...                                                       */
/*---------------------------------------------------------------------*/
function CTFlat( pred ) {
   if( typeof pred !== "function" ) {
      throw new TypeError( "Illegal predicate: " + pred );
   } else {
      function mkWrapper( info ) {
	 return new CTWrapper( function( value ) {
	       if( pred( value ) ) {
	       	  return value;
	       } else {
	       	  throw new TypeError( 
		     "Predicate `" + pred.toString() + "' not satisfied for value `" + value + "': " + info );
	       }
	 } );
      }
      return new CT( pred, function( infot, infof ) {
	 return { t: mkWrapper( infot ), f: mkWrapper( infof ) }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    fixArity ...                                                     */
/*---------------------------------------------------------------------*/
function fixArity( f ) {
   return f.toString().match( /^[^(*]([^.]*)/ );
}

/*---------------------------------------------------------------------*/
/*    CTFunction ...                                                   */
/*---------------------------------------------------------------------*/
function CTFunction( self, domain, range ) {
   
   function map2( args, domain, key ) {
      let len = args.length;
      
      for( let i = 0; i < len; i++ ) {
	 args[ i ] = domain[ i ][ key ].ctor( args[ i ] );
      }
      
      return args;
   }

   function firstOrder( x ) {
      return typeof x === "function" && fixArity( x );
   }
   
   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      const coerced_si = CTCoerce( self, "CTFunction" );
      const coerced_dis = domain.map( d => CTCoerce( d, "CTFunction" ) );
      const coerced_ri = CTCoerce( range, "CTFunction" );
      
      return new CT( firstOrder, function( infot, infof ) {
         const si = coerced_si.wrapper( infot, infof );
         const dis = coerced_dis.map( d => d.wrapper( infot, infof ) );
         const ri = coerced_ri.wrapper( infot, infof );

	 function mkWrapper( info, si, sik, ri, rik, dis, disk ) {
	    const si_wrapper = si[ sik ];
	    const ri_wrapper = ri[ rik ];
	    const di0_wrapper = domain.length > 0 ? dis[ 0 ][ disk ] : undefined;
	    
	    const handler = {
	       apply: function( target, self, args ) {
      	       	  if( args.length !== domain.length ) {
	 	     throw new TypeError( 
	    	     	"Wrong number of argument " + args.length + "/" + domain.length 
	    	     	+ ": " + info );
      	       	  } else {
                     switch( args.length ) {
                     	case 0:
                           return ri_wrapper.ctor( target.call( si_wrapper.ctor( this ), undefined ) );
                     	case 1:
                           return ri_wrapper.ctor( target.call( si_wrapper.ctor( this ), di0_wrapper.ctor( args[ 0 ] ) ) );
                     	default:
                           return ri_wrapper.ctor( target.apply( si_wrapper.ctor( this ), map2( args, dis, disk ) ) );
	       	     }
	       	  }
	       }
	    }
	    return new CTWrapper( function( value ) {
	       if( firstOrder( value ) ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError( 
		     "Not a function `" + value + "': " + info );
	       }
	    } );
	 }
	 
	 return { 
	    t: mkWrapper( infot, si, "t", ri, "t", dis, "f" ),
	    f: mkWrapper( infof, si, "f", ri, "f", dis, "t" )
	 }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTFunctionOpt ...                                                */
/*---------------------------------------------------------------------*/
function CTFunctionOpt( self, domain, range ) {
   
   function map2opt( args, domain, key ) {
      let len = args.length;
      
      for( let i = 0; i < domain.length; i++ ) {
	 args[ i ] = domain[ i ][ key ].ctor( args[ i ] );
      }
      
      for( let i = domain.length; i < args.length; i++ ) {
	 args[ i ] = domain[ domain.length - 1 ][ key ].ctor( args[ i ] );
      }
      
      return args;
   }

   function firstOrder( x ) {
      return typeof x === "function" && !fixArity( x );
   }
   
   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      const coerced_si = CTCoerce( self, "CTFunction" );
      const coerced_dis = domain.map( d => CTCoerce( d, "CTFunction" ) );
      const coerced_ri = CTCoerce( range, "CTFunction" );
      
      return new CT( firstOrder, function( infot, infof ) {
         const si = coerced_si.wrapper( infot, infof );
         const dis = coerced_dis.map( d => d.wrapper( infot, infof ) );
         const ri = coerced_ri.wrapper( infot, infof );

	 function mkWrapper( info, si, sik, ri, rik, dis, disk ) {
	    const si_wrapper = si[ sik ];
	    const ri_wrapper = ri[ rik ];
	    
	    const handler = {
	       apply: function( target, self, args ) {
      	       	  if( args.length < domain.length ) {
	 	     throw new TypeError( 
	    	     	"Wrong number of argument " + args.length + "/" + domain.length 
	    	     	+ ": " + info );
      	       	  } else {
		     return ri_wrapper.ctor( target.apply( si_wrapper.ctor( this ), map2opt( args, dis, disk ) ) );
		  }
	       }
	    }
	    return new CTWrapper( function( value ) {
	       if( firstOrder( value ) ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError( 
		     "Not a function `" + value + "': " + info );
	       }
	    } );
	 }
	 
	 return { 
	    t: mkWrapper( infot, si, "t", ri, "t", dis, "f" ),
	    f: mkWrapper( infof, si, "f", ri, "f", dis, "t" )
	 }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTFunctionD ...                                                  */
/*---------------------------------------------------------------------*/
function CTFunctionD( domain, range , info_indy ) {
    
    function firstOrder( x ) {
	return typeof x === "function";
    }
    
    if( !(domain instanceof Array) ) {
	throw new TypeError( "Illegal domain: " + domain );
    }
    for( let i = 0; i < domain.length; i++ ) {
	if (!domain[i])
	    throw new TypeError( "Illegal domain entry at index " + i + ": " + domain[i] );
	if (!domain[i].ctc)
	    throw new TypeError( "Illegal domain entry at index " + i + ", no ctc field: " + domain[i] );
	if (!domain[i].name)
	    throw new TypeError( "Illegal domain entry at index " + i + ", no name field: " + domain[i] );
    }
    const dep_order_to_arg_order = topsort(domain);
    const depended_on = find_depended_on(domain);

    const domain_ctcs = [];
    for( let i = 0; i < domain.length; i++ ) {
	const d = domain[i];
	if (!d.dep)
            domain_ctcs[i] = CTCoerce(d.ctc , "CTFunctionD");
    }
    const range_ctc = CTCoerce(range , "CTFunctionD");

    return new CT( firstOrder, function( infot, infof ) {
	const normal_dis = [];
	const dep_dis = [];
	for( let i = 0; i < domain.length; i++ ) {
	    const d = domain[i];
	    if (!d.dep) {
		normal_dis[i] = domain_ctcs[i].wrapper( infot, infof );
		if (depended_on[i]) {
		    dep_dis[i] = domain_ctcs[i].wrapper( infot, infof );
		}
	    }
	}
	const ri = range_ctc.wrapper( infot, infof );


	function mkWrapper( info, rik, disk ) {
	    const handler = {
		apply: function( target, self, args ) {
      	       	    if( args.length !== domain.length ) {
	 		throw new TypeError( 
	    	     	    "Wrong number of argument " + args.length + "/" + domain.length 
	    	     		+ ": " + info );
      	       	    } else {
			var wrapped_args_for_dep = {} // what happens if the dependent code modifies this thing?
			var wrapped_args = [];
			for( let dep_i = 0; dep_i < domain.length; dep_i++ ) {
			    let arg_i = dep_order_to_arg_order[dep_i];
			    if (domain[arg_i].dep) {
				if (depended_on[arg_i]) {
				    const ctc_for_dep = domain[arg_i].ctc(wrapped_args_for_dep);
				    const di_for_dep = CTDepApply(ctc_for_dep, infot, info_indy, "CTFunctionD");
				    wrapped_args_for_dep[domain[arg_i].name] = di_for_dep[disk].ctor(args[arg_i]);
				}
				// wrapped_args_for_dep has one item too many in it
				// at this point; due to previous assignment
				const ctc = domain[arg_i].ctc(wrapped_args_for_dep); 
				const di = CTDepApply(ctc, infot, info_indy, "CTFunctionD");
				wrapped_args[arg_i] = di[disk].ctor(args[arg_i]);
			    } else {
				if (depended_on[arg_i]) {
				    wrapped_args_for_dep[domain[arg_i].name] = dep_dis[arg_i][disk].ctor(args[arg_i]);
				}
				wrapped_args[arg_i] = normal_dis[arg_i][disk].ctor(args[arg_i]);
			    }
			}

			// skiped the post-condition contract (for now); it would be something like
			// ri[ rik ].ctor(<<result>>)
			return target.apply(this, wrapped_args);
	       	    }
		}
	    }
	    return new CTWrapper( function( value ) {
		if( firstOrder( value ) ) {
	       	    return new Proxy( value, handler );
		} else {
	       	    throw new TypeError( 
			"Not a function `" + value + "': " + info );
		}
	    } );
	}
	
	return { 
	    t: mkWrapper( infot, "t", "f" ),
	    f: mkWrapper( infof, "f", "t" )
	}
    } );
}

function CTDepApply( ctc, infot, infof, who ) {
    return CTCoerce( ctc, who ).wrapper( infot, infof );
}


function topsort( orig_domain ) {

    const name_to_id = [];
    for( let i = 0; i < orig_domain.length; i++ ) {
	name_to_id[orig_domain[i].name] = i;
    }

    // make a copy of the input objects so we can modify
    // them (by adding the temporary and permanent marks)
    const domain = orig_domain.slice();
    for( let i = 0; i < domain.length; i++ ) {
	function cmp (x , y) { return name_to_id[x.name] < name_to_id[y.name]; }
	domain[i] = { name : domain[i].name,
		      dep : (domain[i].dep) ?
		      domain[i].dep.slice().sort(cmp) : [],
		      temporary_mark : false,
		      permanent_mark : false };
    }

    let cycle = false;
    const result = [];

    function visit( node ) {
	if (node.permanent_mark) {
	    return;
	}
	if (node.temporary_mark) {
	    cycle = true;
	    return;
	}
	node.temporary_mark = true;
	if (node.dep) {
	    for( let i = 0; i < node.dep.length; i++ ) {
		visit(domain[name_to_id[node.dep[i]]]);
	    }
	}
	node.temporary_mark = false;
	node.permanent_mark = true;
	result.push(node);
    }

    const unmarked = domain.slice();
    while (unmarked.length != 0 && !cycle) {
	if (unmarked[0].permanent_mark) {
	    unmarked.shift();
	} else {
	    visit(unmarked[0])
	}
    }
    if (cycle) return false;

    for( let i = 0; i < result.length; i++ ) {
	result[i] = name_to_id[result[i].name];
    }
    return result;
}

function find_depended_on(domain) {
    const result = [];
    const name_to_id = [];
    for( let i = 0; i < domain.length; i++ ) {
	name_to_id[domain[i].name] = i;
	result[i] = false;
    }
    for( let i = 0; i < domain.length; i++ ) {
	const dep = domain[i].dep;
	if (dep) {
	    for (let j = 0; j < dep.length; j++) {
		result[name_to_id[dep[j]]] = true;
	    }
	}
    }

    return result;
}

/*---------------------------------------------------------------------*/
/*    CTRec ...                                                        */
/*---------------------------------------------------------------------*/
function CTRec( thunk ) {
   let _thunkctc = false;
   
   function mthunk() {
      if( !_thunkctc ) {
	  _thunkctc = CTCoerce( thunk() , "CTRec" );
      }
      
      return _thunkctc;
   }
   
   function firstOrder( x ) {
      return mthunk().firstOrder( x );
   }
   
   return new CT( firstOrder, 
      function( infot, infof ) {
         let ei = false;
      	 function mkWrapper( info, kt ) {
	    return new CTWrapper( function( value ) {
	       if (!ei) ei = mthunk().wrapper( infot, infof );
	       return ei[kt].ctor(value);
	    })}
      	 return { 
	    t: mkWrapper( infot, "t" ),
	    f: mkWrapper( infof, "f" )
      	 }
      });
}

/*---------------------------------------------------------------------*/
/*    CTOr ...                                                         */
/*---------------------------------------------------------------------*/
function CTOrExplicitChoice( lchoose, left, rchoose, right ) {
    return new CT( x => lchoose( x ) || rchoose( x ),
      function( infot, infof ) {
         const ei_l = left.wrapper( infot, infof );
         const ei_r = right.wrapper( infot, infof );
	 function mkWrapper( info, kt ) {
      	    return new CTWrapper( function( value ) {
	       const is_l = lchoose(value);
	       const is_r = rchoose(value);
	       if (is_l) return ei_l[kt].ctor(value);
	       if (is_r) return ei_r[kt].ctor(value);
               throw new TypeError(
		   "CTOr neither applied: " + value
		       + ": " + info );
	    })}
	 return { 
	    t: mkWrapper( infot, "t" ),
	    f: mkWrapper( infof, "f" )
	 }
      });
}

function CTOr( left, right ) {
   const lc = CTCoerce( left, "CTOr" );
   const rc = CTCoerce( right, "CTOr" );
   
   return CTOrExplicitChoice( lc.firstOrder, lc, rc.firstOrder, rc );
}
   
/*---------------------------------------------------------------------*/
/*    CTArray ...                                                      */
/*---------------------------------------------------------------------*/
function CTArray( element ) {
   function firstOrder( x ) {
      return x instanceof Array;
   }
   
   const element_ctc = CTCoerce( element,  "CTArray" );
   
   return new CT( firstOrder,
      function( infot, infof ) {
         const ei = element_ctc.wrapper( infot, infof );

      	 function mkWrapper( info, ei, kt, kf ) {
      	    const handler = {
	       get: function( target, prop ) {
	       	  if( prop.match( /^[0-9]+$/ ) ) {
               	     return ei[ kt ].ctor( target[ prop ] );
            	  } else {
	       	     return target[ prop ];
	    	  }
	       },
	       set: function( target, prop, newval ) {
	    	  if( prop.match( /^[0-9]+$/ ) ) {
                     target[ prop ] = ei[ kf ].ctor( newval );
            	  } else {
	       	     target[ prop ] = newval;
	    	  }
	    	  return true;
	       }
      	    };
	    
      	    return new CTWrapper( function( value ) {
	       if( firstOrder( value ) ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError(
	       	     "Not an array `" + value + "' " + info );
	       }
      	    } );
      	 }
      	 
      	 return { 
	    t: mkWrapper( infot, ei, "t", "f" ),
	    f: mkWrapper( infof, ei, "f", "t" )
      	 }
      } );
}

/*---------------------------------------------------------------------*/
/*    CTObject ...                                                     */
/*---------------------------------------------------------------------*/
function CTObject( ctfields ) {
   
   let stringIndexContract = false, numberIndexContract = false;
   let fields = {};
   
   for( let k in ctfields ) {
      const p = ctfields[ k ];
      if( "contract" in p ) {
	 if( p.index === "string" ) {
	    stringIndexContract = CTCoerce( p.contract, "CTObject" );
	 } else if( p.index === "number" ) {
	    numberIndexContract = CTCoerce( p.contract, "CTObject" );
	 } else {
	    fields[ k ] = { 
	       contract: CTCoerce( p.contract, "CTObject" ), 
	       optional: p.optional 
	    }
	 }
      } else {
	 fields[ k ] = { contract: CTCoerce( p, "CTObject" ) };
      } 
   }
   
   function firstOrder( x ) {
      if( x instanceof Object ) {
	 for( let n in fields ) { 
	    if( !(n in x) && (!fields[ n ].optional) ) return false;
	 }
	 
      	 for( let n in x ) {
	    if( n !== "__private" ) {
	       if( !(n in fields) ) {
	       	  if( typeof( n ) === "string" && !stringIndexContract ) {
		     return false;
	       	  }
	       	  if( typeof( n ) === "number" && !numberIndexContract ) {
		     return false;
	       	  }
	       }
	    }
      	 }
	 
	 return true;
      } else {
	 return false;
      }
   }
   
   function toString( fields ) {
      let res = "";
      let sep = "{";
      
      for( let n in fields ) {
	 res += sep + n;
	 sep = ", ";
      }
      
      if( sep === "{" ) {
	 return "{}";
      } else {
      	 return res + "}";
      }
   }
	 
   return new CT( firstOrder, 
      function( infot, infof ) {
      	 const ei = {};
	 const eis = stringIndexContract && 
	    stringIndexContract.wrapper( infot, infof );
	 const ein = numberIndexContract && 
	    numberIndexContract.wrapper( infot, infof );

	 for( let k in fields ) {
	    const ctc = fields[ k ].contract;

	    ei[ k ] = ctc.wrapper( infot, infof );
      	 }
      	 
	 function mkWrapper( info, ei, kt, kf ) {
	    var handler = {
	       get: function( target, prop ) {
		  const ct = ei[ prop ] 
		     || typeof( prop ) === "string" && eis
		     || typeof( prop ) === "number" && ein
			 
                  const priv = target.__private;
		  const cache = priv[ prop ];
		   
		  if( ct ) { 
		     if( cache ) {
			return cache;
		     } else {
			const cv = ct[ kt ].ctor( target[ prop ] );
			priv[ prop ] = cv;
			return cv;
		     }
		  } else {
		     return target[ prop ];
		  }
	       },
	       set: function( target, prop, newval ) {
		  const ct = ei[ prop ];
		  if( ct ) { 
		     priv[ prop ] = false;
		     target[ prop ] = ct[ kf ].ctor( newval );
		  } else {
		     target[ prop ] = newval;
		  }
		  return true;
	       }
	    }
      	     
	    return new CTWrapper( function( value ) {
	       value.__private = {};
	       
	       if( firstOrder( value ) ) {
		  return new Proxy( value, handler );
	       } else {
		  throw new TypeError(
		     `Object missmatch, expecting "${toString( fields )}", got "${toString( value )}" ${info}` );
	       }
	    } );
      	  }
      	 
      	 return {
	    t: mkWrapper( infot, ei, "t", "f" ),
	    f: mkWrapper( infof, ei, "f", "t" )
      	 }
      } );
}

/*---------------------------------------------------------------------*/
/*    CTCoerce ...                                                     */
/*---------------------------------------------------------------------*/
function CTCoerce( obj, who ) {
   if( typeof obj === "function" ) {
       return CTCoerce( CTFlat( obj ) , who);
   } else if( obj === true ) {
       return CTCoerce( CTFlat( v => true ) , who);
   } else if( isNumber(obj) ) {
       return CTCoerce( CTFlat( v => obj === v ) , who);
   } else {
      if( obj instanceof CT ) {
	 return obj;
      } else {
	 throw new TypeError( 
	     (who ? (who + ": ") : "") +
	     "not a contract `" + obj + "'" );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
const booleanCT = new CTFlat( o => (typeof o) === "boolean" );
const objectCT = new CTFlat( o => (typeof o) === "object" );
const stringCT = new CTFlat( o => (typeof o) === "string" );
const trueCT = new CTFlat( o => true );
const undefinedCT = new CTFlat( o => o === undefined );

function isObject( o ) { return (typeof o) === "object" }
function isFunction( o ) { return (typeof o) === "function" }
function isString( o ) { return (typeof o) === "string" }
function isBoolean( o ) { return (typeof o) === "boolean" }
function isNumber( o ) { return (typeof o) === "number" }
function True( o ) { return true }

/*---------------------------------------------------------------------*/
/*    exports                                                          */
/*---------------------------------------------------------------------*/
exports.booleanCT = booleanCT;
exports.objectCT = objectCT;
exports.stringCT = stringCT;
exports.trueCT = trueCT;
exports.undefinedCT = undefinedCT;

exports.CTObject = CTObject;
exports.CTOr = CTOr;
exports.CTRec = CTRec;
exports.CTFunction = CTFunction;
exports.CTFunctionOpt = CTFunctionOpt;
exports.CTFunctionD = CTFunctionD;
exports.CTArray = CTArray;

exports.isObject = isObject;
exports.isFunction = isFunction;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.True = True;

// exported for the test suite only
exports.__topsort = topsort;
exports.__find_depended_on = find_depended_on;

exports.CTexports = function( ctc, val, locationt ) {
    return (locationf) =>
	CTCoerce(ctc, "CTExports " + locationt)
	.wrap( val, locationt, locationf );
}

exports.CTimports = function( obj, location ) {
   let res = {};
   for( let k in obj ) {
      res[ k ] = obj[ k ]( location );
   }
   return res;
}
