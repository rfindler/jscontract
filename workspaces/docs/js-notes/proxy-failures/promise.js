const promise = new Promise((res) => res(3));
const promiseProxy = new Proxy(promise, {
  get(field) {
    console.log("Accessing a field on the promise!");
    return promise[field];
  },
});
promiseProxy.then((x) => x);
