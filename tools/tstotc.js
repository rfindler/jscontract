import { readFileSync } from "fs";
import * as _ts from "typescript";

const ts = _ts.default;

const options = { 
   allowJS: true,
   module: "commonJS",
};

export function tc( files, options ) {
   const program = ts.createProgram( files, options );
   let checker = program.getTypeChecker();
   const sourceFile = program.getSourceFile( files[ 0 ] );
   
   console.log( "//", sourceFile.fileName );
      
   ts.forEachChild( sourceFile, CT );
}

function exportCT( id, ct, options ) {
   if( options.module === "commonJS" ) {
      return `module.exports.${id} = ${ct};`;
   } else {
      return `export const ${id} = ${ct};`;
   }
}

function CT( node ) {
   switch( node.kind ) {
      case ts.SyntaxKind.FunctionDeclaration: 
	 if( node.name ) {
	    const id = node.name.escapedText;
	    const ct = functionCT( node ) + `.wrap( ${id} );`;
	    
	    console.log( exportCT( id, ct, options ) );
	 }
	 break;
	 
      case ts.SyntaxKind.TypeAliasDeclaration: 
	 if( node.name ) {
	    const id = node.name.escapedText;
	
    	    console.log( `const ${id}CT = ${typeCT( node.type )};` );
	 }
	 break;
	 
      case ts.SyntaxKind.EndOfFileToken:
	 return;
	 
      default:
	 console.log( "// unhandled node type: " + ts.SyntaxKind[ node.kind ] );
   }
}

function functionCT( node ) {
   const ctself = "CT.trueCT";
   const ctparams = node.parameters.map( p => typeCT( p.type ) ).toString();
   const ctret = typeCT( node.type );
   
   return `CT.CTFunction( ${ctself }, [ ${ctparams} ], ${ctret} )`;
}

function typeCT( node ) {
   if( !node.kind ) {
      return false;
   } else {
      switch( node.kind ) {
      	 case ts.SyntaxKind.AnyKeyword:
	    return "CT.anyCT";
      	 case ts.SyntaxKind.NumberKeyword:
	    return "CT.numberCT";
      	 case ts.SyntaxKind.StringKeyword:
	    return "CT.stringCT";
      	 case ts.SyntaxKind.BooleanKeyword:
	    return "CT.booleanCT";
      	 case ts.SyntaxKind.ParenthesizedType:
	    return typeCT( node.type );
	 case ts.SyntaxKind.ArrayType:
	    return `CT.CTArray( ${typeCT( node.elementType )} )`;
      	 case ts.SyntaxKind.TypeLiteral:
	    return `CT.CTObject( { ${node.members.map( sigCT ).join( "; " )} } )`;
      	 case ts.SyntaxKind.UnionType:
	    return `CT.CTOr( ${node.types.map( typeCT ).filter( x => x )} )`;
      	 case ts.SyntaxKind.FunctionType:
	    return functionCT( node );
      	 case ts.SyntaxKind.TypeReference:
	    return `${node.typeName.escapedText}CT`;
      	 default:
	    return `/* unknown type ${ts.SyntaxKind[ node.kind ]} */CT.trueCT`;
      }
   }
}

function typeName( node ) {
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
	    return typeCT( node.type );
      	 default:
	    return `/* unknown type ${ts.SyntaxKind[ node.kind ]} */"true"`;
      }
   }
}

function sigCT( node ) {
   const ct = typeCT( node.type );
   
   switch( node.kind ) {
      case ts.SyntaxKind.PropertySignature:
	 if( node.questionToken ) {
	    return `"${node.name.escapedText}": { contract: ${ct}, optional: true }`;
	 } else {
	    return `"${node.name.escapedText}": ${ct}`;
      	 }
	 
      case ts.SyntaxKind.IndexSignature:
	 const param = node.parameters[ 0 ];
	 return `"${param.name.escapedText}": { contract: ${ct}, index: "${typeName( param.type )}"  }`;
	 
      default:
	 return "sigCT" + ts.SyntaxKind[ node.type ];
   }
}

// tsc --sourceMap -m es2020 --outDir tmp --allowjs comp2.js && node tmp/comp2.js $PWD/argv.d.ts
tc( process.argv.slice( 2 ), options );
