# Breaking --strictNullChecks via a Dependency

Consider the function `hex2Dec`, which has the following type signature in the `@types/DefinitelyTyped` repository:

```ts
export function decToHex(decStr: string, opts?: { prefix?: boolean }): string;
```

This defintion might prove surprising, as running

```js
decToHex("nonsense") === null; // true
```

Before TypeScript 2.0, however, this function definition was technically correct, and in TypeScript 4.2, it is correct if you don't pass the `--strictNullChecks` flag to the compiler. To get the guarantees implied by that flag, the type would need to change to:

```ts
export function decToHex(
  decStr: string,
  opts?: { prefix?: boolean }
): string | null;
```

Notably, if you are the library author of the `hex2dec` package, you have _no way to know_ how consumers are going to use your type definitions. Maybe they've configured the compiler to assume that all strings can be `null` and `undefined`; maybe they haven't. You can't tell a-priori. That could make code re-use difficult.
