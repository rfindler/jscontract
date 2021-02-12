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
import * as _ts from "typescript";

const ts = _ts.default;

/*---------------------------------------------------------------------*/
/*    global options                                                   */
/*---------------------------------------------------------------------*/
const options = { 
   allowJS: true,
   module: "commonJS",
   contractjs: "../../contract.js"
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
      if( this.depth === 1 ) {
      	 console.log( `${m}const __${this.id} = {` );
      } else {
	 console.log( `__${this.id} : {` );
      }
      
      this.outDeclarations( m + " " );
      
      console.log( `${m}}` );
   }
   
   outDeclarations( m ) {
      // namespaces
      if( this.namespaces.length > 0 ) {
	 this.namespaces.forEach( ns => ns.out( m + " " ) );
      }
	 
      // declarations
      const l = this.declarations.length;
      if( l > 0 ) {
	 this.declarations.forEach( (d, i) => {
	       console.log( `${m}${d.id}CT: ${d.toString()}${i === l - 1 ? "" : ","}` );
	    } )
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
      this.export = false;
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
	       const id = d.id;
      	       const decl = `const ${id}CT = ${d.toString()};`;
      	       
      	       if( d.export && options.module === "commonJS" ) {
      	       	  console.log( m + decl );
	       	  console.log( `${m}exports.${id}CT = ${id}CT;` );
      	       } else if( d.export ) {
      	       	  console.log( `${m}export ${decl};` );
      	       } else {
      	       	  console.log( m + decl );
      	       }
      	       console.log( "" );
      	    } );
      }

      if( this.export ) {
      	 console.log( "// module exports" );
      	 if( options.module === "commonJS" ) {
	    console.log( `module.exports = ${this.export}CT;` );
      	 } else {
	    console.log( `export default ${this.export}CT;` );
      	 }
      }
   }
}

/*---------------------------------------------------------------------*/
/*    Decl ...                                                         */
/*---------------------------------------------------------------------*/
class Decl {
   constructor( id, ct ) {
      this.id = id;
      this.CT = ct;
      this.export = false;
   }
}

/*---------------------------------------------------------------------*/
/*    TypeDecl ...                                                     */
/*---------------------------------------------------------------------*/
class TypeDecl extends Decl {
   constructor( id, ct ) {
      super( id, ct );
   }
   
   toString() {
      return this.ct;
   }
}

/*---------------------------------------------------------------------*/
/*    FunDecl ...                                                      */
/*---------------------------------------------------------------------*/
class FunDecl extends Decl {
   constructor( id, ct, exp ) {
      super( id );
      this.ct = ct;
      this.export = exp;
   }
   
   toString() {
      return `${this.ct}.wrap( ${this.id} )`;
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
	       ns.declarations.push( new FunDecl( id, ct, exp ) );
	    }
	 }
	 break;
	 
      case ts.SyntaxKind.TypeAliasDeclaration: 
	 if( node.name ) {
	    const id = node.name.escapedText;
	    const descr = { rec: false };
	    const nenv = { [id]: descr, __proto__: env };
	    const ct = typeCT( node.type, nenv );
	    
	    ns.declarations.push( new TypeDecl( id, descr.rec ? `CT.CTRec( () => ${ct} )` : ct ) );
	 }
	 break;
	 
      case ts.SyntaxKind.InterfaceDeclaration: 
	 console.log( "// interface not implemented yet..." );
	 break;
	 
      case ts.SyntaxKind.ExportAssignment:
	 if( node.expression.kind === ts.SyntaxKind.Identifier ) {
	    ns.export = node.expression.escapedText;
	 }
	 return;
	    
      case ts.SyntaxKind.EndOfFileToken:
	 return;
	 
      case ts.SyntaxKind.ModuleDeclaration:
	 const nns = new NS( node.name.escapedText, ns );

	 CT( node.body, {}, nns );
	 return;
	 
      case ts.SyntaxKind.ModuleBlock:
	 node.statements.forEach( s => CT( s, env, ns ) );
	 return;
	 
      default:
	 console.log( "// unhandled node type: " + ts.SyntaxKind[ node.kind ] );
   }
}


function functionCT( node, env ) {
   const ctself = "CT.trueCT";
   const ctparams = node.parameters.map( p => paramCT( p, env ) );
   const ctret = typeCT( node.type, env );
   
   return `CT.CTFunction( ${ctself }, [ ${ctparams} ], ${ctret} )`;
}

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
	    return `${id}CT`;
      	 default:
	    return `/* unknown type ${ts.SyntaxKind[ node.kind ]} */CT.trueCT`;
      }
   }
}

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

function sigCT( node, env ) {
   const ct = typeCT( node.type, env );
   
   switch( node.kind ) {
      case ts.SyntaxKind.PropertySignature:
	 if( node.questionToken ) {
	    return `"${node.name.escapedText}": { contract: ${ct}, optional: true }`;
	 } else {
	    return `"${node.name.escapedText}": ${ct}`;
      	 }
	 
      case ts.SyntaxKind.IndexSignature:
	 const param = node.parameters[ 0 ];
	 return `"${param.name.escapedText}": { contract: ${ct}, index: "${typeName( param.type, env )}"  }`;
	 
      default:
	 return "sigCT" + ts.SyntaxKind[ node.type ];
   }
}

function dump( options ) {
   console.log( "// function declarations" );
}

/*---------------------------------------------------------------------*/
/*    main ...                                                         */
/*---------------------------------------------------------------------*/
function main() {
   const files = process.argv.slice( 2 );
   const program = ts.createProgram( files, options );
   let checker = program.getTypeChecker();
   const sourceFile = program.getSourceFile( files[ 0 ] );
   const prog = new Module( "", sourceFile.fileName );
   
   ts.forEachChild( sourceFile, n => CT( n, {}, prog ) );
   
   console.log( '"use strict";' );
   console.log( '"use hopscript";' );
   console.log( "" );
   console.log( `const CT = require( "${options.contractjs}" );` );
   console.log( "" );

   prog.out( "" );
}

main();
