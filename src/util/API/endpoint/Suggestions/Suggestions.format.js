import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import BrowserDatabase from "Util/BrowserDatabase";

const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
  ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
  : "home";

const BRANDS_RESULT_LIMIT = 4;

const getBrandsArrayFromFacets = ({ facets = {} }) => {
  try {
    if (!facets.brand_name) {
      return [];
    }

    return Object.keys(facets.brand_name || {})
      .map((item) => ({ brand_name: item, count: facets.brand_name[item] }))
      .slice(0, BRANDS_RESULT_LIMIT);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return [];
  }
};

// eslint-disable-next-line import/prefer-default-export
export const formatProductSuggestions = (rawData) => {
  const data = {
    brands: getBrandsArrayFromFacets(rawData),
    products: rawData.data,
  };

  return data;
};
