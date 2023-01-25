import urlparse from "url-parse";

import browserHistory from "Util/History";

import isMobile from "Util/Mobile";

import { clean } from "./Object";

const pipe =
  (...funcs) =>
  (value) =>
    funcs.reduce((v, f) => f(v), value);

/*
  input:
  '/women/clothing.html#q=&idx=stage_magento_english_products&p=0&dFR%5Bbrand_name%5D%5B0%5D=Adidas&dFR%5Bbrand_name%5D%5B1%5D=Ardene&hFR%5Bcategories.level0%5D%5B0%5D=Women%20%2F%2F%2F%20Clothing%20%2F%2F%2F%20Jumpsuits%20%26%20Playsuits&nR%5Bdiscount%5D%5B%3E%3D%5D%5B0%5D=10&nR%5Bvisibility_catalog%5D%5B%3D%5D%5B0%5D=1'

  output:
  {
    q: '',
    'categories.level2': 'Women /// Clothing /// Jumpsuits & Playsuits',
    discount: 'gte10',
    visibility_catalog: 'eq1'
  }
*/

const transformParams = (str) => str.replace("#", "?");
const parseURL = (URL) => urlparse(URL, true);

const hFR = (str) => str.match(/hFR\[(categories\.level)\d\]\[(\d)\]/);
const dFR = (str) => str.match(/dFR\[(.*)\]\[(\d)\]/);
const nR = (str) => str.match(/nR\[(\w*)\]\[(\W*)\]\[(\d)\]/);

const getAlgoliaOperator = (urlOperator = "") => {
  const operatorMap = {
    "<=": "lte",
    "<": "lt",
    ">=": "gte",
    ">": "gt",
    "=": "eq",
  };

  return operatorMap[urlOperator];
};

const getFacetParam = ({ urlParam = "", urlValue = "" }) => {
  const is_hFR = hFR(urlParam);
  if (is_hFR) {
    // Because in the URL, level is always 0 ☹️
    const level = urlValue.split("///").length - 1;
    const [, categoryKeyWithoutLevel] = is_hFR;
    return {
      facetKey: `${categoryKeyWithoutLevel}${level}`,
      facetValue: urlValue,
    };
  }

  const is_dFR = dFR(urlParam);
  if (is_dFR) {
    const [, facetKey] = is_dFR;
    return {
      facetKey,
      facetValue: urlValue,
    };
  }

  const is_nR = nR(urlParam);
  if (is_nR) {
    const [, facetKey, operator] = is_nR;
    const algoliaOperator = getAlgoliaOperator(operator);
    return {
      facetKey,
      facetValue: `${algoliaOperator}${urlValue}`,
    };
  }

  return {
    facetKey: null,
    facetValue: null,
  };
};

const buildQuery = (query = {}) =>
  Object.keys(query).reduce((acc, key) => {
    const value = query[key];
    const { facetKey, facetValue } = getFacetParam({
      urlParam: key,
      urlValue: value,
    });

    if (!facetKey) {
      return acc;
    }

    if (acc[facetKey] && facetKey !== "categories.level2") {
      acc[facetKey] += `,${facetValue}`;
    } else {
      acc[facetKey] = `${facetValue}`;
    }

    return acc;
  }, {});

const Parser = {
  parse(URL = "") {
    const parsedURL = pipe(transformParams, parseURL)(URL);
    const { query, pathname } = parsedURL;
    return {
      query,
      pathname,
    };
  },
  parsePLPWithoutQuery(URL = "") {
    const parsedURL = pipe(transformParams, parseURL)(URL);
    const { pathname, query } = parsedURL;
    const { p: dataPage } = query;
    const queryParams = buildQuery(query);
    let page = query.p ? dataPage : 0;

    let prodQuery =
      pathname.split("/").length > 2
        ? pathname.split(".html").join(" ").split("/").join(" ")
        : pathname.split("/")[1].split(".html")[0];
    const params = clean({
      q: prodQuery,
      page,
      ...queryParams,
    });
    return {
      params,
    };
  },
  parsePLP(URL = "") {
    URL = URL.replace(/%20&%20/gi, "%20%26%20");
    const { query } = this.parse(URL);
    const { q, p: page } = query;
    const queryParams = buildQuery(query);

    const params = clean({
      q,
      page,
      ...queryParams,
    });

    return {
      params,
    };
  },

  setPage(number) {
    const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
    url.searchParams.set("p", number);
    // update the URL, preserve the state
    const { pathname, search } = url;
    browserHistory.replace(pathname + search);
  },

  setParam(key, values = []) {
    const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
    if (isMobile.any()) {
      url.searchParams.set("p", 0);
    }
    // remove all matchign search params
    url.searchParams.forEach((_, sKey) => {
      if (sKey.includes(key)) {
        url.searchParams.delete(sKey);
        // url.searchParams.split(sKey)[0]
      }
    });

    const prefix = /categories\.level/.test(key) ? "hFR" : "dFR";
    if (Array.isArray(values)) {
      // For arrays case
      url.searchParams.append(`${prefix}[${key}][0]`, values.join(","));
    } else {
      // For non-array cases
      url.searchParams.append(`${prefix}[${key}][0]`, values);
    }

    // update the URL, preserve the state
    const { pathname, search } = url;
    browserHistory.replace(pathname + search);
  },
  setQuickFilterParam(key, values = []) {
    const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
    url.searchParams.set("p", 0);
    url.searchParams.forEach((_, sKey) => {
      if (sKey.includes(key)) {
        url.searchParams.delete(sKey);
      }
    });
    const prefix = /categories\.level/.test(key) ? "hFR" : "dFR";
    if (Array.isArray(values)) {
      url.searchParams.append(`${prefix}[${key}][0]`, values.join(","));
    } else {
      url.searchParams.append(`${prefix}[${key}][0]`, values);
    }
    const { pathname, search } = url;
    browserHistory.push(pathname + search);
    window.scrollTo(0,0)
  }
};

export default Parser;
