const getQueryValues = ({ query, path }) => {
  if (!query[path]) {
    return {};
  }
  return query[path].split(',').reduce((acc, v) => {
    acc[v] = true;
    return acc;
  }, {});
};

export { getQueryValues };
