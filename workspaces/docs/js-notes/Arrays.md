In JavaScript, an object is considered a true array if it is either an instance of the built-in Array class or an instance of some other class that inherits from it. Consider the following code:

```js
const basicArray = [1];
const arrayLikeObject = { 0: 1, length: 1 };
class MyFancyArray extends Array {}
const myFancyArray = new MyFancyArray();
Array.isArray(basicArray); // true - the [] syntax creates an array from the built-in class.
Array.isArray(arrayLikeObject); // false - arrayLikeObject doesn't inherit from the Array prototype.
Array.isArray(myFancyArray); // true - myFancyArray inherits from the Array prototype.
```

The main idea is that JavaScript and TypeScript decide whether an object is an array by looking at the prototype chain.
However, several objects in JavaScript behave extremely similarly to arrays without actually being related to the proper array type. Consider what happens, for example, when running the following snippet of code below on a web page:

```js
Array.isArray(document.getElementsByTagName("div")); // false
```

Surprisingly, that code returns `false` because `document.getElementsByTagName` returns a collection that isn't an array. Instead, it returns an instance of a class called `HTMLCollection`, which has completely different methods than the built-in `Array`. For example, even though you can write:

```js
[1, 2, 3].forEach((num) => console.log(num)); // Works as you'd expect
```

Trying to run:

```js
document.getElementsByTagName("div").forEach((div) => console.log(div));
```

Raises the following exception:

```js
Uncaught TypeError: document.getElementsByTagName(...).forEach is not a function
```

However, HTMLCollection does have a length property and associates each element inside of it with the numbers 0, 1, 2, and so forth. Therefore, one can iterate through an HTMLCollection like so:

```js
const tags = document.getElementsByTagName("div");
for (let i = 0; i < tags.length; i += 1) {
  /*
   * Works because 0, 1, and 2 are
   * keys on the tag object that correspond to
   * 'div' values
   */
  console.log(tags[i]);
}
```

To capture this behavior, TypeScript introduces a compile-time interface called ArrayLike which is defined as follows:

```ts
interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}
```

That interface specifies that any JavaScript object with both numeric indices that correspond to the generic type T and a key length that corresponds to some number will count as ArrayLike. As such, this code will compile:

```ts
const fn = (x: ArrayLike<number>): ArrayLike<number> => x;
fn({ length: 1, 0: 1 });
fn([1]);
```

Whereas this code would not compile:

```js
const fn = (x: Array<number>): Array<number> => x;
fn([1]); // OK
fn({ length: 1, 0: 1 }); // Type Error
```
