import { getStore } from "Store";
import { VIEW_SEARCH_RESULTS_ALGOLIA } from "Util/Event";
import AlgoliaSDK from "../../../../packages/algolia-sdk";
import { queryString } from "../helper/Object";
import isMobile from "Util/Mobile";

export const PRODUCT_HIGHLIGHTS = [
  "color",
  "gender",
  "material",
  "leg_length",
  "skirt_length",
  "sleeve_length",
  "dress_length",
  "neck_line",
  "heel_height",
  "toe_shape",
];

export class Algolia {
  constructor(options = {}) {
    const {
      AppState: { locale: appLocale },
    } = getStore().getState();

    const {
      locale = appLocale || process.env.REACT_APP_LOCATE,
      env = process.env.REACT_APP_ALGOLIA_ENV,
      appId = process.env.REACT_APP_ALGOLIA_APP_ID,
      adminKey = process.env.REACT_APP_ALGOLIA_KEY,
      index = "",
    } = options;
    AlgoliaSDK.init(appId, adminKey);

    AlgoliaSDK.setIndex.call(AlgoliaSDK, locale, env, index);
  }

  async getIndex() {
    return AlgoliaSDK.index;
  }

  async getPLP(params = {}) {
    const productCount = isMobile.any() ? 10 : 30;
    const {
      AppState: { locale = process.env.REACT_APP_LOCATE },
    } = getStore().getState();

    const url = queryString({
      ...params,
      limit: productCount,
      // TODO: get proper locale
      locale,
    });

    // TODO: add validation
    return AlgoliaSDK.getPLP(`/?${url}`, params);
  }

  async getProductForSearchContainer(params = {}, suggestionQuery) {
    const productCount = isMobile.any() ? 16 : 30;
    const {
      AppState: { locale = process.env.REACT_APP_LOCATE },
    } = getStore().getState();

    const url = queryString({
      ...params,
      limit: productCount,
      locale,
    });

    return AlgoliaSDK.getProductForSearchContainer(`/?${url}`,params, suggestionQuery);
  }

  async getPromotions(params = {}) {
    const productCount = isMobile.any() ? 16 : 30;
    const {
      AppState: { locale = process.env.REACT_APP_LOCATE },
    } = getStore().getState();

    const url = queryString({
      ...params,
      limit: productCount,
      locale,
    });

    return AlgoliaSDK.getPromotions(`/?${url}`,params);
  }

  async getSearchPLP(params = {}) {
    const productCount = isMobile.any() ? 16 : 30;
    const {
      AppState: { locale = process.env.REACT_APP_LOCATE },
    } = getStore().getState();

    const url = queryString({
      ...params,
      limit: productCount,
      // TODO: get proper locale
      locale,
    });

    // TODO: add validation
    return AlgoliaSDK.getSearchPLP(`/?${url}`, params);
  }

  async getPDP(params = {}) {
    const { id = "", highlights = PRODUCT_HIGHLIGHTS } = params;

    // TODO: add validation
    return AlgoliaSDK.getPDP({ id, highlights });
  }

  async getProductBySku(params = {}) {
    const { sku = "", highlights = PRODUCT_HIGHLIGHTS } = params;

    // TODO: add validation
    return AlgoliaSDK.getProductBySku({ sku, highlights });
  }

  searchBy(params) {
    return AlgoliaSDK.searchBy(params);
  }

  async getBrands(gender) {
    // TODO: validate data, possible cache
    const { data = [] } = (await AlgoliaSDK.getBrands(gender)) || {};
    return data;
  }

  async getWishlistProduct(idsArray) {
    // TODO: validate data, possible cache
    const { data = [] } = (await AlgoliaSDK.getWishlistProduct(idsArray)) || {};
    return data;
  }

  async getMultiProducts(idsArray) {
    // TODO: validate data, possible cache
    const { data = [] } = (await AlgoliaSDK.getMultiProducts(idsArray)) || {};
    return data;
  }

  async getPopularBrands(limit) {
    // TODO: validate data, possible cache
    const { data = [] } = (await AlgoliaSDK.getPopularBrands(limit)) || {};
    return data;
  }

  async logAlgoliaAnalytics(event_type, name, params, algoliaParams) {
    switch (event_type) {
      case "view": {
        switch (name) {
          case VIEW_SEARCH_RESULTS_ALGOLIA: {
            if (params.items.length > 0) {
              const { data = [] } =
                (await AlgoliaSDK.logAlgoliaAnalytics(
                  event_type,
                  name,
                  algoliaParams.objectIDs,
                  algoliaParams.queryID,
                  algoliaParams.userToken,
                  []
                )) || {};
              return data;
            } else {
              const { data = [] } =
                (await AlgoliaSDK.logSearchResults(
                  event_type,
                  "No_Search_Result",
                  algoliaParams.objecIDs ? algoliaParams.objecIDs : [],
                  algoliaParams.queryID,
                  algoliaParams.userToken,
                  [`search:${algoliaParams.queryID}`]
                )) || {};
              return data;
            }
          }
        }
      }
      case "click": {
        const { data = [] } =
          (await AlgoliaSDK.logAlgoliaAnalytics(
            event_type,
            name,
            algoliaParams.objectIDs,
            algoliaParams.queryID,
            algoliaParams.userToken,
            algoliaParams.position
          )) || {};
        return data;
      }

      case "conversion": {
        const { data = [] } =
          (await AlgoliaSDK.logAlgoliaAnalytics(
            event_type,
            name,
            algoliaParams.objectIDs,
            algoliaParams.queryID,
            algoliaParams.userToken
          )) || {};
        return data;
      }
    }
  }

  async getSuggestions(query, limit) {
    const data = (await AlgoliaSDK.getSuggestions(query, limit)) || {};
    return data;
  }

  async autocompleteSearch(query, limit) {
    const data = (await AlgoliaSDK.autocompleteSearch(query, limit)) || {};
    return data;
  }

  async getBrandsDetails(query, limit) {
    const data = (await AlgoliaSDK.getBrandsDetails(query, limit)) || {};
    return data;
  }

  async getShopByBrands(query, limit) {
    const data = (await AlgoliaSDK.getShopByBrands(query, limit)) || {};
    return data;
  }

  async getTopSearches() {
    const data = (await AlgoliaSDK.getTopSearches()) || [];
    return data;
  }
}

export default Algolia;
