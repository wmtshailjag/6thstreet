const fetch = require('node-fetch');

function getMultiProductWithObjectID(objectIDs, options) {
  const {
    index
  } = options;
  return new Promise((resolve, reject) => {
    if (!index || !objectIDs) {
      return reject('No index or sku provided');
    }

    index.getObjects(objectIDs).then(({
      results,
      error
    }) => {
      if (error) {
        return reject(error);
      }

      return resolve({
        data: results
      });
    });
  });
}

export default async function getMultiProducts({
  objectIDs = []
}, options = {}) {
  const product = await getMultiProductWithObjectID(objectIDs, options);
  return product;
}