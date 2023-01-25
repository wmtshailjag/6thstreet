export const SET_PLP_DATA = "SET_PLP_DATA";
export const SET_PLP_LOADING = "SET_PLP_LOADING";
export const SET_PLP_INIT_FILTERS = "SET_PLP_INIT_FILTERS";
export const SET_PLP_PAGE = "SET_PLP_PAGE";
export const RESET_PLP_PAGE = "RESET_PLP_PAGE";
export const SET_LOADING = "SET_LOADING";
export const SET_LAST_HOME_ITEM = "SET_LAST_HOME_ITEM";
export const SET_PLP_WIDGET_DATA = "SET_PLP_WIDGET_DATA";
export const SET_PREV_PRODUCT_SKU = "SET_PREV_PRODUCT_SKU";
export const SET_PREV_PATH = "SET_PREV_PATH";
export const UPDATE_PLP_INIT_FILTERS = "UPDATE_PLP_INIT_FILTERS";
export const SET_BRAND_URL = "SET_BRAND_URL";
export const setPLPWidget = (data) => ({
  type: SET_PLP_WIDGET_DATA,
  plpWidgetData: data,
});
export const setPLPPage = (pageProducts, page) => ({
  type: SET_PLP_PAGE,
  pageProducts,
  page,
});

export const setPrevProductSku = (sku) => ({
  type: SET_PREV_PRODUCT_SKU,
  sku,
});

export const setLastTapItemOnHome = (item) => ({
  type: SET_LAST_HOME_ITEM,
  item,
});

export const setPrevPath = (prevPath) => ({
  type: SET_PREV_PATH,
  prevPath,
});

export const setBrandurl = (brand_url) => ({
  type: SET_BRAND_URL,
  brand_url,
});

export const resetPLPPage = () => ({
  type: RESET_PLP_PAGE,
});

export const setProductLoading = (isLoading) => ({
  type: SET_LOADING,
  isLoading,
});

export const setPLPData = (response, options, isInitial) => ({
  type: SET_PLP_DATA,
  response,
  options,
  isInitial,
});

export const setPLPLoading = (isLoading) => ({
  type: SET_PLP_LOADING,
  isLoading,
});

export const setPLPInitialFilters = (initialFilters, initialOptions) => ({
  type: SET_PLP_INIT_FILTERS,
  initialFilters,
  initialOptions,
});

export const updatePLPInitialFilters = (
  updatedFilters,
  facet_key,
  facet_value
) => ({
  type: UPDATE_PLP_INIT_FILTERS,
  updatedFilters,
  facet_key,
  facet_value,
});
