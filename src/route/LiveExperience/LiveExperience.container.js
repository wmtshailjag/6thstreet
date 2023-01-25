import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { updateMeta } from "Store/Meta/Meta.action";
import { getCountriesForSelect } from "Util/API/endpoint/Config/Config.format";
import { capitalize } from "Util/App";
import { getQueryParam } from "Util/Url";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import LivePartyDispatcher from "Store/LiveParty/LiveParty.dispatcher";
import Config from "./LiveExperience.config";
import LiveExperience from "./LiveExperience.component";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import { getBambuserChannelID } from "../../util/Common/index";

import CartDispatcher from "Store/Cart/Cart.dispatcher";
import VueIntegrationQueries from "Query/vueIntegration.query";

export const BreadcrumbsDispatcher = import(
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
  gender: state.AppState.gender,
  locale: state.AppState.locale,
  country: state.AppState.country,
  live: state.LiveParty.live,
  upcoming: state.LiveParty.upcoming,
  archived: state.LiveParty.archived,
  isLive: state.LiveParty.isLive,
});

export const mapDispatchToProps = (dispatch) => ({
  requestProduct: (options) => PDPDispatcher.requestProduct(options, dispatch),

  requestLiveShoppingInfo : (options) =>
    LivePartyDispatcher.requestLiveShoppingInfo(options, dispatch),
  updateBreadcrumbs: (breadcrumbs) => {
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    );
  },
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
  addProductToCart: (
    productData,
    color,
    optionValue,
    basePrice,
    brand_name,
    thumbnail_url,
    url,
    itemPrice,
    searchQueryId,
    cartId,
    liveparty
  ) =>
    CartDispatcher.addProductToCart(
      dispatch,
      productData,
      color,
      optionValue,
      basePrice,
      brand_name,
      thumbnail_url,
      url,
      itemPrice,
      searchQueryId,
      cartId,
      liveparty
    ),
  updateProductInCart: (
    item_id,
    quantity,
    color,
    optionValue,
    discount,
    brand_name,
    thumbnail_url,
    url,
    row_total,
    currency
  ) =>
    CartDispatcher.updateProductInCart(
      dispatch,
      item_id,
      quantity,
      color,
      optionValue,
      discount,
      brand_name,
      thumbnail_url,
      url,
      row_total,
      currency
    ),
  removeProduct: (options) =>
    CartDispatcher.removeProductFromCart(dispatch, options),
  getCartTotals: (cartId) => CartDispatcher.getCartTotals(dispatch, cartId),
});

export class LiveExperienceContainer extends PureComponent {
  static propTypes = {
    gender: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    updateBreadcrumbs: PropTypes.func.isRequired,
    setMeta: PropTypes.func.isRequired,
    addProductToCart: PropTypes.func.isRequired,
    updateProductInCart: PropTypes.func.isRequired,
    removeProduct: PropTypes.func.isRequired,
    getCartTotals: PropTypes.func.isRequired,
    livepartyId: PropTypes.string,
    cartId: PropTypes.string,
    token: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.setMetaData();
  }


  requestLiveShoppingInfo() {
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const [lang, country] = locale && locale.split("-");
    const { requestLiveShoppingInfo } = this.props;
    Config.storeId = getBambuserChannelID(country);
    if(requestLiveShoppingInfo) {
      requestLiveShoppingInfo({
      storeId: Config.storeId,
      isStaging: process.env.REACT_APP_SPOCKEE_STAGING,
    });
    }
  }

  parseBool = (b) => {
    return !/^(false|0)$/i.test(b) && !!b;
  };

  getParameterByName = (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  componentDidMount() {
    this.requestLiveShoppingInfo();
    const showHeaderFooter = getQueryParam("showHeaderFooter", location);

    const isShowHeaderFooter = this.getParameterByName("showHeaderFooter");

    if (isShowHeaderFooter) {
      const { changeHeaderState } = this.props;
      changeHeaderState({
        isHiddenOnDesktop: !this.parseBool(showHeaderFooter),
      });
    }
    this.updateBreadcrumbs();
    this.setMetaData();
  }

  componentDidUpdate() {
    this.updateBreadcrumbs();
  }
  updateBreadcrumbs() {
    const { updateBreadcrumbs } = this.props;
    const breadcrumbs = [
      {
        url: "/",
        name: __("Live Shopping"),
      },
      {
        url: "/",
        name: __("Home"),
      },
    ];

    updateBreadcrumbs(breadcrumbs);
  }

  setMetaData() {
    const {
      setMeta,
      country,
      config,
      requestedOptions: { q } = {},
      gender,
    } = this.props;
    if (!q) {
      return;
    }

    const genderName = capitalize(gender);
    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};
    const breadcrumbs = location.pathname
      .split(".html")[0]
      .substring(1)
      .split("/");
    const categoryName = capitalize(breadcrumbs.pop() || "");

    setMeta({
      title: __(
        "%s %s Online shopping in %s | 6thStreet",
        genderName,
        categoryName,
        countryName
      ),
      keywords: __(
        "%s %s %s online shopping",
        genderName,
        categoryName,
        countryName
      ),
      description: __(
        // eslint-disable-next-line max-len
        "Shop %s %s Online. Explore your favourite brands ✯ Free delivery ✯ Cash On Delivery ✯ 100% original brands | 6thStreet.",
        genderName,
        categoryName
      ),
    });
  }
  containerProps = () => {
    const livepartyId = getQueryParam("livepartyId", location);
    const cartId = getQueryParam("cartId", location);
    const token = getQueryParam("token", location);

    let {
      live,
      upcoming,
      archived,
      isLive,
      addProductToCart,
      updateProductInCart,
      removeProduct,
      updateCartProducts
    } = this.props;
    // Updating upcoming data to remove current broadCastId from it.
    let updatedUpcoming = upcoming.filter((val) => {
      return val.id.toString() !== live.id;
    });
    let updatedArchived = archived.filter((val) => {
      return val.id.toString() !== live.id;
    });

    return {
      live,
      isLive,
      updatedUpcoming,
      updatedArchived,
      addProductToCart,
      updateProductInCart,
      removeProduct,
      updateCartProducts,
      livepartyId,
      cartId,
      token,
    };
  };

  render() {
    return (
      <LiveExperience
        requestProduct={this.props.requestProduct}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LiveExperienceContainer);
