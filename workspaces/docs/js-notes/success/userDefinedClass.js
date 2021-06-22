class SomeType {
  method() {
    console.log("This method ran!");
  }
}

const myInstance = new SomeType();
const myProxyInstance = new Proxy(myInstance, {});
SomeType.prototype.method.call(myInstance);
SomeType.prototype.method.call(myProxyInstance);
