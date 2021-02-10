
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

