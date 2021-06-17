const myString = "hi";
const myStringProxy = new Proxy(new String(myString), {
  get() {
    console.log("Get was called on the proxy handler!");
  },
});
console.log(myStringProxy.charCodeAt(0));
