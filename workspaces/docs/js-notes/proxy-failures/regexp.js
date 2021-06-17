const regExp = new RegExp("hello");
const regExpProxy = new Proxy(regExp, {
  get(field) {
    console.log("Accessing a field on the promise!");
    return date[field];
  },
});
console.log(regExp.match("hello"));
regExpProxy.match("hello");
