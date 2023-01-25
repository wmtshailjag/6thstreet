import { SET_BRAND_CMS_LOADING, SET_BRAND_CMS_DATA } from "./BrandCms.action";

export const getInitialState = () => ({
  brandCmsData: [],
  isBrandCmsLoading: true,
});

export const BrandCmsReducer = (state = getInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case SET_BRAND_CMS_DATA:
      const { data: brandCmsData = [] } = action;
      return {
        ...state,
        brandCmsData,
      };

    case SET_BRAND_CMS_LOADING:
      const { isBrandCmsLoading } = action;
      return {
        ...state,
        isBrandCmsLoading,
      };

    default:
      return state;
  }
};

export default BrandCmsReducer;
