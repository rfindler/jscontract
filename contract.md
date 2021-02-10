
Misc
====

ccontract = <a value coercicle into a contract>


CTObject
========

CTObject: { [string: fieldct]* } => contract

fieldct: ccontract
  | { "contract": ccontract }
  | { "contract": ccontract, optional: boolean }
  | { "contract": ccontract, index: "string" | "number" }


CTFunction
==========

CTFunction: { ccontract, [ argct* ], ccontract } => contract
argct: ccontract
  | { "contract": ccontract }
  | { "contract": ccontract, optional: boolean }
  | { "contract": ccontract, doddotdot: boolean }


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

The following URL help developping (and probably fixing) `tstoc`:

  [https://ts-ast-viewer.com](ast viewer)
  [https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API](api)
