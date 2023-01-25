import PropTypes from "prop-types";

export {
  addressesType,
  addressType,
  ADDRESS_BOOK,
  baseOrderInfoType,
  customerType,
  DASHBOARD,
  MY_ORDERS,
  MY_WISHLIST,
  NEWSLETTER_SUBSCRIPTION,
  ordersType,
  orderType,
  regionType,
} from "SourceType/Account";

export const tabType = PropTypes.shape({
  url: PropTypes.string,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  alternativePageName: PropTypes.string,
  linkClassName: PropTypes.string,
});

export const tabMapType = PropTypes.objectOf(tabType);

export const STORE_CREDIT = "storecredit";
export const CLUB_APPAREL = "club-apparel";
export const RETURN_ITEM = "return-item";
export const EXCHANGE_ITEM = "exchange-item";
export const CONTACT_HELP = "contact-help";
export const SETTINGS_SCREEN = "settings";
export const FAQ = "faq";
export const RETURN_POLICY = "return-information";
export const SHIPPING_POLICY = "shipping-policy";
export const WALLET_PAYMENTS = "wallet-payments"

export const activeTabType = PropTypes.string;
