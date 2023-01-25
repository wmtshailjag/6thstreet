import Url from "url-parse";
import { getIndex } from "../utils";
import { getIndexBySort } from "../utils/filters";

function getSearchPLP(URL, options = {}, params = {}) {
  const { client, env } = options;
  return new Promise((resolve, reject) => {
    const parsedURL = new Url(URL, true);
    const queryParams = parsedURL.query;
    const { locale } = queryParams;

    if (!locale) {
      return reject(new Error("Invalid locale"));
    }

    // Get index to search in
    let indexName = getIndex(queryParams.locale, env);
    if (queryParams.sort) {
      indexName = getIndexBySort(queryParams.sort, env, queryParams.locale);
    }
    let queries = [];

    // Build search query
    params.map((param) => {
      const queryCopy = {
        params: {
          query: param,
          page: 0,
          hitsPerPage: 2,
        },
        indexName: indexName,
      };
      queries.push(queryCopy);
    });

    client.search(queries, (err, res = {}) => {
      if (err) {
        return reject(err);
      }
      const output = {
        data: res.results,
      };

      return resolve(output);
    });
  });
}

export default getSearchPLP;
