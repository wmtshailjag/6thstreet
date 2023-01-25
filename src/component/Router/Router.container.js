import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  mapDispatchToProps as sourceMapDispatchToProps,
  mapStateToProps as sourceMapStateToProps,
  RouterContainer as SourceRouterContainer,
  WishlistDispatcher,
} from "SourceComponent/Router/Router.container";
import { setCountry, setLanguage } from "Store/AppState/AppState.action";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import {
  setEddResponse,
  updateCustomerDetails,
} from "Store/MyAccount/MyAccount.action";
import SearchSuggestionDispatcher from "Store/SearchSuggestions/SearchSuggestions.dispatcher";
import {
  deleteAuthorizationToken,
  deleteMobileAuthorizationToken,
  getAuthorizationToken,
  getMobileAuthorizationToken,
  getUUID,
  getUUIDToken,
  isSignedIn,
  setAuthorizationToken,
  setMobileAuthorizationToken,
  setUUID,
  setUUIDToken,
} from "Util/Auth";
import { getCookie, getCountryFromUrl } from "Util/Url/Url";
import { v4 as uuidv4 } from "uuid";
import BrowserDatabase from "Util/BrowserDatabase";
import { INTL_BRAND, INTL_BRAND_ARABIC } from "../../util/Common/index";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";

export const MyAccountDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/MyAccount/MyAccount.dispatcher"
);
import { isArabic } from "Util/App";

export const mapStateToProps = (state) => ({
  ...sourceMapStateToProps(state),
  locale: state.AppState.locale,
  addressCityData: state.MyAccountReducer.addressCityData,
  eddResponse: state.MyAccountReducer.eddResponse,
  edd_info: state.AppConfig.edd_info,
  algoliaIndex: state.SearchSuggestions.algoliaIndex,
  currentGender: state.AppState.gender,
  is_live_party_enabled: state.AppConfig.is_live_party_enabled
});

export const mapDispatchToProps = (dispatch) => ({
  ...sourceMapDispatchToProps(dispatch),
  init: async () => {
    const { default: wishlistDisp } = await WishlistDispatcher;
    wishlistDisp.syncWishlist(dispatch);
  },
  setCountry: (value) => dispatch(setCountry(value)),
  setEddResponse: (response, request) =>
    dispatch(setEddResponse(response, request)),
  estimateEddResponse: (request, type) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.estimateEddResponse(dispatch, request, type)
    ),
  setLanguage: (value) => dispatch(setLanguage(value)),
  requestCustomerData: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.requestCustomerData(dispatch)
    ),
  getCitiesData: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.getCitiesData(dispatch)
    ),
  updateCustomerDetails: () => dispatch(updateCustomerDetails({})),
  getCart: (isNew = false) => CartDispatcher.getCart(dispatch, isNew),
  requestAlgoliaIndex: () =>
    SearchSuggestionDispatcher.requestAlgoliaIndex(dispatch),
  logout: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.logout(null, dispatch)
    ),
});

export class RouterContainer extends SourceRouterContainer {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    ...SourceRouterContainer.propTypes,
    locale: PropTypes.string,
    requestCustomerData: PropTypes.func.isRequired,
    getCart: PropTypes.func.isRequired,
    requestAlgoliaIndex: PropTypes.func.isRequired,
  };

  static defaultProps = {
    ...SourceRouterContainer.defaultProps,
    locale: "",
  };

  componentDidMount() {
    const {
      getCart,
      requestCustomerData,
      setEddResponse,
      eddResponse,
      addressCityData,
      getCitiesData,
      requestAlgoliaIndex,
      algoliaIndex,
      logout,
      edd_info,
    } = this.props;
    const countryCode = getCountryFromUrl();
    const decodedParams = atob(decodeURIComponent(getCookie("authData")));
    if (!getUUIDToken()) {
      setUUIDToken(uuidv4());
    }
    if (!getUUID()) {
      setUUID(uuidv4());
    }

    if (
      decodedParams.match("mobileToken") &&
      decodedParams.match("authToken")
    ) {
      const params = decodedParams.split("&").reduce((acc, param) => {
        acc[param.substr(0, param.indexOf("="))] = param.substr(
          param.indexOf("=") + 1
        );
        return acc;
      }, {});

      const { mobileToken } = params;
      const { authToken } = params;
      if (isSignedIn()) {
        if (
          getMobileAuthorizationToken() === mobileToken &&
          getAuthorizationToken() === authToken
        ) {
          requestCustomerData();
        } else {
          deleteAuthorizationToken();
          deleteMobileAuthorizationToken();
        }
        
      } else {
        setMobileAuthorizationToken(mobileToken);
        setAuthorizationToken(authToken);

        requestCustomerData().then(() => {
          window.location.reload();
        });
      }
      const QPAY_CHECK = JSON.parse(localStorage.getItem("QPAY_ORDER_DETAILS"));
      const TABBY_CHECK = JSON.parse(
        localStorage.getItem("TABBY_ORDER_DETAILS")
      );
      const now = new Date();
      if (
        (!QPAY_CHECK || now.getTime() >= QPAY_CHECK?.expiry) &&
        (!TABBY_CHECK || now.getTime() >= TABBY_CHECK?.expiry)
      ) {
        getCart(true);
      }
    } else {
      const cartID = BrowserDatabase.getItem("CART_ID_CACHE_KEY");
      if(cartID === parseInt(cartID, 10)) {
        logout();
      }
    }

    if (addressCityData.length === 0) {
      getCitiesData();
    }
    if (edd_info && edd_info.is_enable && edd_info.has_cross_border_enabled) {
      this.getInternationalEdd(countryCode);
    }

    if (!eddResponse && sessionStorage.getItem("EddAddressReq")) {
      const response = sessionStorage.getItem("EddAddressRes")
        ? JSON.parse(sessionStorage.getItem("EddAddressRes"))
        : null;
      const request = JSON.parse(sessionStorage.getItem("EddAddressReq"));
      setEddResponse(response, request);
    }
    if (!algoliaIndex) {
      requestAlgoliaIndex();
    }
       
    
    const countrycache = getCountryFromUrl().toUpperCase()
    if(this.props.currentGender === "all" && countrycache !== "BH" ){
        const appStateCache = JSON.parse(localStorage.getItem(APP_STATE_CACHE_KEY));
        appStateCache.data["gender"]= "women"
        localStorage.setItem(APP_STATE_CACHE_KEY,  JSON.stringify(appStateCache));
    }
  }

  getInternationalEdd = (countryCode) => {
    const { estimateEddResponse } = this.props;
    let request = {
      country: countryCode,
      city: null,
      area: null,
      courier: null,
      source: null,
      intl_vendors: isArabic() ? INTL_BRAND_ARABIC : INTL_BRAND,
    };
    estimateEddResponse(request, true);
  };

  componentDidUpdate() {
    const countryCode = navigator.language.substr(0, 2);
    const currentLn = window.location.href.indexOf("://") + 3;
    const currentLang = window.location.href.substr(currentLn, 2);
    if (
      countryCode === "ar" &&
      currentLang !== countryCode &&
      window.location.pathname === "/superstars" &&
      window.location.href.indexOf("?_branch_match_id") > 0
    ) {
      const redirectPath = window.location.href
        .replace("en-", "ar-")
        .split("?")[0];
      window.location.href = redirectPath;
    }
    if (!getUUIDToken()) {
      setUUIDToken(uuidv4());
    }
  }

  containerProps = () => {
    const { isBigOffline, setCountry, setLanguage, is_live_party_enabled} = this.props;

    return {
      isBigOffline,
      isAppReady: this.getIsAppReady(),
      setCountry,
      setLanguage,
      is_live_party_enabled,
    };
  };

  getIsAppReady() {
    const { locale } = this.props;

    return !!locale; // locale is '' => not ready
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RouterContainer);
