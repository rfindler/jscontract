const onlyTakesStringObjects = (aString: String): void => {
  console.log(typeof aString);
  if (!(aString instanceof String)) {
    throw new Error(`The value \`${aString}\` is not a String object!`);
  }
};

const x = { __proto__: String.prototype };
const y = { ...String.prototype };
// onlyTakesStringObjects(x);
onlyTakesStringObjects(y);
