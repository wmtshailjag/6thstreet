const sortKeys = (obj, sortFunc) => {
  return Object.entries(obj)
    .sort(sortFunc)
    .reduce((acc, [key, value]) => {
      acc[key] = { ...value };
      return acc;
    }, {});
};

export { sortKeys };
