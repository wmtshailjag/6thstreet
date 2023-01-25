import MobileAPI from "../../provider/MobileAPI";

// eslint-disable-next-line import/prefer-default-export

export const sendNotifyMeEmail = (data) =>
  MobileAPI.post(`/product-alert`, data) || {};

export const isClickAndCollectAvailable = ({ brandName, sku }) =>
  MobileAPI.get(
    `/clicktocollect/is-available?brandName=${brandName}&sku=${sku}`
  ) || {};

export const getClickAndCollectStores = ({
  brandName,
  sku,
  latitude,
  longitude,
}) =>
  MobileAPI.get(
    `/clicktocollect/stores?brandName=${brandName}&sku=${sku}&latitude=${latitude}&longitude=${longitude}`
  ) || {};

export const getStoreAddress = (storeNo) =>
  MobileAPI.get(`/clicktocollect/stores/${storeNo}/address`) || {};
