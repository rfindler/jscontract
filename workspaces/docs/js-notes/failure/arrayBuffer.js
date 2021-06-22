const buf = new ArrayBuffer(5);
const bufProxy = new Proxy(buf, {});
try {
  ArrayBuffer.prototype.slice.call(bufProxy, 5);
} catch (err) {
  console.log(err);
  console.log("moving on...");
}
