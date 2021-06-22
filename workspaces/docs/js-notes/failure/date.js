const date = new Date();
const dateProxy = new Proxy(date, {});
Date.prototype.getDate.call(date);
Date.prototype.getDate.call(dateProxy);
