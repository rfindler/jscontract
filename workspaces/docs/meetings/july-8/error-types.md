# Description

- We ran our system on all 7514 packages.
- Of those packages, there were only 1823 where we could:
  - Download the code from source.
  - Install the dependencies.
  - Run all of the tests automatically.
- Of those, only 837 passed when we swapped out their entry point with one involving contracts.
- Of those, 274 failed when we ran their code using contracts.

# Critical Errors

## Type Mismatch

These errors occur TypeScript expects one kind of primitive type, like `string`, but the JavaScript passes in something completely different. Examples of packages that fall into this category include:

- branca
- buffer-equal
- circle-to-polygon
- falafel
- file-exists
- filesize-parser
- fined
- get-value
- git-rev-sync
- http-build-query
- http-codes
- i18n-abide
- is-base64
- is-uuid
- is-valid-path
- js-nacl
- js-string-escape
- kcors
- koa-bodyparser
- logrotate-stream
- money-math
- ms
- natural-compare
- natural-compare-lite
- node-abi
- normalize-package-data
- object.pick
- parse-full-name
- parse-github-url
- parse-unit
- parsecurrency
- pascalcase
- pretty-time
- ps-tree
- quick-format-unescaped
- recase
- rtl-detect
- safe-compare
- save-pixels
- sbd
- secure-random-string
- similarity
- stack-trace
- throng
- to-px
- trim (this one is caused by `String` vs. `string`)
- tsscmp
- w3c-xmlzerializer
- wcwidth
- whatwg-encoding
- wrench
- xml-escape
- zipcodes

## Interface Key Mismatch

These errors occur when the TypeScript specifies an object interface with specific keys and values but the JavaScript includes more or less keys than expected. Examples of packages that fall into this category include:

- amazon-product-api
- bytewise
- caseless
- checksum
- child-process-promise
- copy
- country-data
- cwise-compiler
- deasync
- dotenv-flow
- ejson
- express-ejs-layouts
- express-less
- express-list-endpoints
- express-request-id
- express-useragent
- glob-base
- graphql-depth-limit
- gulp-help
- gulp-rename
- gulp-sort
- html-parser
- html-truncate
- humanize-ms
- inflection
- is-valid-domain
- jsen
- justified-layout
- koa-cache-control
- koa-ejs
- lazypipe
- lerna-get-packages
- node-cleanup
- nodemailer-mailgun-transport
- pinyin
- properties-reader (how should we handle \_ things?)
- provinces
- socketty
- through2-map
- x509.js
- yesql

## Arity Mismatch

JavaScript ordinarily lets you pass as many arguments as you would like into a function:

```js
const myAdd = (a, b) => a + b;
myAdd(1, 2, 3); // 3;
```

TypeScript wants to make sure each function takes the arguments it expects. However, sometimes, TypeScript developers miss all of the arguments that a JavaScript function can take. We've detected arity mismatch problems in the following packages:

- apicache
- bitauth
- box-intersect
- concat-map
- concat-stream
- delete-empty
- doge-seed
- express-formidable
- express-paginate
- express-socket.io-session
- ffbinaries
- foreach
- get-times
- git-username
- global-modules-path
- gradient-string
- gul-tap
- gulp-file-include
- gulp-header
- hex-rgba
- human-date
- humanparser
- integer
- is-empty
- is-function
- is-valid-glob
- jest-in-case
- koa-json-error
- main-bower-files
- mouse-event-offset
- nodemailer-smtp-pool
- object-diff
- object-map
- object.omit
- pad-left
- pick-deep
- pipes-and-filters
- pkcs7-padding
- point-in-polygon
- progress-stream
- promise-retry
- read
- read-package-tree
- rename
- repeat-string
- serialize-javascript
- shuffle-seed
- static-eval
- stream-each
- url-params
- xml

Undesired Errors

## Message Mismatch

JavaScript's error handling system relies on strings: An error object in the language contains a "message" string that can be inspected at runtime. As such, JavaScript tests often work by creating functions that throw an exception and then checking that the message in the exception contains the error. An example of such a test might look like the following:

```js
it("should throw an error if the value passed is not an array:", function () {
  (function () {
    unique("a", "b", "c");
  }.should.throw("array-unique expects an array."));
});
```

These tests present problems because our contract library throws errors related to blame that often do not match the string the test expects. As such, while these tests fail, they do not necessarily present a type error of the sort we desire—TypeScript is designed to guard against these cases.

Packages that fall into this category include:

- array-inital
- array-unique
- chalk-animation
- contains-path
- cwise
- dashify
- ellipsize
- event-loop-lag
- express-locale
- group-array
- host-validation
- html-tableify
- is-even
- is-negated-glob
- is-odd
- last-element
- parse-password
- promise-map-limit
- promise-sequential
- random-gradient
- randomatic
- string-simliarity
- strip-comments
- swagger-express-mw
- tcp-port-used
- url-join
- warning

## Interference

Sometimes, our contract system interferes with the semantics of the code it alters beyond just wrapping it. Here are some packages where that happens:

- 7zip-min
- abbrev
- args
- asciichart
- audio-play
- axios-token-interceptor
- b-spline
- base64-async
- bash-glob
- bdfjs (optional keys)
- browser-pack
- browser-resolve
- chloride
- cli-box
- color-namer
- colornames
- concurrently
- connect-history-api-fallback
- connect-livereload
- connect-slashes
- convert-excel-to-json
- correlation-id
- country-list-js
- create-error
- create-xpub (optional keys)
- css-mediaquery
- cssbeautify
- cwise
- cwise-parser
- d20
- damerau-levenshtein
- deasync
- defer-promise
- deindent
- dependency-solver
- detective
- dir-walker-gen
- du
- duplexify
- easy-soap-request
- empty-dir
- ent
- envhandlebars
- expired
- express-fileupload
- express-form-data
- express-handlebars
- express-sslify
- express-unless
- ffprobe
- fibers
- field
- file-size
- find
- freeport
- freshy
- from
- furigana-markdown-it
- get-ssl-certificate
- gettext-parser
- git-diff (optional keys)
- glob-to-regexp
- gulp
- gulp-inject
- gulp-protractor
- handlebars-helpers
- hbs
- he
- honeybadger
- html-encoding-sniffer
- html5-history
- hull.js
- humps
- iban
- ical
- ini
- inline-css
- intersperse
- is-glob
- jalaali-js
- jjv
- jsnox
- json-query (optional keys)
- jsontoxml
- kind-of
- koa-cors
- koa-proxy
- koa-xml-body
- kompression
- laguage-tags
- langs
- ldap-filters
- linkify-markdown
- md5
- merge-ranges
- metaget
- minimist
- mock-req-res
- msgpack
- multisort
- muri
- mv
- nprogress
- object-hash (optional keys - good ex)
- once
- parse-author
- parse-color
- parse-filepath
- parse-prefer-header
- password-hash
- pem-jwk
- perfy
- pidusage
- platform
- promised-temp
- ps-node
- pwd-strength
- radix64
- random-number
- random-useragent
- rc
- reconnect-core
- requestretry
- require-directory
- restify-cookies
- rimraf
- rollup-plugin-auto-external
- runmd
- safe-json-stringify
- sax-stream
- saywhen
- scss-parser
- seed-random
- semaphore
- set-value
- sha256-file
- shell-quote
- simple-diff
- simple-query-string
- sitemap2
- std-mocks
- stream-json
- style-search
- svg-outline-stroke (object keys)
- swagger-express-validator
- swagger-hapi
- swagger-restify-mw
- swagger-sails-hook
- text-table
- through
- to-absolute-glob
- unzip-stream
- urlparser
- voucher-code-generator
- w3c-xmlserializer
- wait-on
- winston-syslog
- write
- xml-flow
