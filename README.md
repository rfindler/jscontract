
Misc
====

ccontract = <a value coercible into a contract>


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


Testing the contract implementation
===================================

```shell
nodejs ./test.js
```

TsToC (TypeScript-to-contract)
==============================

TsToC is the TypeScript-to-Contract translator. As of 10 feb 2021,
it translates a TypeScript file declaration (a `.d.ts` file) into
JavaScript contracts. It requires `tsc` to be installed on the host.
Example:

```shell
cd test/argv
nodejs ../../tools/tstoc.js index.d.ts argv.js > argv.ct.js
NODE_PATH=../..:$NODE_PATH nodejs test/test.js
```

The following URL help developing (and probably fixing) `tstoc`:

  [https://ts-ast-viewer.com](ast viewer)
  [https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API](api)
