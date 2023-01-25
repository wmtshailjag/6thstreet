/* eslint-disable react/prop-types */
/**
 * @category  6thstreet
 * @author    Alona Zvereva <alona.zvereva@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { VUE_PAGE_VIEW } from "Util/Event";
import VueIntegrationQueries from "Query/vueIntegration.query";
import {
  CART,
  CART_EDITING,
  CUSTOMER_ACCOUNT,
  CUSTOMER_ACCOUNT_PAGE,
} from "Component/Header/Header.config";
import { CUSTOMER_ACCOUNT_OVERLAY_KEY } from "Component/MyAccountOverlay/MyAccountOverlay.config";
import { CHECKOUT_URL } from "Route/Checkout/Checkout.config";
import { MY_ACCOUNT_URL } from "Route/MyAccount/MyAccount.config";
import MyAccountContainer, {
  tabMap,
} from "Route/MyAccount/MyAccount.container";
import { updateMeta } from "Store/Meta/Meta.action";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { showNotification } from "Store/Notification/Notification.action";
import { toggleOverlayByKey } from "Store/Overlay/Overlay.action";
import StoreCreditDispatcher from "Store/StoreCredit/StoreCredit.dispatcher";
import { customerType } from "Type/Account";
import { HistoryType } from "Type/Common";
import { TotalsType } from "Type/MiniCart";
import { ClubApparelMember } from "Util/API/endpoint/ClubApparel/ClubApparel.type";
import { isSignedIn } from "Util/Auth";
import { checkProducts } from "Util/Cart/Cart";
import history from "Util/History";
import isMobile from "Util/Mobile";
import { appendWithStoreCode } from "Util/Url";
import { getUUID } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import { EVENT_MOE_BEGIN_CHECKOUT } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";

import CartDispatcher from "Store/Cart/Cart.dispatcher";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import VueQuery from "../../query/Vue.query";
import CartPage from "./CartPage.component";
import { getUUIDToken } from "Util/Auth";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";


export const BreadcrumbsDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => {
  return {
    totals: state.CartReducer.cartTotals,
    couponsItems: state.CartReducer.cartCoupons,
    headerState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
    guest_checkout: state.ConfigReducer.guest_checkout,
    customer: state.MyAccountReducer.customer,
    isSignedIn: state.MyAccountReducer.isSignedIn,
    clubApparel: state.ClubApparelReducer.clubApparel,
    isLoading: state.CartReducer.isLoading,
    processingRequest: state.CartReducer.processingRequest,
    prevPath: state.PLP.prevPath,
    couponLists: state.CartReducer.cartCoupons,
    config: state.AppConfig.config,
    language: state.AppState.language,
    country: state.AppState.country,
    product: state.PDP.product,
    gender: state.AppState.gender,
    options: state.PDP.options,
  };
};

export const mapDispatchToProps = (dispatch) => ({
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  updateBreadcrumbs: (breadcrumbs) =>
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    ),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  updateMeta: (meta) => dispatch(updateMeta(meta)),
  updateStoreCredit: () => StoreCreditDispatcher.getStoreCredit(dispatch),
  getCouponList: () => CartDispatcher.getCoupon(dispatch),
  applyCouponToCart: (couponCode) =>
    CartDispatcher.applyCouponCode(dispatch, couponCode),
  removeCouponFromCart: () => CartDispatcher.removeCouponCode(dispatch),
  getTabbyInstallment: (price) =>
    CheckoutDispatcher.getTabbyInstallment(dispatch, price),
});

export class CartPageContainer extends PureComponent {
  static propTypes = {
    updateBreadcrumbs: PropTypes.func.isRequired,
    updateStoreCredit: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    showOverlay: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    updateMeta: PropTypes.func.isRequired,
    guest_checkout: PropTypes.bool,
    history: HistoryType.isRequired,
    totals: TotalsType.isRequired,
    customer: customerType,
    isSignedIn: PropTypes.bool.isRequired,
    processingRequest: PropTypes.bool,
    clubApparel: ClubApparelMember,
  };

  static defaultProps = {
    customer: null,
    clubApparel: {},
    guest_checkout: true,
    processingRequest: false,
  };

  state = {
    isEditing: false,
    clubApparelMember: null,
    errorState: false,
    cartWidgetApiData: [],
    youMayAlsoLikeData: [],
  };

  containerFunctions = {
    onCheckoutButtonClick: this.onCheckoutButtonClick.bind(this),
    changeActiveTab: this.changeActiveTab.bind(this),
    onSignIn: this.onSignIn.bind(this),
  };

  constructor(props) {
    super(props);

    const { isSignedIn, updateMeta } = this.props;
    this.state = MyAccountContainer.navigateToSelectedTab(this.props) || {};

    if (!isSignedIn) {
      toggleOverlayByKey(CUSTOMER_ACCOUNT);
    }

    updateMeta({ title: __("My account") });

    this.onSignIn();
  }

  static getDerivedStateFromProps(props, state) {
    const {
      totals: { items = [] },
    } = props;

    if (items.length !== 0) {
      const mappedItems = checkProducts(items) || [];

      return {
        ...MyAccountContainer.navigateToSelectedTab(props, state),
        isCheckoutAvailable: mappedItems.length === 0,
      };
    }

    return MyAccountContainer.navigateToSelectedTab(props, state);
  }

  componentDidMount() {
    const {
      updateMeta,
      updateStoreCredit,
      prevPath = null,
      getCouponList,
      totals: { items = [] },
      showNotification,
      location: { state: { errorState: propErrorState } = {} },
    } = this.props;

    this.getCartWidgetsVueData();
    this.getCartYoumayAlsoLikeWidgetsVueData();
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_PAGE_VIEW,
      params: {
        clicked: Date.now(),
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        event: VUE_PAGE_VIEW,
        pageType: "cart",
        referrer: prevPath,
        userID: userID,
        uuid: getUUID(),
        url: window.location.href,
      },
    });
    updateMeta({ title: __("Cart") });
    updateStoreCredit();
    this._updateBreadcrumbs();
    this._changeHeaderState();
    getCouponList();

    const mappedItems = checkProducts(items) || [];
    if (
      mappedItems.length !== 0 &&
      (this.state.errorState === false || propErrorState === false)
    ) {
      showNotification(
        "error",
        __("Some products or selected quantities are no longer available")
      );
      this.setState({ errorState: true });
    }
  }

  getCartWidgetsVueData() {
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    const query = {
      filters: [],
      num_results: 50,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };
    const type = "vue_recently_viewed_slider";
    const defaultQueryPayload = {
      userID,
      product_id: "",
    };
    const payload = VueQuery.buildQuery(type, query, defaultQueryPayload);
    var promise = Promise.resolve(fetchVueData(payload));
    promise
      .then((resp) => {
        this.setState({ cartWidgetApiData: resp.data });
      })
      .catch((err) => {
        console.error("uncaugh  errr", err);
      });
  }

  getCartYoumayAlsoLikeWidgetsVueData() {
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    const query = {
      filters: [],
      num_results: 50,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };
    const type = "vue_top_picks_slider";
    const defaultQueryPayload = {
      userID,
      product_id: "",
    };
    const payload = VueQuery.buildQuery(type, query, defaultQueryPayload);
    var promise = Promise.resolve(fetchVueData(payload));
    promise
      .then((resp) => {
        this.setState({ youMayAlsoLikeData: resp.data });
      })
      .catch((err) => {
        console.error("uncaugh  errr", err);
      });
  }

  componentDidUpdate(prevProps) {
    const {
      changeHeaderState,
      totals: { items_qty },
      headerState,
      headerState: { name },
      product,
    } = this.props;

    const {
      totals: { items_qty: prevItemsQty },
      headerState: { name: prevName },
    } = prevProps;
    if (name !== prevName) {
      if (name === CART) {
        this._changeHeaderState();
      }
    }

    if (items_qty !== prevItemsQty) {
      const title = `${items_qty || "0"} Items`;
      changeHeaderState({
        ...headerState,
        title,
      });
    }

    const {
      totals: { items = [] },
      totals,
      showNotification,
    } = this.props;
    const {
      totals: { items: prevItems = [] },
      totals: prevtotals,
    } = prevProps;
    if (JSON.stringify(prevtotals) !== JSON.stringify(totals)) {
      const mappedItems = checkProducts(items) || [];
      if (mappedItems.length !== 0) {
        showNotification(
          "error",
          __("Some products or selected quantities are no longer available")
        );
      }
    }
  }

  changeActiveTab(activeTab) {
    const { history } = this.props;
    const {
      [activeTab]: { url },
    } = tabMap;
    history.push(`${MY_ACCOUNT_URL}${url}`);
  }
  sendMoeEvent(event) {
    const {
      totals: {
        items,
        coupon_code,
        currency_code,
        discount,
        shipping_fee,
        subtotal,
        total,
      },
    } = this.props;
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    let productName = [],
      productColor = [],
      productBrand = [],
      productSku = [],
      productGender = [],
      productBasePrice = [],
      productSizeOption = [],
      productSizeValue = [],
      productSubCategory = [],
      productThumbanail = [],
      productUrl = [],
      productQty = [],
      productCategory = [],
      productItemPrice = [];
    items.forEach((item) => {
      let productKeys = item?.full_item_info;
      productName.push(productKeys?.name);
      productColor.push(productKeys?.color);
      productBrand.push(productKeys?.brand_name);
      productSku.push(productKeys?.config_sku);
      productGender.push(productKeys?.gender);
      productBasePrice.push(productKeys?.original_price);
      productSizeOption.push(productKeys?.size_option);
      productSizeValue.push(productKeys?.size_value);
      productSubCategory.push(productKeys?.subcategory);
      productThumbanail.push(productKeys?.thumbnail_url);
      productUrl.push(productKeys?.url);
      productQty.push(productKeys?.qty);
      productCategory.push(productKeys?.original_price);
      productItemPrice.push(productKeys?.itemPrice);
    });

    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      coupon_code_applied: coupon_code || "",
      currency: currency_code || "",
      discounted_amount: discount || "",
      product_count: productQty || "",
      shipping_fee: shipping_fee || "",
      subtotal_amount: subtotal || "",
      total_amount: total || "",
      brand_name: productBrand.length > 0 ? productBrand : "",
      color: productColor.length > 0 ? productColor : "",
      discounted_price: productItemPrice.length > 0 ? productItemPrice : "",
      full_price: productBasePrice.length > 0 ? productBasePrice : "",
      product_name: productName.length > 0 ? productName : "",
      product_sku: productSku.length > 0 ? productSku : "",
      gender: productGender.length > 0 ? productGender : "",
      size_id: productSizeOption.length > 0 ? productSizeOption : "",
      size: productSizeValue.length > 0 ? productSizeValue : "",
      subcategory: productSubCategory.length > 0 ? productSubCategory : "",
      app6thstreet_platform: "Web",
    });
  }

  onCheckoutButtonClick(e) {
    const {
      history,
      guest_checkout,
      showOverlay,
      showNotification,
    } = this.props;
    const { isCheckoutAvailable } = this.state;
    if (isCheckoutAvailable) {
      // to prevent outside-click handler trigger
      e.nativeEvent.stopImmediatePropagation();

      if (guest_checkout) {
        this.sendMoeEvent(EVENT_MOE_BEGIN_CHECKOUT);
        history.push({
          pathname: appendWithStoreCode(CHECKOUT_URL),
        });

        return;
      }

      if (isSignedIn()) {
        this.sendMoeEvent(EVENT_MOE_BEGIN_CHECKOUT);
        history.push({
          pathname: appendWithStoreCode(CHECKOUT_URL),
        });

        return;
      }

      // fir notification whatever device that is
      showNotification("info", __("Please sign-in to complete checkout!"));

      if (isMobile.any()) {
        // for all mobile devices, simply switch route
        this.sendMoeEvent(EVENT_MOE_BEGIN_CHECKOUT);
        history.push({ pathname: appendWithStoreCode("/my-account") });
        return;
      }

      // for desktop, just open customer overlay
      showOverlay(CUSTOMER_ACCOUNT_OVERLAY_KEY);
    } else {
      showNotification(
        "error",
        __("Some products or selected quantities are no longer available")
      );
    }
  }

  _updateBreadcrumbs() {
    const { updateBreadcrumbs } = this.props;

    updateBreadcrumbs([
      { url: "", name: __("My bag") },
      { name: __("Home"), url: "/" },
    ]);
  }

  _changeHeaderState() {
    const {
      changeHeaderState,
      totals: { items_qty },
    } = this.props;
    const title = __("%s Items", items_qty || 0);

    changeHeaderState({
      name: CART,
      title,
      onEditClick: () => {
        this.setState({ isEditing: true });
        changeHeaderState({
          name: CART_EDITING,
          title,
          onOkClick: () => this.setState({ isEditing: false }),
          onCancelClick: () => this.setState({ isEditing: false }),
        });
      },
      onCloseClick: () => {
        this.setState({ isEditing: false });
        history.goBack();
      },
    });
  }

  onSignIn() {
    const { changeHeaderState, history } = this.props;

    changeHeaderState({
      title: "My account",
      name: CUSTOMER_ACCOUNT_PAGE,
      onBackClick: () => history.push("/"),
    });
  }


  render() {
    const cartWidgetApiData = this.state.cartWidgetApiData;
    const youMayAlsoLikeData = this.state.youMayAlsoLikeData;
    return cartWidgetApiData && youMayAlsoLikeData ? (
      <CartPage
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
        cartWidgetApiData={cartWidgetApiData}
        youMayAlsoLikeData={youMayAlsoLikeData}
        tabMap={tabMap}
      />
    ) : (
      <CartPage
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
        renderMySignInPopup={this.showPopup}
        cartWidgetApiData={[]}
        youMayAlsoLikeData={[]}
        tabMap={tabMap}
      />
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CartPageContainer);
