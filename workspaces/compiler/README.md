# @jscontract/compiler

## Why Babel?

- Maintainability

```typescript
const contractImport = template.ast(
  `const CT = require('@jscontract/contract');`
) as Statement;
contractAst.program.body.push(contractImport);
```

Seems easier to reason about than

```typescript
[
  factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier("CT"),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createIdentifier("require"),
            undefined,
            [factory.createStringLiteral("@jscontract/contract")]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  ),
];
```

More on Babel:

- Organizes compilation steps into `plugins` ala Nanopass phases
- Extremely popular community; well documented, well supported

- Build System Integration

  - If we can get our code to work on arbitrary TypeScript instead of just TypeScript declarations, we can potentially convert any frontend project that uses Babel to compile TypeScript into JavaScript into one that compiles TypeScript into JavaScript with contracts for free
  - React (and other JS frameworks?) do things this way
  - Ability to support multiple type systems; the Babel parser can compile Flow as well as TypeScript, so you could theoretically extend our compiler to handle the Flow types in addition to the JS ones

- Tradeoffs
  - Third party API; additional dependencies than TypeScript.
  - Babel doesn't do typechecking, so if we need detailed information about the semantics of the type system, we have to go through their API.
