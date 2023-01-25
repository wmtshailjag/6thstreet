import { searchParams } from "./config";

export default function getBrands(gender = "", options = {}) {
  const { index } = options;
  return new Promise((resolve, reject) => {
    const newSearchParams = Object.assign({}, searchParams);
    newSearchParams.hitsPerPage = 0;
    newSearchParams.facets = ["brand_name", "url"];
    newSearchParams.facetFilters = [[`gender: ${gender}`]];

    index.search({ query: "", ...newSearchParams }, (err, data = {}) => {
      if (err) {
        return reject(err);
      }
      const brandNamesObj = data.facets.brand_name;
      let brands = [];

      if (!brandNamesObj) {
        return resolve({ data: brands });
      }

      Object.keys(brandNamesObj).forEach((item) => {
        brands = [
          ...brands,
          {
            name: item,
            count: brandNamesObj[item],
          },
        ];
      });

      return resolve({ data: brands });
    });
  });
}
