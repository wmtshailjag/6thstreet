import Url from "url-parse";
import {
  CURRENCY_STRIP_INSIGNIFICANT_ZEROS,
  NUMERIC_FILTERS,
  searchParams as defaultSearchParams,
  SIZE_FILTERS,
  VISIBLE_FILTERS,
  VISIBLE_GENDERS,
} from "../config";
import { translate } from "../config/translations";
import {
  deepCopy,
  formatNewInTag,
  getAlgoliaFilters,
  getCurrencyCode,
  getIndex,
} from "../utils";
import { intersectArrays } from "../utils/arr";
import {
  formatPrice,
  getFacetLabel,
  getFacetSlug,
  getIndexBySort,
  getLabel,
} from "../utils/filters";
import { getQueryValues } from "../utils/query";
import {
  makeCategoriesLevel1Filter,
  makeCategoriesWithoutPathFilter,
} from "./categories";

const getPriceRangeData = ({ currency, lang }) => {
  const priceRangeData = {};
  let multiplier = 100;

  if (!CURRENCY_STRIP_INSIGNIFICANT_ZEROS.includes(currency)) {
    multiplier = 10;
  }

  for (let i = 0; i <= 8; i += 1) {
    const start = i * multiplier;
    const end = start + multiplier;
    const facetValue = `gte${start},lte${end}`;

    priceRangeData[facetValue] = {
      label: `${formatPrice(start, currency)} - ${formatPrice(end, currency)}`,
      facet_key: `price.${currency}.default`,
      facet_value: facetValue,
      is_selected: false,
    };

    if (i === 8) {
      const greaterThanFacetValue = `gte${end}`;
      priceRangeData[greaterThanFacetValue] = {
        label: `${formatPrice(end, currency)} ${translate("and_above", lang)}`,
        facet_key: `price.${currency}.default`,
        facet_value: greaterThanFacetValue,
        is_selected: false,
      };
    }
  }

  return priceRangeData;
};

const getDiscountData = ({ currency, lang }) => {
  const discountData = {};
  for (let i = 10; i <= 70; i += 10) {
    const facetValue = `gte${i}`;
    discountData[facetValue] = {
      label: `${i}% ${translate("and_above", lang)}`,
      facet_key: "discount",
      facet_value: `gte${i}`,
      is_selected: false,
    };
  }

  return discountData;
};

const formatFacetData = ({ allFacets, facetKey }) => {
  const data = allFacets[facetKey];

  return Object.keys(data).reduce((acc, facetValue) => {
    acc[facetValue] = {
      facet_value: facetValue,
      facet_key: facetKey,
      label: getFacetLabel(facetValue),
      is_selected: false,
      product_count: data[facetValue],
    };

    return acc;
  }, {});
};

const filterKeys = ({ allFacets, keys }) => {
  let filteredKeys = [];

  keys.forEach((key) => {
    if (allFacets[key]) {
      filteredKeys = [...filteredKeys, key];
    }
  });

  return filteredKeys;
};

function getFilters({ locale, facets, raw_facets, query, additionalFilter }) {
  const [lang, country] = locale.split("-");
  const currency = getCurrencyCode(country);

  const filtersObject = {};

  // Sort
  filtersObject.sort = {
    label: translate("sort_by", lang),
    category: "sort",
    is_radio: true,
    selected_filters_count: 0,
    data: {
      recommended: {
        label: translate("our_picks", lang),
        facet_key: "sort",
        facet_value: "recommended",
        is_selected: false,
      },
      latest: {
        label: translate("latest", lang),
        facet_key: "sort",
        facet_value: "latest",
        is_selected: false,
      },
      discount: {
        label: translate("highest_discount", lang),
        facet_key: "sort",
        facet_value: "discount",
        is_selected: false,
      },
      price_low: {
        label: translate("price_low", lang),
        facet_key: "sort",
        facet_value: "price_low",
        is_selected: false,
      },
      price_high: {
        label: translate("price_high", lang),
        facet_key: "sort",
        facet_value: "price_high",
        is_selected: false,
      },
    },
  };

  filtersObject.categories_without_path = makeCategoriesWithoutPathFilter({
    facets,
    query,
  });

  // Facet filters
  const visibleFacetsKeys = filterKeys({
    allFacets: facets,
    keys: VISIBLE_FILTERS,
  });

  visibleFacetsKeys.forEach((facetKey) => {
    const slug = getFacetSlug(facetKey);
    const data = formatFacetData({ allFacets: facets, facetKey });

    filtersObject[slug] = {
      label: getLabel(facetKey, lang),
      category: slug,
      is_radio: false,
      selected_filters_count: 0,
      data,
    };
  });

  // Size filters
  const sizeFacetsKeys = filterKeys({ allFacets: facets, keys: SIZE_FILTERS });
  let sizesObject = {
    label: getLabel("sizes", lang),
    category: "sizes",
    is_radio: false,
    selected_filters_count: 0,
    data: {},
  };

  sizeFacetsKeys.forEach((facetKey) => {
    const facetData = formatFacetData({ allFacets: facets, facetKey });
    sizesObject = {
      ...sizesObject,
      data: {
        ...sizesObject.data,
        [facetKey]: {
          facet_key: facetKey,
          label: getLabel(facetKey, lang),
          selected_filters_count: 0,
          subcategories: facetData,
        },
      },
    };
  });

  if (Object.keys(sizesObject.data).length > 0) {
    filtersObject.sizes = sizesObject;
  }

  // Price range
  filtersObject[`price.${currency}.default`] = {
    label: translate("price_range", lang),
    category: `price.${currency}.default`,
    is_radio: true,
    selected_filters_count: 0,
    data: getPriceRangeData({ currency, lang }),
  };

  // Discount
  filtersObject.discount = {
    label: translate("discount", lang),
    category: "discount",
    is_radio: true,
    selected_filters_count: 0,
    data: getDiscountData({ lang }),
  };

  filtersObject["categories.level1"] = makeCategoriesLevel1Filter({
    facets,
    query,
  });

  const _filtersUnselected = deepCopy(filtersObject);

  // Update filtersObject based on query
  // Marking the selected filters
  Object.keys(query).forEach((facetKey) => {
    let facetValues = [query[facetKey]];

    if (!NUMERIC_FILTERS.includes(facetKey)) {
      facetValues = query[facetKey].split(",");
    }

    const category = facetKey.includes("size")
      ? filtersObject.sizes
      : filtersObject[facetKey];

    if (category != null) {
      facetValues.forEach((facetValue) => {
        if (category.data[facetValue]) {
          category.data[facetValue].is_selected = true;
          category.selected_filters_count += 1;
        }

        // marking the selected subcategories filters
        if (facetKey === "categories_without_path") {
          const cat = facetValue;
          if (
            category.data[cat] &&
            category.data[cat].subcategories[facetValue]
          ) {
            category.data[cat].selected_filters_count += 1;
            category.data[cat].subcategories[facetValue].is_selected = true;
            category.selected_filters_count += 1;
          }
        }

        // marking the sizes filters
        if (facetKey.includes("size")) {
          if (category.data[facetKey].subcategories[facetValue]) {
            category.selected_filters_count += 1;
            category.data[facetKey].selected_filters_count += 1;
            category.data[facetKey].subcategories[
              facetValue
            ].is_selected = true;
          }
        }
      });
    }
  });
  let finalFilterObj = filtersObject;
  if (additionalFilter) {
    Object.keys(facets).map((facet) => {
      finalFilterObj = {
        [facet]: filtersObject[facet],
      };
    });
  }
  return {
    filters: finalFilterObj,
    _filtersUnselected,
  };
}

/*
Removes `category` facets for:
- other genders than the selected ones
- 'Outlet'
*/

const filterOutCategoryValues = ({
  values = {},
  facetGender = {},
  queryGender = "",
}) => {
  const queryGenderValues = queryGender ? queryGender.split(",") : [];
  const facetGenderValues = Object.keys(facetGender);
  const genders = intersectArrays(queryGenderValues, facetGenderValues, {
    matchFunc: (v) => (i) => i === v,
  });

  return Object.keys(values).reduce((acc, key) => {
    let keepValue = true;

    if (genders.length) {
      keepValue = !!genders.find((genderValue) => {
        /*
Women and Men -> Women /// Shoes
Men /// Shoes

Kids -> Kids /// Girl /// Shoes
Kids /// Boy /// Shoes
Kids /// Baby Girl /// Shoes
Kids /// Baby Boy /// Shoes
*/

        if (VISIBLE_GENDERS.KIDS[genderValue]) {
          return key.match(`Kids ///`);
        }

        if (VISIBLE_GENDERS.OTHER[genderValue]) {
          return key.match(`${genderValue} ///`);
        }

        return false;
      });
    }

    // Remove "Outlet"
    if (key.match("Outlet")) {
      keepValue = false;
    }

    if (keepValue) {
      acc[key] = values[key];
    }

    return acc;
  }, {});
};

const filterOutGenderValues = ({ values, query }) => {
  const queryValues = getQueryValues({ query, path: "gender" });

  return Object.keys(values).reduce((acc, key) => {
    let keepValue = true;
    if (!VISIBLE_GENDERS.KIDS[key] && !VISIBLE_GENDERS.OTHER[key]) {
      keepValue = false;
    }

    if (!!Object.keys(queryValues).length && !queryValues[key]) {
      keepValue = false;
    }

    if (keepValue) {
      acc[key] = values[key];
    }

    return acc;
  }, {});
};

const isCategoryFacet = (facetKey) =>
  // Avoid processing 'categories.level0'
  facetKey.match(/categories\.level([1-9]\d*)/);
const _formatFacets = ({ facets, queryParams }) => {
  const { gender } = queryParams;

  return Object.entries(facets).reduce((acc, [facetKey, facetValue]) => {
    if (isCategoryFacet(facetKey)) {
      acc[facetKey] = filterOutCategoryValues({
        values: { ...facetValue },
        facetGender: facets.gender,
        queryGender: gender,
      });

      return acc;
    }

    // if (facetKey === "gender") {
    //   acc[facetKey] = filterOutGenderValues({
    //     values: { ...facetValue },
    //     query: queryParams,
    //   });

    //   return acc;
    // }

    acc[facetKey] = facetValue;
    return acc;
  }, {});
};

function getPLP(URL, options = {}, params = {}) {
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
    const index = client.initIndex(indexName);

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
    let initialFacetFilter = deepCopy(facetFilters);
    let initialFilterArg;
    let filterOption = [];
    initialFacetFilter.map((entry, index) => {
      if (
        entry[0].split(":")[0].includes("categories.level") ||
        entry[0].split(":")[0].includes("brand_name") ||
        entry[0].split(":")[0].includes("gender")
      ) {
        filterOption[index] = entry[0].split(":")[0];
      }
    });

    if (initialFacetFilter.length === 1) {
      initialFilterArg = initialFacetFilter[0];
    } else if (initialFacetFilter.length > 1) {
      if (
        filterOption.findIndex(
          (element) => element && element.includes("categories.level")
        ) !== -1
      ) {
        initialFilterArg = initialFacetFilter[0];
      } else if (filterOption.includes("brand_name")) {
        initialFilterArg =
          initialFacetFilter[filterOption.indexOf("brand_name")];
      } else if (filterOption.includes("gender")) {
        initialFilterArg = initialFacetFilter[filterOption.indexOf("gender")];
      }
    }
    const queryCopy = {
      params: {
        ...defaultSearchParams,
        facetFilters: [initialFilterArg],
        numericFilters,
        query: q,
        page,
        hitsPerPage: limit,
        clickAnalytics: true,
      },
      indexName: indexName,
    };

    let selectedFilterArr = [];
    let exceptFilter = ["page", "q", "sort", "discount", "visibility_catalog"];
    Object.keys(params).map((option) => {
      if (!exceptFilter.includes(option)) {
        selectedFilterArr.push(option);
      }
    });

    let queries = [];
    queries.push(query);
    if (selectedFilterArr.length > 0) {
      selectedFilterArr.map((filter) => {
        let finalFacetObj = [];
        facetFilters.map((facetfilter) => {
          if (
            selectedFilterArr.includes(facetfilter[0].split(":")[0]) &&
            facetfilter[0].split(":")[0] !== filter
          ) {
            finalFacetObj.push(facetfilter);
          }
        });
        let searchParam = JSON.parse(JSON.stringify(defaultSearchParams));
        searchParam["facets"] = [filter];
        queries.push({
          indexName: indexName,
          params: {
            ...searchParam,
            facetFilters: finalFacetObj,
            numericFilters,
            query: q,
            page,
            hitsPerPage: limit,
            clickAnalytics: true,
          },
        });
      });
    }
    queries.push(queryCopy);
    client.search(queries, (err, res = {}) => {
      if (err) {
        return reject(err);
      }

      const { hits, facets, nbHits, nbPages, hitsPerPage, queryID } =
        res.results[0];

      let finalFiltersData = deepCopy(res.results[0]);

      if (Object.values(res.results).length > 1) {
        Object.entries(res.results).map((result, index) => {
          if (index > 0 && index < Object.values(res.results).length - 1) {
            Object.entries(result[1].facets).map((entry) => {
              finalFiltersData.facets[[entry[0]]] = entry[1];
            });
          } else if (index === Object.values(res.results).length - 1) {
            for (let key = 0; key <= 4; key++) {
              if (result[1].facets[`categories.level${key}`]) {
                finalFiltersData.facets[`categories.level${key}`] =
                  result[1].facets[`categories.level${key}`];
              }
            }
          }
        });
      }
      const facetsFilter = deepCopy(finalFiltersData.facets);
      const { filters, _filtersUnselected } = getFilters({
        locale,
        facets: _formatFacets({ facets: facetsFilter, queryParams }),
        raw_facets: facets,
        query: queryParams,
        additionalFilter: false,
      });

      const output = {
        facets,
        data: hits.map(formatNewInTag),
        filters,
        meta: {
          page: res.page,
          limit: hitsPerPage,
          hits_count: nbHits,
          page_count: nbPages,
          query: queryParams,
        },
        _filters_unselected: _filtersUnselected,
        queryID,
      };

      return resolve(output);
    });
  });
}

export { getPLP };
