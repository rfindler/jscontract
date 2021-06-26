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

This section is the largest and could perhaps be split into subcategories respecting whether or not the type mismatch is "intentional" or not. Some of these cases seem like situations where the TypeScript developers are putting a layer of safety to prevent the JavaScript from behaving strangely, but other mistakes in the types seem like more innocent oversights.

My personal favorite example among these is `filesize-parser`, which blatantly passes numbers and strings even though the Typescript does not reflect them.

Another favorite is `http-codes` - our system realized that one of the exports in the types doesn't actually exist!

Interesting note: JavaScript libraries disagree wildly about what to do when they're given invalid inputs. Some like to throw exceptions, some try to return a sensible default, and some try to return a special error message of some kind. No unified semantic appears to exist.

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
- is-even
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

Undesired Errors

Message Mismatch
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
- last-element
- parse-password
- promise-sequential
- randomatic
- string-simliarity
- strip-comments
- swagger-express-mw
- tcp-port-used

## Runtime Type Changes

JavaScript features a form of prototypal inheritance that lets developers modify the methods on classes at runtime. For example, one could write:

```js
Array.prototype.push = function() { return "You tried to push an element onto an array!" ;
[1, 2, 3].push(3)
```

Some packages provide convenience wrappers around this sort of prototype modification that expect different types than the ones in the `index.d.ts` file. Packages that fall into this category include:

- abbrev
- convert-excel-to-json

## Interference

Sometimes, our contract system interferes with the semantics of the code it alters beyond just wrapping it. Here are some packages where that happens:

# To Do...

- File a whole bunch of pull requests fixing bugs and seeing whether they get accepted by the community
- Make our compiler/contract system more robust by fixing bugs that cause interference and improving compiled output

Further thoughts:

- The `quotesy` package caused our contract library to go into an infinite loop
- Notably, the `he` package is an example of the interference other researchers have found.
- The `parse-author` package presents an error that we could maybe fix in the future?
- The `password-hash` package seems to have the optional keys interfering...
- the `random-useragent` seems to have the same issue
- What about the `7zip-min` package?
- The `parse-color` package is an example of one that our approach would miss...
