# JSCONTRACT

_30 Apr 2021_

This README file document the JavaScript implementation of higher-order
contracts. The first goal is to apply them to TypeScript types to
debug type annotations, for instance, those proposed at
[https://definitelytyped.org/](definitively typed)

# Testing the contracts implementation

```shell
nodejs ./test.js
```

# Contracts

ccontract = <a value coercible into a contract>

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
