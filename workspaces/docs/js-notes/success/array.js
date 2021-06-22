const array = new Array(5);
const arrayProxy = new Proxy(array, {});
Array.prototype.push.call(arrayProxy, 5);
console.log(arrayProxy);
