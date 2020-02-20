/*=====================================================================*/
/*    serrano/trashcan/app-root-path.js                                */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Wed Feb 19 14:44:44 2020 (serrano)                */
/*    Copyright   :  2019-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*=====================================================================*/
"use strict";
const CT = require ("./contract.js");

const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_DOT = 46;
const CHAR_UPPERCASE_A = 64;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_A = 97;
const CHAR_LOWERCASE_Z = 122;
const CHAR_COLON = 58;

function isPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}

// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (isPathSeparator(code))
      break;
    else
      code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== CHAR_DOT ||
            res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = '';
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
           if (res.length > 0) {
            res += `${separator}..`;
	   }
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
         if (res.length > 0) {
          res += separator + path.slice(lastSlash + 1, i); 
	 }
         else {
          res = path.slice(lastSlash + 1, i);
	 }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

const path = {
   dirname: function dirname(path)  {
      if (path.length === 0)
      	 return '.';
      const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      var end = -1;
      var matchedSlash = true;
      for (var i = path.length - 1; i >= 1; --i) {
      	 if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
               end = i;
               break;
            }
      	 } else {
            // We saw the first non-path separator
            matchedSlash = false;
      	 }
      }

      if (end === -1)
      	 return hasRoot ? '/' : '.';
      if (hasRoot && end === 1)
      	 return '//';
      return path.slice(0, end);
   },

   resolve: function resolve(path) {
      var resolvedPath = '';
      var resolvedAbsolute = false;

      // Skip empty entries
      if (path.length !== 0) {
	 resolvedPath = path + '/' + resolvedPath;
	 resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      }

      // At this point the path should be resolved to a full absolute path, but
      // handle relative paths to be safe (might happen when process.cwd() fails)

      // Normalize the path
      resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/',
	 isPosixPathSeparator);

      if (resolvedAbsolute) {
      	 if (resolvedPath.length > 0)
            return '/' + resolvedPath;
      	 else
         return '/';
      } else if (resolvedPath.length > 0) {
      	 return resolvedPath;
      } else {
      	 return '.';
      }
   },
   sep: '/',
   join: function join(dir,file) {
      return dir + "/" + file;
   }
}

const requireResolvejs = function() {
   // Dependencies
   //require('path');

   // Load global paths
   var globalPaths = [ '/home/serrano/.node_modules',
  		       '/home/serrano/.node_libraries',
  		       '/usr/lib/x86_64-linux-gnu/nodejs',
  		       '/usr/share/nodejs',
  		       '/usr/lib/nodejs' ];

   // Guess at NPM's global install dir
   var npmGlobalPrefix;
   if ('win32' === process.platform) {
      npmGlobalPrefix = path.dirname(process.execPath);
   } else {
      npmGlobalPrefix = path.dirname(path.dirname(process.execPath));
   }
   var npmGlobalModuleDir = path.resolve(npmGlobalPrefix, 'lib', 'node_modules');
   console.log( "npm=", npmGlobalModuleDir );

   // Save OS-specific path separator
   var sep = path.sep;

   // If we're in webpack, force it to use the original require() method
   var requireFunction = ("function" === typeof __webpack_require__ || "function" === typeof __non_webpack_require__)
      ? __non_webpack_require__
	   : require;

   // Resolver
   module.exports = function resolve(dirname) {
      // Check for environmental variable
      if (process.env.APP_ROOT_PATH) {
	 return path.resolve(process.env.APP_ROOT_PATH);
      }

      // Defer to Yarn Plug'n'Play if enabled
      if (process.versions.pnp) {
	 try {
	    var pnp = requireFunction('pnpapi');
	    return pnp.getPackageInformation(pnp.topLevel).packageLocation;
	 } catch (e) {}
      }

      // Defer to main process in electron renderer
      if ('undefined' !== typeof window && window.process && 'renderer' === window.process.type) {
	 try {
	    var remote = requireFunction('electron').remote;
	    return remote.require('app-root-path').path;
	 } catch (e) {}
      }

      // Defer to AWS Lambda when executing there
      if (process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV) {
	 return process.env.LAMBDA_TASK_ROOT;
      }

      var resolved = path.resolve(dirname);
      var alternateMethod = false;
      var appRootPath = null;

      // Make sure that we're not loaded from a global include path
      // Eg. $HOME/.node_modules
      //     $HOME/.node_libraries
      //     $PREFIX/lib/node
      globalPaths.forEach(function(globalPath) {
	 if (!alternateMethod && 0 === resolved.indexOf(globalPath)) {
	    alternateMethod = true;
	 }
      });

      // If the app-root-path library isn't loaded globally,
      // and node_modules exists in the path, just split __dirname
      var nodeModulesDir = sep + 'node_modules';
      if (!alternateMethod && -1 !== resolved.indexOf(nodeModulesDir)) {
	 var parts = resolved.split(nodeModulesDir);
	 if (parts.length) {
	    appRootPath = parts[0];
	    parts = null;
	 }
      }

      // If the above didn't work, or this module is loaded globally, then
      // resort to require.main.filename (See http://nodejs.org/api/modules.html)
      if (alternateMethod || null == appRootPath) {
	 appRootPath = path.dirname(require.main.filename);
      }

      // Handle global bin/ directory edge-case
      if (alternateMethod && -1 !== appRootPath.indexOf(npmGlobalModuleDir) && (appRootPath.length - 4) === appRootPath.indexOf(sep + 'bin')) {
	 appRootPath = appRootPath.slice(0, -4);
      }

      // Return
      return appRootPath;
   };
}

const lib = function(dirname) {
   //var path = require('path');
   var resolve = requireResolvejs;
   var appRootPath = dirname;

   var publicInterface = {
      resolve: function(pathToModule) {
	 return path.join(appRootPath, pathToModule);
      },

      require: function(pathToModule) {
	 return require(publicInterface.resolve(pathToModule));
      },

      toString: function() {
	 return appRootPath;
      },

      setPath: function(explicitlySetPath) {
	 appRootPath = path.resolve(explicitlySetPath);
	 publicInterface.path = appRootPath;
      },

      path: appRootPath
   };

   return publicInterface;
};

const root = lib(__dirname);

/*---------------------------------------------------------------------*/
/*    bench                                                            */
/*---------------------------------------------------------------------*/
const ctz = CT.CTObject( { z: CT.isString } );
const cty = CT.CTObject( { y: ctz } );
const ctx = CT.CTObject( { x: cty } );
const ctw = CT.CTObject( { w: ctx } );

function simpletest( root ) {
   const o = ctw.wrap( { w: { x: { y: { z: "zzz" } } } } );
}

function runtest( root ) {
   const p = root.path;
   root.resolve('../dir');
   root.toString();
   //root.require('app-root-path');
   root.setPath('C:\\app-root');
   root.setPath(p);
}
   
function testplain( ctroot, root ) {
   return runtest( root );
   return runtest( root );
}

function testcontract( ctroot, root ) {
   return runtest( ctroot );
   return runtest( ctroot );
}

function testmix( ctroot, root ) {
   runtest( ctroot );
   runtest( root );
}   

const ctApi = CT.CTObject( 
   { aaa: CT.CTFunction( [ CT.isString ], CT.isString ),
     resolve: CT.CTFunction( [ CT.isString ], CT.isString ),
     require: CT.CTFunction( [ CT.isString ], CT.isObject ),
     toString: CT.CTFunction( [ ], CT.isString ),
     setPath: CT.CTFunction( [ CT.isString ], CT.True ),
     path: CT.isString } );
			 

const ctroot = ctApi.wrap( root );

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
function main( name, n, testname ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   let test;
   
   switch( testname ) {
      case "mix": test = testmix; break;
      case "plain": test = testplain; break;
      default: test = testcontract;
   }
   
   console.log( name + " " + testname + " (", n, ")..." );
   
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < k; i++ ) {
      	 res = test( ctroot, root );
      }
      console.log( j );
   }

   console.log( "res=", res );
}
   
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 20
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 400000;

const TEST =
   ( process.argv.length >= 3 ? process.argv[ 3 ] : "mix"); 

main( "app-root-path", N, TEST );
