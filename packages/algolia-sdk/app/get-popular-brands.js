import { capitalizeFirstLetters } from './utils';
const fetch = require('node-fetch');

export default function getPopularBrands(limit = 10, options = {}) {
  const { index } = options;
  const indexName = index.indexName;
  const apiKey = index.as.apiKey;
  const applicationID = index.as.applicationID;
  return new Promise((resolve, reject) => {
    // Multiply limit by 2 because there are duplicated values
    fetch(
      `https://analytics.algolia.com/2/filters/brand_name?index=${indexName}&limit=${2 *
        limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Algolia-API-Key': apiKey,
          'X-Algolia-Application-Id': applicationID
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }

        return response.json();
      })
      .then((result) => {
        const data = result.values;
        if (!data) {
          resolve({ data: [] });
        }

        // There are some duplicated values which are written diffently (eg. ALDO, Aldo..)
        // We need to make sure that only first letters are capitalized
        const brands = data.map((item) => capitalizeFirstLetters(item.value));

        // Remove duplicated brands
        resolve({ data: removeDuplicates(brands, limit) });
      })
      .catch((error) => reject(error));
  });
}

function removeDuplicates(data = [], limit = 10) {
  // remove duplicated and null or undefined values
  const newData = [...new Set(data)].filter(
    (item) => item != null || item != undefined
  );
  // limit no of values
  return newData.splice(0, limit);
}
