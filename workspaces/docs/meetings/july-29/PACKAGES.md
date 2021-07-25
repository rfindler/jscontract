Pull requests accepted so far:

- parsecurrency
- sha256-file
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

- suncalc
- parse-color
- radix64
- falafel
- filesize-parser
- node-cleanup
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

- What's going on with `parsecurrency`?
- What's going on with `base64-async`? (`Promise` is not a promise?)
- How should we handle dependencies (`circle-to-polygon`)?
- What should we do about pseudo-private properties that aren't reflected in the types? (E.g., `_almost_private` keys on objects) (`properties-reader` and `socketty`)
