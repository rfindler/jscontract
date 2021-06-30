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
- logrotate-stream
- money-math
- ms
- natural-compare
- natural-compare-lite
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
- stack-trace
- throng
- to-px
- trim (this one is caused by `String` vs. `string`)
- tsscmp
- wcwidth
- whatwg-encoding
- wrench
- xml-escape
- zipcodes

## Interface Key Mismatch

These errors occur when the TypeScript specifies an object interface with specific keys and values but the JavaScript includes more or less keys than expected. Examples of packages that fall into this category include:

- bytewise
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
- gulp-help
- gulp-sort
- html-parser
- humanize-ms
- is-valid-domain
- koa-cache-control
- koa-ejs
- nodemailer-mailgun-transport
- provinces
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

- concat-map
- concat-stream
- delete-empty
- express-formidable
- express-paginate
- express-socket.io-session
- foreach
- git-username
- global-modules-path
- gradient-string
- gulp-header
- hex-rgba
- human-date
- is-empty
- is-function
- is-valid-glob
- main-bower-files
- mouse-event-offset
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
- repeat-string
- serialize-javascript
- shuffle-seed
- static-eval
- get-times
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
- is-negated-glob
- is-odd
- is-even
- last-element
- parse-password
- promise-sequential
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
- bash-glob
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
- country-list-js
- create-error
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
- dir-walker-gen
- du
- easy-soap-request
- empty-dir
- ent
- envhandlebars
- express-fileupload
- express-form-data
- express-handlebars
- express-sslify
- express-unless
- ffprobe
- fibers
- field
- file-size
- freeport
- freshy
- furigana-markdown-it
- get-ssl-certificate
- gettext-parser
- glob-to-regexp
- gulp-inject
- gulp-protractor
- he
- honeybadger
- html5-history
- humps
- iban
- ical
- ini
- inline-css
- intersperse
- is-glob
- jalaali-js
- jjv
- jsontoxml
- kind-of
- koa-cors
- koa-proxy
- koa-xml-body
- kompression
- langs
- linkify-markdown
- md5
- metaget
- minimist
- mock-req-res
- msgpack
- multisort
- muri
- mv
- nprogress
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
- pwd-strength
- radix64
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
- std-mocks
- stream-json
- style-search
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
- wait-on
- winston-syslog
- write
- xml-flow
