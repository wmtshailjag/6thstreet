const looseMatch = (str) => (item) => item.match(str);

const intersectArrays = (arr1, arr2, options = {}) => {
  const matchFunc = options.matchFunc || looseMatch;
  return arr1.filter((v) => arr2.find((i) => matchFunc(v)(i)));
};

export { intersectArrays };
