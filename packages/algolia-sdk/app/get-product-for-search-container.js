import Url from "url-parse";
import { searchParams as defaultSearchParams } from "./config";
import { formatNewInTag, getAlgoliaFilters, getIndex } from "./utils";
import { getIndexBySort } from "./utils/filters";

function getProductForSearchContainer(
  URL,
  options = {},
  params = {},
  suggestionQuery
) {
  const { client, env } = options;

  return new Promise((resolve, reject) => {
    const parsedURL = new Url(URL, true);
    const queryParams = parsedURL.query;

    const { q = "", page = 0, limit = 16, locale } = queryParams;

    if (!locale) {
      return reject(new Error("Invalid locale"));
    }

    // Get index to search in
    let indexName = getIndex(queryParams.locale, env);
    if (queryParams.sort) {
      indexName = getIndexBySort(queryParams.sort, env, queryParams.locale);
    }

    // Build search query
    const { facetFilters, numericFilters } = getAlgoliaFilters(queryParams);
    const query = {
      indexName: indexName,
      params: {
        ...defaultSearchParams,
        facetFilters,
        numericFilters,
        query: q,
        page,
        hitsPerPage: limit,
        clickAnalytics: true,
      },
    };

    let queries = [];
    queries.push(query);
    queries.push(suggestionQuery);

    client.search(queries, (err, res = {}) => {
      if (err) {
        return reject(err);
      }

      const { hits, nbHits, nbPages, hitsPerPage, queryID } = res.results[0];

      const output = {
        productData: {
          data: hits.map(formatNewInTag),
          meta: {
            page: res.page,
            limit: hitsPerPage,
            hits_count: nbHits,
            page_count: nbPages,
            query: queryParams,
          },
          queryID,
        },
        suggestionData: res.results[1],
      };

      return resolve(output);
    });
  });
}

export default getProductForSearchContainer;
