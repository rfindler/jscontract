# NOTES

- Bug in the linter - DefinitelyTyped would not accept the correct type definition
- Collect places where `map`/`for-each` fail because of arity errors
- Put in prototype hack for arrays?

Pull requests accepted so far:

- pad-left
- repeat-string
- Integer
- human-date
- http-codes
- natural-compare
- hex-rgba

Waiting on the following pull requests:

- point-in-polygon
- url-params
- parse-unit
- is-valid-path
- money-math
- trim
- checksum
- file-exists
- ms
- buffer-equal

Contract system questions:

- What should we do about (`Jack-Works`) on (`parse-unit`)?
- Does TypeScript let us capture the semantics of the `Integer` package?
- What should we do about pseudo-private properties that aren't reflected in the types? (E.g., `_almost_private` keys on objects) (`properties-reader` and `socketty`)
- `sha256-file`, `bash-glob` types and contract questions, `7zip-min` types - `and` contract questions, `cli-box` types - `and` contract questions
- `to-absolute-glob` types - optional key questions / `rename types`
