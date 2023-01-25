export const SET_BRAND_CMS_LOADING = "SET_BRAND_CMS_LOADING";
export const SET_BRAND_CMS_DATA = "SET_BRAND_CMS_DATA";

export const setBrandCMSLoading = (isLoading) => ({
  type: SET_BRAND_CMS_LOADING,
  isBrandCmsLoading: isLoading,
});
export const setBrandCMSData = (data) => ({
  type: SET_BRAND_CMS_DATA,
  data,
});

