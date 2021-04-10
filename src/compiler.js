// const parser = require("@babel/parser");
// const generator = require("@babel/generator");
// const t = require("@babel/types");
// const traverse = require("@babel/traverse");

// const thing = fs.readFileSync(
//   path.join(__dirname, "fixtures", "7zip-min", "index.d.ts"),
//   "utf-8"
// );

// const res = parser.parse(thing, {
//   plugins: ["typescript"],
//   sourceType: "module",
// });

// traverse.default(res, {
//   enter(aPath) {
//     if (!t.isExportDeclaration(aPath)) return;
//     const theDeclaration = aPath.node.declaration;
//     console.log(theDeclaration);
//     switch (aPath.node.declaration.type) {
//       case "TSDeclareFunction":
//         {
//           console.log(
//             "PARAMS",
//             theDeclaration.params.map((param) => {
//               return param.name;
//               // return param.typeAnnotation.typeAnnotation.type;
//             })
//           );
//         }
//         break;
//       case "TSInterfaceDeclaration":
//         {
//           // console.log(`INTERFACE`, aPath.node.declaration);
//         }
//         break;
//       default:
//         break;
//     }
//   },
// });
