import { formatNewInTag, formatResult } from "./utils";

function getProduct(id, highlights, options) {
  const { index } = options;

  return new Promise((resolve, reject) => {
    index.search(
      "",
      {
        filters: `objectID:${id}`,
        // clickAnalytics: true,
      },
      (error, data) => {
        if (error) {
          return reject(error);
        }

        if (!!data.nbHits) {
          data.hits = data.hits[0];
        } else {
          data.hits = null;
        }

        const result = formatResult(data);
        return resolve({
          ...result,
          data: result.data ? formatData(result.data) : {},
        });
      }
    );
  });
}

function formatData(productData) {
  const data = formatNewInTag(productData);

  // format highlighted attributes
  const { _highlightResult, ...rest } = data;

  if (!_highlightResult) {
    return {
      highlighted_attributes: null,
      ...rest,
    };
  }

  const highlighted_attributes = Object.keys(_highlightResult)
    .map((key) => {
      return {
        key,
        value: _highlightResult[key]["value"],
      };
    })
    .filter((item) => {
      return item !== undefined && item.value !== undefined;
    });

  return {
    highlighted_attributes,
    ...rest,
  };
}

function getProductVariants(skuList = [], highlights, options) {
  return Promise.all(
    skuList.map(async (sku) => {
      const product = await getProduct(sku, highlights, options);
      return product.data ? product.data : {};
    })
  );
}

export default async function getPDP(
  { id = "", highlights = "*" },
  options = {}
) {
  return await getProduct(id, highlights, options);
}
