import Url from "url-parse";
import {
  searchParams as defaultSearchParams,
} from "./config";
import {
  formatNewInTag,
  getAlgoliaFilters,
  getIndex,
} from "./utils";
import {
  getIndexBySort,
} from "./utils/filters";

function getPromotions(URL, options = {}, params = {}) {
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

    client.search([query], (err, res = {}) => {
      if (err) {
        return reject(err);
      }

      const { hits, facets, nbHits, nbPages, hitsPerPage, queryID } =
        res.results[0];

      const output = {
        facets,
        data: hits.map(formatNewInTag),
        meta: {
          page: res.page,
          limit: hitsPerPage,
          hits_count: nbHits,
          page_count: nbPages,
          query: queryParams,
        },
        queryID,
      };

      return resolve(output);
    });
  });
}

export default getPromotions;
