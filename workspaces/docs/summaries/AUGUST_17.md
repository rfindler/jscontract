# August 17th Summary

Based on our research thus far, we could write three different papers:

1. An analysis about the design of `CTAnd` and `CTOr` as validated by the bugs we have examined within DefinitelyTyped.
2. A discussion of the tool that we've built to capture the semantics of TypeScript types in JavaScript contracts, as validated by the bug reports we've filed so far.
3. An analysis and critique of the design of TypeScript's type system, based on hundreds of errors found within DefinitelyTyped.

Some notes about these possible papers:

- Paper 1 is closer to completion than Paper 2, and Paper 2 is closer to completion than Paper 3.
- In general, we aren't sure how to approach differences in the semantics of our contract system and TypeScript.
  - Do we try to minimize the differences as much as possible and only keep them around when _empirically_ they don't seem to matter?
  - Do we make them _intentionally_ different to try to catch more bugs?
  - One specific example of the tension exists in the code below:

```js
const increment = (arg: number) => arg + 1;
[1, 2, 3].map(increment);
```

Depending on which paper we choose to write, we could talk about this scenario very differently. In any case, we may want to address this tension explicitly.

- Paper 3 excites Josh the most, and he's willing to keep filing bug reports until we're ready to write it over the next few months.

There are related projects to tackle as well:

- We might need a Redex model to explain how `CTOr` and `CTAnd` work.
- We might need random contract testing to exercise the contracts in packages without bugs.
- We might need a graph of changes in DefinitelyTyped over time.
- We might need to come up with a way to classify the different bugs we've found.
- We might need to document how to run our tool on various packages (and potentially create a GitHub action).
