
Misc
====

ccontract = <a value coercicle into a contract>


CTObject
========

CTObject: { [string: fieldct]* } => contract

fieldct ::=
    ccontract
  | { contract: ccontract }
  | { contract: ccontract, optional: boolean }
  | { contract: ccontract, index: "string" | "number" }
    // this alternative can appear at most once


CTFunction
==========

CTFunction: { ccontract, [ argct* ], ccontract } => contract
argct ::=
    ccontract
  | { contract: ccontract }
  | { contract: ccontract, optional: boolean }
  | { contract: ccontract, dotdotdot: boolean }
    // this alternative can appear at most once

TsToC
=====

TsToC is the TypeScript-to-Contract translator. As of 10 feb 2021,
it translates a TypeScript file declaration (a `.d.ts` file) into
JavaScript contracts. It requires `tsc` to be installed on the host.

To compile `totoc` (so that it can be executed by node):

```shell
tsc -m es2020 --outDir tmp --allowjs tstoc.js
```

To compile declaration files:

```shell
node tmp/tstoc.js argv.d.ts
```
Of course, this can be combined into:

```shell
tsc -m es2020 --outDir tmp --allowjs tstoc.js && node tmp/tstoc.js argv.d.ts
```


It might be that the file `tmp/tstoc.js` has to be renamed `tmp/tstoc.mjs`
so that node accepts to execute it. For that use,

```shell
tsc -m es2020 --outDir tmp --allowjs ../../tools/tstoc.js && mv tmp/tstoc.js tmp/tstoc.mjs && node tmp/tstoc.mjs argv.d.ts
```

The following URL help developing (and probably fixing) `tstoc`:

  [https://ts-ast-viewer.com](ast viewer)
  [https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API](api)
