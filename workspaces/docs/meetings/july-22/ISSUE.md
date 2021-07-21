Conflict between linting rules and the types for the `integer` package

Hi everyone,

I’m trying to modify the types for the integer package to reflect the semantics of the underlying JavaScript code. According to the [tests for the constructor](https://github.com/JoshuaWise/integer/blob/master/test/10.constructor.js), running:

```js
Integer();
```

Is OK, but invoking

```js
Integer(undefined);
```

Results in an error. To represent this in the type system, I've tried modifying the existing type definitions like so:

```js
declare function Integer(val: Integer.IntLike): Integer.IntClass;
declare function Integer(): Integer.IntClass;
```

When I try to apply these changes, however, DefinitelyTyped gives me the following error:

```
> definitely-typed@0.0.3 test /Users/joshua/code/github/joshuaharry/DefinitelyTyped
> dtslint types "integer"

Error: /Users/joshua/code/github/joshuaharry/DefinitelyTyped/types/integer/index.d.ts:10:26
ERROR: 10:26  unified-signatures  These overloads can be combined into one signature with an optional parameter.

    at /Users/joshua/code/github/joshuaharry/DefinitelyTyped/node_modules/dtslint/bin/index.js:207:19
    at Generator.next (<anonymous>)
    at fulfilled (/Users/joshua/code/github/joshuaharry/DefinitelyTyped/node_modules/dtslint/bin/index.js:6:58)
npm ERR! Test failed.  See above for more details.
```

How should I proceed? I would appreciate any advice.

Best,
Josh
