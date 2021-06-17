const date = new Date();
const dateProxy = new Proxy(date, {
  get(field) {
    console.log("Accessing a field on the promise!");
    return date[field];
  },
});
console.log(date.getTime());
dateProxy.getTime();
