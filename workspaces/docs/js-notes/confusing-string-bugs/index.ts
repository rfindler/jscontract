const onlyTakesStringObjects = (aString: String): void => {
  if (!(aString instanceof String)) {
    throw new Error(`The value \`${aString}\` is not a String object!`);
  }
};

onlyTakesStringObjects("this is a string literal");
