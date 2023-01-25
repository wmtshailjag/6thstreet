import MobileAPI from "src/util/API/provider/MobileAPI";

export const getPartyInfo = ({ storeId }) =>
  MobileAPI.get(`bambuser/data/${storeId}`) || {};

