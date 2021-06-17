class SomeType {
  method() {
    console.log("A method on SomeType ran!");
  }
}

const myInstance = new SomeType();

const myProxyInstance = new Proxy(myInstance, {
  get() {
    console.log("We tried to access a field on the proxy!");
  },
});
myInstance.method();
myProxyInstance.method();
