# What should a function do when given strange inputs?

- Throw an exception? (`dashify`)
- Return null, undefined, or some other zero value? (`ms`)
- Try to return a sensible default? (`is-uuid`)

# What are other kinds of bugs our system has found?

- TypeScript doesn't capture the right function arity (`hex-rgba`)
- TypeScript tries to export a function that doesn't exist (`http-codes`)

# Interesting Failures

- JavaScript author wants to extend the `prototype` of built-ins (abbrev)

# Next Steps

- Submit pull requests for the following packages:
  - `natural-compare`
  - `file-exists`
  - `filesize-parser`
  - `hex-rgba`
  - `pad-left`
- Challenge: I've been waiting for a month for one of my existing pull requests...
- Reducing false-positive rate
  - Interference from `__private`
  - Surprising syntax:

```js
const object = {
  method() {
    return false;
  },
};
```

## TODO

- Pull request: First the ones that are clear bugs
- Run the scripts again
- Then the ones that are more philosophical
