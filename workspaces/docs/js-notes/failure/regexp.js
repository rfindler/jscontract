const regExp = new RegExp("hello");
const regExpProxy = new Proxy(regExp, {});
RegExp.prototype.exec.call(regExpProxy, "hello");
