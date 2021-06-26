#lang scribble/acmart

@(require scribble/manual)

@itemlist[
 @item{We ran our system on all 7514 packages.}
 @item{Of those packages, there were only 1823 where we could:
  @itemlist[
 @item{Download the code from source.} 
 @item{Install the dependencies.}
 @item{Run all of the tests automatically.}
 ]
 }
 @item{Of those, only 837 passed when we swapped out their entry point with one involving contracts.}
 @item{Of those, 274 failed when we ran their code using contracts.}
 ]

@section{Critical Errors}

@subsection{Type Mismatch}
These errors occur TypeScript expects one kind of primitive type, like @code{string}, but the JavaScript passes in something completely different. Examples of packages that fall into this category include:

@itemlist[
 @item{branca}
 @item{buffer-equal}
 @item{circle-to-polygon}
 @item{falafel}
 @item{file-exists}
 @item{filesize-parser}
 @item{get-value}
 @item{git-rev-sync}
 @item{http-build-query}
 @item{http-codes}
 @item{i18n-abide}
 @item{is-base64}
 @item{is-uuid}
 @item{is-valid-path}
 @item{js-nacl}
 @item{js-string-escape}
 @item{logrotate-stream}
 @item{money-math}
 @item{ms}
 @item{natural-compare}
 @item{natural-compare-lite}
 @item{normalize-package-data}
 @item{object.pick}
 @item{parse-full-name}
 @item{parse-github-url}
 @item{parse-unit}
 @item{parsecurrency}
 @item{pascalcase}
 @item{pretty-time} 
 @item{ps-tree}
 @item{quick-format-unescaped}
 @item{recase}
 @item{rtl-detect}
 @item{safe-compare}
 @item{save-pixels}
 @item{sbd}
 @item{secure-random-string}
 @item{stack-trace}
 @item{throng}
 @item{to-px}
 ]

This section is the largest and could perhaps be split into subcategories respecting whether or not the type mismatch is "intentional" or not. Some of these cases seem like situations where the TypeScript developers are putting a layer of safety to prevent the JavaScript from behaving strangely, but other mistakes in the types seem like more innocent oversights.

My personal favorite example among these is @code{filesize-parser}, which blatantly passes numbers and strings even though the Typescript does not reflect them.

Another favorite is @code{http-codes} - our system realized that one of the exports in the types doesn't actually exist!

Interesting note: JavaScript libraries disagree wildly about what to do when they're given invalid inputs. Some like to throw exceptions, some try to return a sensible default, and some try to return a special error message of some kind. No unified semantic appears to exist.

@subsection{Interface Key Mismatch}
These errors occur when the TypeScript specifies an object interface with specific keys and values but the JavaScript includes more or less keys than expected. Examples of packages that fall into this category include:

@itemlist[
 @item{bytewise}
 @item{checksum}
 @item{child-process-promise}
 @item{copy}
 @item{country-data}
 @item{cwise-compiler}
 @item{deasync}
 @item{dotenv-flow}
 @item{ejson}
 @item{express-ejs-layouts}
 @item{express-less}
 @item{express-list-endpoints}
 @item{express-request-id}
 @item{express-useragent}
 @item{glob-base}
 @item{gulp-help}
 @item{gulp-sort}
 @item{html-parser}
 @item{humanize-ms}
 @item{is-valid-domain}
 @item{koa-cache-control}
 @item{koa-ejs}
 @item{nodemailer-mailgun-transport}
 @item{provinces}
 @item{through2-map}
 ]

@subsection{Arity Mismatch}
JavaScript ordinarily lets you pass as many arguments as you would like into a function:

@codeblock|{
  const myAdd = (a, b) => a + b;
  myAdd(1, 2, 3); // 3;
  }|

TypeScript wants to make sure each function takes the arguments it expects. However, sometimes, TypeScript developers miss all of the arguments that a JavaScript function can take. We've detected arity mismatch problems in the following packages:

@itemlist[
 @item{concat-map}
 @item{concat-stream}
 @item{delete-empty}
 @item{express-formidable}
 @item{express-paginate}
 @item{express-socket.io-session}
 @item{foreach}
 @item{git-username}
 @item{global-modules-path}
 @item{gradient-string}
 @item{gulp-header}
 @item{hex-rgba}
 @item{human-date}
 @item{is-empty}
 @item{is-even}
 @item{is-function}
 @item{is-valid-glob}
 @item{main-bower-files}
 @item{mouse-event-offset}
 @item{object-diff}
 @item{object-map}
 @item{object.omit}
 @item{pad-left}
 @item{pick-deep}
 @item{pipes-and-filters}
 @item{pkcs7-padding}
 @item{point-in-polygon}
 @item{progress-stream}
 @item{promise-retry}
 @item{read}
 @item{read-package-tree}
 @item{repeat-string}
 @item{serialize-javascript}
 @item{shuffle-seed}
 @item{static-eval}
 @item{get-times}
 ]

@section{Undesired Errors}

@subsection{Message Mismatch}
JavaScript's error handling system relies on strings: An error object in the language contains a "message" string that can be inspected at runtime. As such, JavaScript tests often work by creating functions that throw an exception and then checking that the message in the exception contains the error. An example of such a test might look like the following:

@codeblock|{
  it("should throw an error if the value passed is not an array:", function() {
  (function() {
  unique("a", "b", "c");
  }).should.throw("array-unique expects an array.");
  });
  }|

These tests present problems because our contract library throws errors related to blame that often do not match the string the test expects. As such, while these tests fail, they do not necessarily present a type error of the sort we desire—TypeScript is designed to guard against these cases.

Packages that fall into this category include:

@itemlist[
 @item{array-inital}
 @item{array-unique}
 @item{chalk-animation}
 @item{contains-path}
 @item{cwise}
 @item{dashify}
 @item{ellipsize}
 @item{event-loop-lag}
 @item{express-locale}
 @item{group-array}
 @item{host-validation}
 @item{html-tableify}
 @item{is-negated-glob}
 @item{is-odd}
 @item{last-element}
 @item{parse-password}
 @item{promise-sequential}
 @item{randomatic}
 @item{string-simliarity}
 @item{strip-comments}
 @item{swagger-express-mw}
 @item{tcp-port-used}
 ]

@subsection{Runtime Type Changes}
JavaScript features a form of prototypal inheritance that lets developers modify the methods on classes at runtime. For example, one could write:

@codeblock|{
  Array.prototype.push = function() { return "You tried to push an element onto an array!" };
  [1, 2, 3].push(3)
  }|

Some packages provide convenience wrappers around this sort of prototype modification that expect different types than the ones in the `index.d.ts` file. Packages that fall into this category include:

@itemlist[
 @item{abbrev}
 @item{convert-excel-to-json}
 ]

@section{To Do...}
@itemlist[
 @item{File a whole bunch of pull requests fixing bugs and seeing whether they get accepted by the community}
 @item{Make our compiler/contract system more robust by fixing bugs that cause interference and improving compiled output}
 ]

@subsection{Interference}
Sometimes, our contract system interferes with the semantics of the code it alters beyond just wrapping it. Here are some packages where that happens:

@itemlist[
 ]

Further thoughts:

@itemlist[
 @item{The @code{quotesy} package caused our contract library to go into an infinite loop}
 @item{Notably, the @code{he} package is an example of the interference other researchers have found.}
 @item{The @code{parse-author} package presents an error that we could maybe fix in the future?}
 @item{The @code{password-hash} package seems to have the optional keys interfering... }
 @item{the @code{random-useragent} seems to have the same issue}
 @item{What about the @code{7zip-min} package?}
 @item{The @code{parse-color} package is an example of one that our approach would miss...}
 ]
