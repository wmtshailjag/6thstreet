import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { setGender } from "Store/AppState/AppState.action";
import { toggleBreadcrumbs } from "Store/Breadcrumbs/Breadcrumbs.action";
import { updateMeta } from "Store/Meta/Meta.action";
import { getCountriesForSelect } from "Util/API/endpoint/Config/Config.format";
import { getSchema } from "Util/API/endpoint/Config/Config.endpoint";
import { getStaticFile } from "Util/API/endpoint/StaticFiles/StaticFiles.endpoint";
import { capitalize } from "Util/App";
import { getUUID } from "Util/Auth";
import { VUE_PAGE_VIEW } from "Util/Event";
import Logger from "Util/Logger";
import isMobile from "Util/Mobile";
import HomePage from "./HomePage.component";
import { HOME_STATIC_FILE_KEY } from "./HomePage.config";
import { setLastTapItemOnHome } from "Store/PLP/PLP.action";
import browserHistory from "Util/History";
import BrowserDatabase from "Util/BrowserDatabase";
import { getCookie } from "Util/Url/Url";

import {
  deleteAuthorizationToken,
  deleteMobileAuthorizationToken,
  getAuthorizationToken,
  getMobileAuthorizationToken,
  isSignedIn,
  setAuthorizationToken,
  setMobileAuthorizationToken,
} from "Util/Auth";

export const mapStateToProps = (state) => ({
  gender: state.AppState.gender,
  locale: state.AppState.locale,
  country: state.AppState.country,
  lastHomeItem: state.PLP.lastHomeItem,
  config: state.AppConfig.config,
  prevPath: state.PLP.prevPath,
});

export const MyAccountDispatcher = import(
  "Store/MyAccount/MyAccount.dispatcher"
);

export const mapDispatchToProps = (dispatch) => ({
  toggleBreadcrumbs: (areBreadcrumbsVisible) =>
    dispatch(toggleBreadcrumbs(areBreadcrumbsVisible)),
  setGender: (gender) => dispatch(setGender(gender)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
  setLastTapItemOnHome: (item) => dispatch(setLastTapItemOnHome(item)),
  requestCustomerData: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.requestCustomerData(dispatch)
    ),
  logout: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.logout(null, dispatch)
    ),
});

export class HomePageContainer extends PureComponent {
  static propTypes = {
    setGender: PropTypes.func.isRequired,
    gender: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    toggleBreadcrumbs: PropTypes.func.isRequired,
    setMeta: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    requestCustomerData: PropTypes.func.isRequired,
  };

  state = {
    dynamicContent: [],
    isLoading: true,
    defaultGender: "women",
    isMobile: isMobile.any(),
    firstLoad: true,
  };

  constructor(props) {
    super(props);
    window.history.scrollRestoration = "manual";
  }

  componentDidMount() {
    const { prevPath = null, requestCustomerData, logout } = this.props;
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_PAGE_VIEW,
      params: {
        event: VUE_PAGE_VIEW,
        pageType: "home",
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: prevPath,
        url: window.location.href,
      },
    });

    const decodedParams = atob(decodeURIComponent(getCookie("authData")));

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
    } else {
      const cartID = BrowserDatabase.getItem("CART_ID_CACHE_KEY");
      if (cartID === parseInt(cartID, 10)) {
        logout();
      }
    }

    const { gender, toggleBreadcrumbs } = this.props;
    toggleBreadcrumbs(false);
    this.setMetaData(gender);
    this.requestDynamicContent(true, gender);
    this.setSchemaJSON();
  }

  requestCustomerData() {
    const { requestCustomerData } = this.props;

    requestCustomerData();
  }

  componentDidUpdate(prevProps) {
    const { gender: prevGender } = prevProps;
    const { gender, toggleBreadcrumbs, lastHomeItem } = this.props;

    toggleBreadcrumbs(false);

    if (gender !== prevGender) {
      this.setMetaData(gender);
      this.requestDynamicContent(true, gender);
    }
    let element = document.getElementById(lastHomeItem);
    if (element) {
      setTimeout(() => {
        window.focus();
        element.style.scrollMarginTop = "180px";
        element.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }
  }

  setDefaultGender() {
    const { setGender } = this.props;
    const { defaultGender } = this.state;
    setGender(defaultGender);
    this.requestDynamicContent(true, defaultGender);
  }

  setMetaData(gender) {
    const { setMeta, country, config } = this.props;
    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};
    const genderName = capitalize(gender);
    const pagePathName = new URL(window.location.href).pathname;
    const countryNameConfig =
      countryName == "Saudi Arabia" ? "KSA" : countryName;

    const homePageMetaTitle =
      pagePathName == "/"
        ? __(
            "Online Shopping @ 6thStreet %s | Fashion & Lifestyle Brands for Women, Men & Kids",
            countryNameConfig
          )
        : pagePathName == "/women.html"
        ? __(
            "Online Shopping for Women Shoes, Clothing, Bags & more on 6thStreet %s",
            countryNameConfig
          )
        : pagePathName == "/men.html"
        ? __(
            "Online Shopping for Men Shoes, Clothing, Bags & more on 6thStreet %s",
            countryNameConfig
          )
        : pagePathName == "/kids.html"
        ? __(
            "Online Shopping for Kids Shoes, Clothing, Bags & more on 6thStreet %s",
            countryNameConfig
          )
        : __(
            "Online Shopping for %s Shoes, Clothing, Bags & more on 6thStreet %s",
            genderName,
            countryName
          );
    const homepageMetaDesc =
      pagePathName == "/"
        ? __(
            // eslint-disable-next-line max-len
            "6thStreet.com, an online shopping site for fashion & lifestyle brands in the %s. Find top brands offering footwear, clothing, accessories & lifestyle products for women, men & kids.",
            countryName
          )
        : pagePathName == "/women.html"
        ? __(
            // eslint-disable-next-line max-len
            "Buy Women Shoes, Clothing, Bags, Beauty Products, Accessories: Watches & Jewellery, Home Essentials & more from best brands in %s with best deals on 6thStreet. ✅ Free Delivery on minimum order ✅ 100 days Free Return",
            countryName
          )
        : pagePathName == "/men.html"
        ? __(
            "Buy Men Shoes, Clothing, Bags, Grooming Products, Accessories: Wallets & Belts, Home Essentials & more from best brands in %s with best deals on 6thStreet. ✅ Free Delivery on minimum order ✅ 100 days Free Return",
            countryName
          )
        : pagePathName == "/kids.html"
        ? __(
            // eslint-disable-next-line max-len
            "Buy Kids Shoes, Clothing, Bags, Baby Care Products, Toys, School Supplies & More from best brands in %s with best deals on 6thStreet. ✅ Free Delivery on minimum order ✅ 100 days Free Return",
            countryName
          )
        : __(
            // eslint-disable-next-line max-len
            "Shop for %s fashion brands in %s. Exclusive collection of shoes, clothing, bags, grooming - Online Shopping ✯ Free Delivery ✯ COD ✯ 100% original brands - 6thStreet",
            genderName,
            countryName
          );
    setMeta({
      title: homePageMetaTitle,
      keywords: __(
        "online shopping for %s, %s online shopping, %s",
        ...Array(2).fill(genderName),
        countryName
      ),
      description: homepageMetaDesc,
      twitter_title: homePageMetaTitle,
      twitter_desc: homepageMetaDesc,
      og_title: homePageMetaTitle,
      og_desc: homepageMetaDesc,
    });
  }

  getDevicePrefix() {
    return isMobile.any() ? "m/" : "d/";
  }

  async fetchDataFromLocal() {
    const { isMobile } = this.state;
    let fileName = "women.json";
    if (isMobile) {
      fileName = "women_mobile.json";
    }
    return fetch(fileName, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async requestDynamicContent(isUpdate = false) {
    const { gender } = this.props;
    const devicePrefix = this.getDevicePrefix();
    if (isUpdate) {
      // Only set loading if this is an update
      this.setState({ isLoading: true });
    }

    // TODO commented thiss try catch block temp uncomment after development
    try {
      const dynamicContent = await getStaticFile(HOME_STATIC_FILE_KEY, {
        $FILE_NAME: `${devicePrefix}${gender}.json`,
      });

      this.setState({
        dynamicContent: Array.isArray(dynamicContent) ? dynamicContent : [],
        isLoading: false,
      });
    } catch (e) {
      // TODO: handle error
      Logger.log(e);
    }
  }

  async setSchemaJSON() {
    const { locale = "" } = this.props;
    try {
      const response = await getSchema(locale);
      if (!!!response?.error) {
        const tag = document.createElement("script");
        if (tag) {
          tag.type = "application/ld+json";
          tag.innerHTML = JSON.stringify(response);
          document
            .querySelectorAll("script[type='application/ld+json']")
            .forEach((node) => node.remove());
          document.head.appendChild(tag);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  containerProps = () => {
    const { gender } = this.props;
    const { dynamicContent, isLoading } = this.state;

    return {
      dynamicContent,
      isLoading,
      gender,
    };
  };

  setLastTapItem = (item) => {
    this.props.setLastTapItemOnHome(item);
  };

  render() {
    return (
      <HomePage
        {...this.containerFunctions}
        {...this.containerProps()}
        setLastTapItem={this.setLastTapItem}
        HomepageProps={this.props}
      />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomePageContainer)
);
