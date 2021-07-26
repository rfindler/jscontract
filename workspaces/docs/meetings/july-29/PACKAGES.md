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

- ical.js
- style-search
- suncalc
- parse-color
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

- Bumped error messages, added test cases
- Optional keys _in functions_ (interaction between the two)?
- How should we handle `style-search` (completely undocumented key we picked up in our tests?)
- How should we handle `xml-w3cserializer` (one test case passes true; bug in the JS?)
- How should we handle dependencies (`circle-to-polygon`)?
- What should we do about pseudo-private properties that aren't reflected in the types? (E.g., `_almost_private` keys on objects) (`properties-reader` and `socketty`)
