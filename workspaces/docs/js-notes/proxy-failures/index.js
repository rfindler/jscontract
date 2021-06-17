const toEvaluate = require("./call.json");

const buildCode = (obj) => {
  const { extra, instance, constructor, method, args } = obj;
  const CODE = `
  ${extra ? extra : ""}
  const el = ${instance}
  const proxy = new Proxy(el, {});
  ${constructor}.prototype.${method}.call(proxy, ${args.join(", ")})
  `;
  return CODE;
};

const logFailure = (obj, err) => {
  if (process.env.VERBOSE) {
    console.log(err);
  }
  console.log(`FAILURE FOR ${obj.constructor}`);
};

toEvaluate.forEach((obj) => {
  const code = buildCode(obj);
  try {
    if (process.env.VERBOSE) {
      console.log(code);
    }
    eval(code);
    console.log(`SUCCESS FOR ${obj.constructor}`);
  } catch (err) {
    logFailure(obj, err);
  }
});
