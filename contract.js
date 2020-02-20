/*=====================================================================*/
/*    serrano/prgm/project/jscontract/contract.js                      */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Feb 18 17:19:39 2020                          */
/*    Last change :  Tue Feb 18 17:35:50 2020 (serrano)                */
/*    Copyright   :  2020 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Basic contract implementation                                    */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    CT                                                               */
/*---------------------------------------------------------------------*/
class CT {
   constructor( wrapper ) {
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
      throw new TypeError( "Illegal predicat: " + pred );
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
      return new CT( function( infot, infof ) {
	 return { t: mkWrapper( infot ), f: mkWrapper( infof ) }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTFunction ...                                                   */
/*---------------------------------------------------------------------*/
function CTFunction( domain, range ) {
   
   function map2( args, domain, key ) {
      let len = args.length;
      
      for( let i = 0; i < len; i++ ) {
	 args[ i ] = domain[ i ][ key ].ctor( args[ i ] );
      }
      
      return args;
   }

   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      return new CT( function( infot, infof ) {
	 const ri = CTapply( range, infot, infof );
	 const dis = domain.map( d => CTapply( d, infot, infof ) );
	 
	 function mkWrapper( info, ri, rik, dis, disk ) {
	    const handler = {
	       apply: function( target, self, args ) {
      	       	  if( args.length !== domain.length ) {
	 	     throw new TypeError( 
	    	     	"Wrong number of argument " + args.length + "/" + domain.length 
	    	     	+ ": " + info );
      	       	  } else {
	       	     switch( args.length ) {
		     	case 0:
		     	   return ri[ rik ].ctor( target.call( this, undefined ) );
		     	case 1:
		     	   return ri[ rik ].ctor( target.call( this, dis[ 0 ][ disk ].ctor( args[ 0 ] ) ) );
		     	default: 
		     	   return ri[ rik ].ctor( target.apply( this, map2( args, dis, disk ) ) );
	       	     }
	       	  }
	       }
	    }
	    return new CTWrapper( function( value ) {
	       if( typeof value === "function" ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError( 
		     "Not a function `" + value + "': " + info );
	       }
	    } );
	 }
	 
	 return { 
	    t: mkWrapper( infot, ri, "t", dis, "f" ),
	    f: mkWrapper( infof, ri, "f", dis, "t" )
	 }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTOr ...                                                         */
/*---------------------------------------------------------------------*/
function CTOr( lchoose, left, rchoose, right ) {
    return new CT( function( infot, infof ) {
	const ei_l = CTapply( left, infot, infof );
	const ei_r = CTapply( right, infot, infof );
	function mkWrapper( info, kt, kf ) {
      	    return new CTWrapper( function( value ) {
		const is_l = lchoose(value);
		const is_r = rchoose(value);
		var ei = undefined;
		if (is_l && is_r) ei = ei_l; // this is first-or/c, do we want or/c?
		if (is_l) ei = ei_l;
		if (is_r) ei = ei_r;
		if (!ei) {
		    throw new TypeError( 
	    	     	"CTOr neither applied: " + value 
	    	     	    + ": " + info );
		}
		return ei[kt].ctor(value);
	    })
	}
	return { 
	    t: mkWrapper( infot, "t", "f" ),
	    f: mkWrapper( infof, "f", "t" )
	}
    })
}

/*---------------------------------------------------------------------*/
/*    CTArray ...                                                      */
/*---------------------------------------------------------------------*/
function CTArray( element ) {
   return new CT( function( infot, infof ) {
      const ei = CTapply( element, infot, infof );

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
	    if( value instanceof Array ) {
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
function CTObject( fields ) {
   return new CT( function( infot, infof ) {
      const ei = {};
      
      for( let k in fields ) {
	 const ctc = fields[ k ];

	 ei[ k ] = CTapply( ctc, infot, infof );
      }
      
      function mkWrapper( info, ei, kt, kf ) {
      	 var handler = {
	    get: function( target, prop ) {
	       const ct = ei[ prop ];
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
	    if( value instanceof Object ) {
	       return new Proxy( value, handler );
	    } else {
	       throw new TypeError(
	       	  "Not an object `" + value + "' " + info );
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
function CTCoerce( obj ) {
   if( typeof obj === "function" ) {
      return CTCoerce( CTFlat( obj ) );
   } else if( obj === true ) {
      return CTCoerce( CTFlat( v => true ) );
   } else {
      if( obj instanceof CT ) {
	 return obj;
      } else {
	 throw new TypeError( 
	    "Not a contract `" + obj + "'" );
      }
   }
}
/*---------------------------------------------------------------------*/
/*    CTapply ...                                                      */
/*---------------------------------------------------------------------*/
function CTapply( ctc, infot, infof ) {
   return CTCoerce( ctc ).wrapper( infot, infof );
}

/*---------------------------------------------------------------------*/
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
function isObject( o ) { return (typeof o) === "object" }
function isFunction( o ) { return (typeof o) === "function" }
function isString( o ) { return (typeof o) === "string" }
function isBoolean( o ) { return (typeof o) === "boolean" }
function isNumber( o ) { return (typeof o) === "number" }
function True( o ) { return true }

/*---------------------------------------------------------------------*/
/*    exports                                                          */
/*---------------------------------------------------------------------*/
exports.CTObject = CTObject;
exports.CTOr = CTOr;
exports.CTFunction = CTFunction;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.True = True;

exports.CTexports = function( ctc, val, locationt ) {
   return (locationf) => ctc.wrap( val, locationt, locationf );
}

exports.CTimports = function( obj, location ) {
   let res = {};
   for( let k in obj ) {
      res[ k ] = obj[ k ]( location );
   }
   return res;
}
