Pull requests closed so far:

- zipcodes
- pad-left
- repeat-string
- Integer
- human-date
- http-codes
- natural-compare
- hex-rgba
- circle-to-polygon
- ps-tree
- to-px
- humanize-ms
- html-template
- x509.js

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
- git-rev-sync

Contract system questions:

- `to-absolute-glob` types - optional keys?
- `falafel` - JavaScript relies on an API that pretends to be a string but really isn't (the documentation calls it `string-like`, but it's not a `String`)
- `sha256-file` - `and` contract
- What's going on with `w3c-xmlserializer`? (`true` is the empty object?)
- How should we handle dependencies (`circle-to-polygon`)?
- What should we do about pseudo-private properties that aren't reflected in the types? (E.g., `_almost_private` keys on objects) (`properties-reader` and `socketty`)
