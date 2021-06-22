const buf = Buffer(5);
const bufProxy = new Proxy(buf, {});
Buffer.prototype.toJSON.call(bufProxy);
