# JSContract

## Misc

ccontract = <a value coercicle into a contract>

## CTObject

CTObject: { [string: fieldct]\* } => contract

fieldct ::=
ccontract
| { contract: ccontract }
| { contract: ccontract, optional: boolean }
| { contract: ccontract, index: "string" | "number" }
// this alternative can appear at most once

## CTFunction

CTFunction: { ccontract, [ argct\* ], ccontract } => contract
argct ::=
ccontract
| { contract: ccontract }
| { contract: ccontract, optional: boolean }
| { contract: ccontract, dotdotdot: boolean }
// this alternative can appear at most once

## Blame Objects

blame_object =
{ pos: name of potential blame party
neg: name of potential blame party
dead : (or/c false -- not involved in or/and contract
{ dead : (or/c false -- still alive
string) } ) -- dead with this error message
pos_state: (or/c false -- no and/or in play
blame_object) -- our sibling in the or/and
neg_state: same as pos_state
}
INVARIANT: (dead != false) <=> (pos_state != false) or (neg_state != false)

## TsToC

TsToC is the TypeScript-to-Contract translator. As of 10 feb 2021,
it translates a TypeScript file declaration (a `.d.ts` file) into
JavaScript contracts. It requires `tsc` to be installed on the host.

```shell
nodejs ../../tools/tstoc.js argv.d.ts
```

The following URL help developing (and probably fixing) `tstoc`:

[https://ts-ast-viewer.com](ast viewer)
[https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API](api)
