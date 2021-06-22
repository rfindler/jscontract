const promise = new Promise((res) => res(3));
const promiseProxy = new Proxy(promise, {});
Promise.prototype.then.call(promiseProxy);
