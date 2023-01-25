export default async function getBrandsDetails(params, options) {
  return new Promise((resolve, reject) => {
    const { index, ...queryOptions } = options;
    index.search(
      {
        query: params.query,
        hitsPerPage: params.limit,
        ...queryOptions,
      },
      (err, data = {}) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      }
    );
  });
}
