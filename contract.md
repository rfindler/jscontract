

CTObject
--------

CTObject: { [string: fieldct]* } => contract

fieldct: contract
  | { "contract": contract }
  | { "contract": contract, optional: boolean }
  | { "contract": contract, index: "string" | "number" }
