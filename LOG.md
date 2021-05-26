- Tue Apr 20 09:34:40 AM CDT 2021 - Checksum

- Tue Tue Apr 27 20:01:17 UTC 2021
  - Attempted to run every package on DefinitelyTyped through the Compiler. VPS ran out of disk space
  - base-64 - Untyped JavaScript is much more lax (accepts null and undefined)
  - urlparser - Untyped JavaScript doesn't put all the keys on the field
  - audiosprite - TypeError: Wrong argument count 3/2; issue with Contracts or compiler?
  - abs - All tests pass!
  - classify-poetry - All tests pass!
  - Thoughts:
    - Readonly array?
    - Promises?
    - Finding errors automatically?
- Mon May 3 07:56:24 AM CDT 2021
  - Added garbage collection to script; we now delete the code after the fact.
  - Packages with potential issues:
    - blocked-at
    - checksum
    - coffeeify
    - colornames
    - commondir
    - config
    - contains-path
    - cssbeautify
    - cwd
    - dashify
    - deasync
    - defaults-deep
    - ellipsize
    - event-loop-lag
    - events
    - falafel
    - field
    - filesize-parser
    - find-exec
    - form-urlencoded
    - git-diff
    - git-url-parse
    - git-user-email
    - git-username
    - github-url-to-object
    - global-modules-path
    - graygelf
    - group-array
    - gtmetrix
    - hex-rgba
    - hex2dec
    - hh-mm-ss
    - html-truncate
  - Themes:
    - TypeScript and JavaScript have different semantics
      - See `filesize-parser`; has the same problem as base-64 (the JavaScript tests for wacky inputs; the TypeScript types dissallow them)
    - Not all test failures are problems!
      - Example: `dashify` test fails because the _error message_ is different
        - Same with several other packages in the list
        - Automatically detects defensive programming
    - Function arity
      - See `global-modules-path`; some of the tests feed too many arguments into the functions. JavaScript ignores, TypeScript prevents; is that a problem?
  - Potential next steps:
    - Add statistics gathering to the script?
      - For each package, report:
        - Can we download it successfully?
        - Can we compile the index.d.ts file into contracts?
        - Can we run the tests using the contracts?
        - Do the tests succeed?
          - Can see roughly how to add, but not sure whether we want to improve the contract library work.
    - Can we add a readonly array contract (e.g., enforce "This array is only meant to be read to")?
    - Promise contracts? (Challenging for reasons listed)
    - Generating code to play with the contracts?
    - Can we do class contracts?

Thu May 6 03:14:56 PM CDT 2021

- Adds sorting and filtering; at "G" in the alphabet, reduced the possible set of candidates from ~2000 to ~400
  - Whittle those down to start making meaningful improvements to the compiler by sorting by type length
- Adds priority script - whittles down to specific places to start improving the compiler
- How do we compile:
  - Generic contracts?
  - ArrayLike contracts?
  - Promise contracts?
  - Class contracts?
  - How do we handle when the type definitions don't export some of the features in the module being tested?

Mon May 10 11:26:40 AM CDT 2021

- Why replacing the code directly instead of changing the entry point of lib is hard:
  - Have to crawl through all the code in the package to figure out where the functions are defined; no easy way
  - Have to handle inlining the dependency of the contract library (not just one file per-ce)
- Potentially useful idea:
  - Contract annotations on network and database calls? Add lib. as part of build process and get contracts for free?
  - Gradual typing + gradual contracts...

Sun May 16 06:41:27 PM CDT 2021

- Results after bumping the compiler to handle arrays/array-like things:
  - After doing filtering, iterating is much faster
  - Similar classes of errors
    - `array-unique` - JS looking for an error that the Contract finds
    - `cliff` - the JavaScript accepts numbers, but the TypeScript types only want strings
  - Interesting bug: Typescript types don't account for null
    - `country-code-lookup`
    - Contract lib error message?
  - Interesting bug: Proxy objects are not arrays, which makes some of the tests fail
    - combinations - `assert.deepEquals` fails in the test even though the contract seems fine

Sat May 22 04:22:49 PM CDT 2021

- Results after exploring more packages:
  - Packages working after fixing the `prop.match` bug:
    - csvrow
    - combinations
    - align-text
    - brace-expansion
    - arr-diff
    - center-align
    - dependency-solver
    - dir-walker-gen
  - Submitted PR regarding the `hex2dec` package and null - PR merged!
  - Added docs and a `related-work` folder
  - Another strange package: `cwd`
    - Contract system is finding a function _somewhere_, but the tests are feeding in strings...?
  - Detected incorrect types in the `bufferEqual` package
    - If you give it incorrect types, it returns `undefined`, so the arguments should actually be anything (???)
    - Interesting problems submitting a fix to `DefinitelyTyped`
  - Extremely weird behavior regarding the `circle-to-polygon` package
    - The last parameter of the function can either be a number, undefined, or _the explicit value null_? (???)

// TODO:

- Submit pull requests to see what they think of semantics
- Try to get numbers on of "valid" packages, how many error, how many pass, which are bugs/not bugs