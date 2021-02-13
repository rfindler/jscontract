/*=====================================================================*/
/*    serrano/prgm/project/jscontract/tools/tstoc.js                   */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano & robby findler                    */
/*    Creation    :  Fri Feb 12 14:32:28 2021                          */
/*    Last change :                                                    */
/*    Copyright   :  2021 manuel serrano & robby finder                */
/*    -------------------------------------------------------------    */
/*    TypeScript declaration to Contract                               */
/*    -------------------------------------------------------------    */
/*    This module uses the TypeScript compiler AST API.                */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    module                                                           */
/*---------------------------------------------------------------------*/
import { readFileSync } from "fs";
import * as path from "path";
import * as _ts from "typescript";

const ts = _ts.default;

/*---------------------------------------------------------------------*/
/*    global options                                                   */
/*---------------------------------------------------------------------*/
const options = { 
   allowJS: true,
   module: "commonJS",
   autorequire: true,
   contractjs: "contract.js"
};

/*---------------------------------------------------------------------*/
/*    builtinTypes                                                     */
/*---------------------------------------------------------------------*/
const builtinTypes = {
   Error: "CT.errorCT"
};

/*---------------------------------------------------------------------*/
/*    NameSpaces                                                       */
/*---------------------------------------------------------------------*/
class NS {
   constructor( id, parent ) {
      this.id = id;
      this.parent = parent;
      this.namespaces = [];
      this.declarations = [];
      this.depth = 0;
      
      if( parent ) {
      	 parent.namespaces.push( this );
	 this.depth = parent.depth + 1;
      }
   }
 
   out( m ) {
      console.log( `${m}const __${this.id} = (function() {` );
      
      this.outDeclarations( m + "  " );
      
      console.log( `${m}})();` );
   }
   
   outDeclarations( m ) {
      // namespaces
      if( this.namespaces.length > 0 ) {
	 this.namespaces.forEach( ns => ns.out( m + "  " ) );
      }
	 
      // declarations
      const l = this.declarations.length;
      if( l > 0 ) {
	 this.declarations.forEach( (d, i) => {
	       console.log( `${m}const ${d.id}${d.tag} = ${d.toString()};` );
	    } );
	 
	 console.log( `${m}return {` );
	 this.declarations.forEach( (d, i) => {
	       console.log( `  ${m}${d.id}${d.tag}: ${d.id}${d.tag}${i === l - 1 ? "" : ","}` );
	    } );
	 console.log( `${m}};` );
      }
   }
   
   qname( name ) {
      if( this.parent ) {
      	 return `${this.id}.${name}`;
      } else {
      	 return name;
      }
   }
}

/*---------------------------------------------------------------------*/
/*    Module                                                           */
/*---------------------------------------------------------------------*/
class Module extends NS {
   constructor( id, filename ) {
      super( id, false );
      this.filename = filename;
      this.defexport = false;
   }
   
   out( m ) {
      console.log( "// file:", this.filename );
      
      // namespaces
      if( this.namespaces.length > 0 ) {
	 this.namespaces.forEach( ns => ns.out( "" ) );
      }
	 
      // declarations
      if( this.declarations.length > 0 ) {
	 this.declarations.forEach( d => {
      	       const decl = `const ${d.id}${d.tag} = ${d.toString()};`;
      	       
	       console.log( m + decl );
      	       console.log( "" );
      	    } );
      }

      // exports
      if( this.declarations.length > 0 ) {
	 if( options.module === "commonJS" ) {
	    this.declarations.forEach( d => {
		  if( d.export ) {
	       	     console.log( `exports.${d.id} = ${d.id}${d.tag};` );
		  }
	       } );
	 } else {
	    this.declarations.forEach( d => {
		  if( d.export ) {
	       	     console.log( `export exports.${d.id}.${d.tag} as ${d.id};` );
		  }
	       } );
      	 }
      }
      
      // default export
      if( this.defexport ) {
	 const defexport = `${this.defexport.id}${this.defexport.tag}`;
	 
      	 console.log( "// module exports" );
      	 if( options.module === "commonJS" ) {
	    console.log( `module.exports = ${defexport};` );
      	 } else {
	    console.log( `export default ${defexport};` );
      	 }
      }
   }
}

/*---------------------------------------------------------------------*/
/*    Decl ...                                                         */
/*---------------------------------------------------------------------*/
class Decl {
   constructor( id, ns, tag, obj ) {
      this.id = id;
      this.ns = ns;
      this.tag = tag;
      this.obj = obj;
      this.export = false;
   }
}

/*---------------------------------------------------------------------*/
/*    TypeDecl ...                                                     */
/*---------------------------------------------------------------------*/
class TypeDecl extends Decl {
   constructor( id, ns, obj ) {
      super( id, ns, "CT", obj );
   }
   
   toString() {
      return this.obj;
   }
}

/*---------------------------------------------------------------------*/
/*    FunDecl ...                                                      */
/*---------------------------------------------------------------------*/
class FunDecl extends Decl {
   constructor( id, ns, obj, exp ) {
      super( id, ns, "_ct", obj );
      this.export = exp;
   }
   
   toString() {
      return `${this.obj}.wrap( ${this.ns.qname( this.id ) } )`;
   }
}

/*---------------------------------------------------------------------*/
/*    CT ...                                                           */
/*---------------------------------------------------------------------*/
function CT( node, env, ns ) {
   switch( node.kind ) {
      case ts.SyntaxKind.FunctionDeclaration: 
	 if( node.name ) {
	    const id = nameToString( node.name );
	    const ct = functionCT( node, env );
	    const exp = node.modifies && node.modifiers.find( n => n.kind === ts.SyntaxKind.ExportKeyword );
	    const odecl = ns.declarations.find( d => d.id === id );

	    if( odecl ) {
	       odecl.ct = `CT.CTAnd( ${odecl.ct}, ${ct} )`;
	    } else {
	       ns.declarations.push( new FunDecl( id, ns, ct, exp ) );
	    }
	 }
	 break;
	 
      case ts.SyntaxKind.TypeAliasDeclaration: 
	 if( node.name ) {
	    const id = nameToString( node.name );
	    const descr = { rec: false };
	    const nenv = { [id]: descr, __proto__: env };
	    const ct = typeCT( node.type, nenv );
	    
	    ns.declarations.push( new TypeDecl( id, ns, descr.rec ? `CT.CTRec( () => ${ct} )` : ct ) );
	 }
	 break;
	 
      case ts.SyntaxKind.InterfaceDeclaration: 
	 if( node.name ) {
	    const id = nameToString( node.name );
	    const descr = { rec: false };
	    const nenv = { [id]: descr, __proto__: env };
	    const ct = intfCT( node, nenv );
	    
	    ns.declarations.push( new TypeDecl( id, ns, descr.rec ? `CT.CTRec( () => ${ct} )` : ct ) );
	 }
	 break;
	 
      case ts.SyntaxKind.ExportAssignment:
	 if( node.expression.kind === ts.SyntaxKind.Identifier ) {
	    const id = node.expression.escapedText;
	    const d = ns.declarations.find( d => d.id === id );
	    
	    if( d ) {
	       ns.defexport = d;
	    } else {
	       console.log( "// error, cannot find exported declaration", id );
	    }
	 }
	 return;
	    
      case ts.SyntaxKind.EndOfFileToken:
	 return;
	 
      case ts.SyntaxKind.ModuleDeclaration:
	 const nns = new NS( nameToString( node.name ), ns );

	 CT( node.body, {}, nns );
	 return;
	 
      case ts.SyntaxKind.ModuleBlock:
	 node.statements.forEach( s => CT( s, env, ns ) );
	 return;
	 
      default:
	 console.log( "// unhandled node type: " + ts.SyntaxKind[ node.kind ] );
   }
}

/*---------------------------------------------------------------------*/
/*    functionCT ...                                                   */
/*---------------------------------------------------------------------*/
function functionCT( node, env ) {
   const ctself = "CT.trueCT";
   const ctparams = node.parameters.map( p => paramCT( p, env ) );
   const ctret = typeCT( node.type, env );
   
   return `CT.CTFunction( ${ctself }, [ ${ctparams} ], ${ctret} )`;
}

/*---------------------------------------------------------------------*/
/*    paramCT ...                                                      */
/*---------------------------------------------------------------------*/
function paramCT( node, env ) {
   if( node.dotDotDotToken ) {
      return `{ contract: ${typeCT( node.type.elementType, env )}, dotdotdot: true }`;
   } else if( node.questionToken ) {
      return `{ contract: ${typeCT( node.type, env )}, optional: true }`;
   } else {
      return typeCT( node.type, env );
   }
}

/*---------------------------------------------------------------------*/
/*    nameToString ...                                                 */
/*---------------------------------------------------------------------*/
function nameToString( tname ) {
   switch( tname.kind ) {
      case ts.SyntaxKind.Identifier:
	 return tname.escapedText;
      case ts.SyntaxKind.QualifiedName:
	 return `__${nameToString( tname.left )}.${nameToString( tname.right ) }`;
      default:
	 return "";
   }
}

/*---------------------------------------------------------------------*/
/*    typeCT ...                                                       */
/*---------------------------------------------------------------------*/
function typeCT( node, env ) {
   if( !node.kind ) {
      return false;
   } else {
      switch( node.kind ) {
      	 case ts.SyntaxKind.AnyKeyword:
	    return "CT.anyCT";
      	 case ts.SyntaxKind.VoidKeyword:
	    return "CT.voidCT";
      	 case ts.SyntaxKind.NumberKeyword:
	    return "CT.numberCT";
      	 case ts.SyntaxKind.StringKeyword:
	    return "CT.stringCT";
      	 case ts.SyntaxKind.BooleanKeyword:
	    return "CT.booleanCT";
      	 case ts.SyntaxKind.ParenthesizedType:
	    return typeCT( node.type, env );
	 case ts.SyntaxKind.ArrayType:
	    return `CT.CTArray( ${typeCT( node.elementType, env )} )`;
      	 case ts.SyntaxKind.TypeLiteral:
	    return `CT.CTObject( { ${node.members.map( s => sigCT( s, env ) ).join( ", " )} } )`;
      	 case ts.SyntaxKind.UnionType:
	    return `CT.CTOr( ${node.types.map( t => typeCT( t, env ) ).filter( x => x )} )`;
      	 case ts.SyntaxKind.FunctionType:
	    return functionCT( node, env );
      	 case ts.SyntaxKind.TypeReference:
	    const id = nameToString( node.typeName );
	    if( env[ id ] ) { env[ id ].rec = true }
	    return builtinTypes[ id ] || `${id}CT`;
      	 default:
	    return `/* unknown type ${ts.SyntaxKind[ node.kind ]} */CT.trueCT`;
      }
   }
}

/*---------------------------------------------------------------------*/
/*    intfCT ...                                                       */
/*---------------------------------------------------------------------*/
function intfCT( node, env ) {
   return `CT.CTInterface( { ${node.members.map( s => sigCT( s, env ) ).join( ", " )} } )`;
}

/*---------------------------------------------------------------------*/
/*    typeName ...                                                     */
/*---------------------------------------------------------------------*/
function typeName( node, env ) {
   if( !node.kind ) {
      return false;
   } else {
      switch( node.kind ) {
      	 case ts.SyntaxKind.AnyKeyword:
	    return "true";
      	 case ts.SyntaxKind.NumberKeyword:
	    return "number";
      	 case ts.SyntaxKind.StringKeyword:
	    return "string";
      	 case ts.SyntaxKind.BooleanKeyword:
	    return "boolean";
      	 case ts.SyntaxKind.ParenthesizedType:
	    return typeCT( node.type, env );
      	 default:
	    return `/* unknown type ${ts.SyntaxKind[ node.kind ]} */"true"`;
      }
   }
}

/*---------------------------------------------------------------------*/
/*    sigCT ...                                                        */
/*---------------------------------------------------------------------*/
function sigCT( node, env ) {
   const ct = typeCT( node.type, env );
   
   switch( node.kind ) {
      case ts.SyntaxKind.PropertySignature:
	 if( node.questionToken ) {
	    return `"${nameToString( node.name )}": { contract: ${ct}, optional: true }`;
	 } else {
	    return `"${nameToString( node.name )}": ${ct}`;
      	 }
	 
      case ts.SyntaxKind.IndexSignature:
	 const param = node.parameters[ 0 ];
	 return `"${nameToString( param.name )}": { contract: ${ct}, index: "${typeName( param.type, env )}"  }`;
	 
      default:
	 return "sigCT" + ts.SyntaxKind[ node.type ];
   }
}

/*---------------------------------------------------------------------*/
/*    autorequire ...                                                  */
/*    -------------------------------------------------------------    */
/*    Try to guess a good "require" for that module.                   */
/*---------------------------------------------------------------------*/
function autorequire( file ) {
   if( file === "index.d.ts" ) {
      const basename = path.basename( process.cwd() );
      console.log( `const ${basename} = require( "./index.js" );` );
   } else {
      const basename = file.replace( /d.ts$/, "" );
      console.log( `const ${basename} = require( "./${basename}.js" );` );
   }
}

/*---------------------------------------------------------------------*/
/*    main ...                                                         */
/*---------------------------------------------------------------------*/
function main() {
   const files = process.argv.slice( 2 );
   const program = ts.createProgram( files, options );
   let checker = program.getTypeChecker();
   const file = program.getSourceFile( files[ 0 ] );
   const prog = new Module( "", file.file );
   
   ts.forEachChild( file, n => CT( n, {}, prog ) );
   
   console.log( '"use strict";' );
   console.log( '"use hopscript";' );
   
   console.log( "" );
   console.log( `const CT = require( "${options.contractjs}" );` );
   if( options.autorequire ) autorequire( file.fileName );
   console.log( "" );

   prog.out( "" );
}

main();
