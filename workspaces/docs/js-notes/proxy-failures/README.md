# Proxy Semantics

This script lets us explore when Proxies fail mysteriously and when they don't. You can try it by running:

```js
node index.js
```

If you want to test a new primitive constructor, you just need to modify the `call.json` file. Add a new JSON to the array with the following properties:

- A `constructor` field referring to the built in constructor in JavaScript (e.g., Array)
- An `instance` string which, when `eval`ed, will create an instance of the constructor.
- A method on the prototype of the `constructor` which should work on the proxy.
- Args representing the arguments you would like to give to the constructor.

You can also add an `extra` field that will inject code above the standard script as necessary.
