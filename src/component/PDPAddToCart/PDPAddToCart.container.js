/* eslint-disable no-magic-numbers */
import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { getStore } from "Store";
import { setMinicartOpen } from "Store/Cart/Cart.action";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import MyAccountDispatcher from "Store/MyAccount/MyAccount.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import { customerType } from "Type/Account";
import { Product } from "Util/API/endpoint/Product/Product.type";
import { getUUID } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import Event, {
  EVENT_GTM_PRODUCT_ADD_TO_CART,
  VUE_ADD_TO_CART,
  EVENT_MOE_ADD_TO_CART,
  EVENT_MOE_ADD_TO_CART_FAILED,
  EVENT_MOE_VIEW_BAG,
  EVENT_SELECT_SIZE,
  EVENT_GTM_PDP_TRACKING,
  EVENT_SELECT_SIZE_TYPE,
} from "Util/Event";
import history from "Util/History";
import { ONE_MONTH_IN_SECONDS } from "Util/Request/QueryDispatcher";
import PDPClickAndCollectPopup from "../PDPClickAndCollectPopup";
import { PDP_CLICK_AND_COLLECT_POPUP_ID } from "../PDPClickAndCollectPopup/PDPClickAndCollectPopup.config";
import { NOTIFY_EMAIL } from "./PDPAddToCard.config";
import PDPAddToCart from "./PDPAddToCart.component";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getCurrency } from "Util/App";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = (state) => ({
  product: state.PDP.product,
  clickAndCollectStores: state.PDP.clickAndCollectStores,
  locale: state.AppState.locale,
  totals: state.CartReducer.cartTotals,
  customer: state.MyAccountReducer.customer,
  guestUserEmail: state.MyAccountReducer.guestUserEmail,
  prevPath: state.PLP.prevPath,
});

export const CART_ID_CACHE_KEY = "CART_ID_CACHE_KEY";

export const mapDispatchToProps = (dispatch) => ({
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  getCartTotals: (cartId) => CartDispatcher.getCartTotals(dispatch, cartId),
  setGuestUserEmail: (email) =>
    MyAccountDispatcher.setGuestUserEmail(dispatch, email),
  addProductToCart: (
    productData,
    color,
    optionValue,
    basePrice,
    brand_name,
    thumbnail_url,
    url,
    itemPrice,
    searchQueryId
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
      searchQueryId
    ),
  setMinicartOpen: (isMinicartOpen = false) =>
    dispatch(setMinicartOpen(isMinicartOpen)),
  sendNotifyMeEmail: (data) => PDPDispatcher.sendNotifyMeEmail(data),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
});

export class PDPAddToCartContainer extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
    clickAndCollectStores: PropTypes.object.isRequired,
    addProductToCart: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    totals: PropTypes.object,
    PrevTotal: PropTypes.number,
    total: PropTypes.number,
    productAdded: PropTypes.bool,
    setMinicartOpen: PropTypes.func.isRequired,
    setStockAvailability: PropTypes.func.isRequired,
    customer: customerType,
    guestUserEmail: PropTypes.string,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    setSize: PropTypes.func.isRequired,
  };

  static defaultProps = {
    totals: {},
    PrevTotal: null,
    total: null,
    productAdded: false,
    customer: null,
  };

  containerFunctions = {
    onSizeTypeSelect: this.onSizeTypeSelect.bind(this),
    onSizeSelect: this.onSizeSelect.bind(this),
    addToCart: this.addToCart.bind(this),
    routeChangeToCart: this.routeChangeToCart.bind(this),
    showAlertNotification: this.showAlertNotification.bind(this),
    sendNotifyMeEmail: this.sendNotifyMeEmail.bind(this),
    setGuestUserEmail: this.setGuestUserEmail.bind(this),
    togglePDPClickAndCollectPopup:
      this.togglePDPClickAndCollectPopup.bind(this),
    selectClickAndCollectStore: this.selectClickAndCollectStore.bind(this),
    confirmClickAndCollect: this.confirmClickAndCollect.bind(this),
  };

  constructor(props) {
    super(props);

    this.state = {
      sizeObject: {},
      mappedSizeObject: {},
      selectedSizeType: "eu",
      selectedSizeCode: "",
      insertedSizeStatus: true,
      isLoading: false,
      addedToCart: false,
      buttonRefreshTimeout: 1250,
      showProceedToCheckout: false,
      hideCheckoutBlock: false,
      clearTime: false,
      processingRequest: false,
      productStock: {},
      isOutOfStock: false,
      notifyMeLoading: false,
      notifyMeSuccess: false,
      openClickAndCollectPopup: false,
      selectedClickAndCollectStore: null,
      isAddToCartClicked: false,
    };

    this.fullCheckoutHide = null;
    this.startCheckoutHide = null;
  }

  updateDefaultSizeType() {
    const { product } = this.props;
    if (product?.size_eu && product?.size_uk && product?.size_us) {
      const sizeTypes = ["eu", "uk", "us"];
      let index = 0;
      while (product[`size_${sizeTypes[index]}`]?.length <= 0) {
        index = index + 1;
      }

      if (index >= sizeTypes.length) {
        index = 0;
      }
      this.setState({ selectedSizeType: sizeTypes[index] });
    }
  }

  static getDerivedStateFromProps(props) {
    const { product } = props;
    if (product.simple_products !== undefined) {
      const { simple_products, size_eu } = product;

      const filteredProductKeys = Object.keys(simple_products)
        .reduce((acc, key) => {
          const {
            size: { eu: productSize },
          } = simple_products[key];

          acc.push([size_eu.indexOf(productSize), key]);

          return acc;
        }, [])
        .sort((a, b) => {
          if (a[0] < b[0]) {
            return -1;
          }

          if (a[0] > b[0]) {
            return 1;
          }

          return 0;
        })
        .reduce((acc, item) => {
          acc.push(item[1]);

          return acc;
        }, []);

      const filteredProductSizeKeys = Object.keys(
        product.simple_products[filteredProductKeys[0]].size || {}
      );

      const object = {
        sizeCodes: filteredProductKeys || [],
        sizeTypes: filteredProductSizeKeys?.length ? ["uk", "eu", "us"] : [],
      };

      if (
        filteredProductKeys.length <= 1 &&
        filteredProductSizeKeys.length === 0
      ) {
        return { insertedSizeStatus: false, sizeObject: object };
      }

      if (
        filteredProductKeys.length > 1 &&
        filteredProductSizeKeys.length === 0
      ) {
        const object = {
          sizeCodes: [filteredProductKeys[1]],
          sizeTypes: filteredProductSizeKeys,
        };

        return { insertedSizeStatus: false, sizeObject: object };
      }

      return { sizeObject: object };
    }

    return {
      insertedSizeStatus: false,
      sizeObject: {
        sizeCodes: [],
        sizeTypes: [],
      },
    };
  }

  componentDidMount() {
    const {
      product: { sku, size_eu, size_uk, size_us, in_stock, stock_qty },
      setGuestUserEmail,
      simple_products = [],
    } = this.props;
    this.updateDefaultSizeType();
    const email = BrowserDatabase.getItem(NOTIFY_EMAIL);
    if (email) {
      setGuestUserEmail(email);
    }
    const {
      sizeObject: { sizeTypes },
    } = this.state;
    const allSizes = Object.entries(simple_products).reduce((acc, size) => {
      const sizeCode = size[0];
      const { quantity } = size[1];

      if (quantity !== null && quantity !== undefined) {
        acc.push(sizeCode);
      }

      return acc;
    }, []);
    const object = {
      sizeTypes,
      sizeCodes: allSizes,
    };
    let outOfStockStatus;
    if (size_us && size_uk && size_eu) {
      outOfStockStatus =
        size_us.length === 0 &&
        size_uk.length === 0 &&
        size_eu.length === 0 &&
        in_stock === 0
          ? true
          : in_stock === 1 && stock_qty === 0
          ? true
          : false;
    } else {
      outOfStockStatus =
        in_stock === 0
          ? true
          : in_stock === 1 && stock_qty === 0
          ? true
          : false;
    }

    this.setState({
      mappedSizeObject: object,
      productStock: simple_products,
      isOutOfStock: outOfStockStatus,
    });
  }

  setGuestUserEmail(email) {
    const { setGuestUserEmail } = this.props;
    setGuestUserEmail(email);
  }

  sendNotifyMeEmail(email) {
    const {
      locale,
      product: { sku },
      sendNotifyMeEmail,
      showNotification,
      customer,
    } = this.props;
    const { selectedSizeCode } = this.state;

    let data = { email, sku: selectedSizeCode || sku, locale };
    this.setState({ notifyMeLoading: true });

    sendNotifyMeEmail(data).then((response) => {
      if (response && response.success) {
        if (!(customer && customer.email)) {
          BrowserDatabase.setItem(email, NOTIFY_EMAIL, ONE_MONTH_IN_SECONDS);
        }
        this.setGuestUserEmail(email);
        //if success
        if (response.message) {
          showNotification("error", response.message);
          this.setState({ notifyMeSuccess: false, isOutOfStock: true });
        } else {
          this.setState({ notifyMeSuccess: true, isOutOfStock: true });
          if (customer && customer.id) {
            //if user is logged in then change email
            const loginEvent = new CustomEvent("userLogin");
            window.dispatchEvent(loginEvent);
          }
          setTimeout(() => {
            this.setState({ notifyMeSuccess: false, isOutOfStock: true });
          }, 4000);
        }
      } else {
        //if error
        showNotification("error", __("Something went wrong."));
      }
      this.setState({ notifyMeLoading: false });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      totals: { total: PrevTotal = null },
    } = prevProps;
    const {
      totals: { total = null },
      product: { size_uk = [], size_eu = [], size_us = [],sku,name },
    } = this.props;
    const {
      productAdded,
      selectedSizeType,
      selectedSizeCode,
      productStock,
      isAddToCartClicked,
    } = this.state;
    if (productAdded && total && PrevTotal !== total) {
      this.clearTimeAll();
      this.proceedToCheckout();
    }

    const { setSize } = this.props;
    const { prevSelectedSizeType, prevSelectedSizeCode } = prevState;

    const prev_selectedSizeType = prevState?.selectedSizeType;
    const prev_selectedSizeCode = prevState?.selectedSizeCode;
    const checkproductSize =
      (size_uk.length !== 0 || size_eu.length !== 0 || size_us.length !== 0) &&
      selectedSizeCode !== "";

    const { size } = checkproductSize ? productStock[selectedSizeCode] : "";
    const optionValue = checkproductSize ? size[selectedSizeType] : "";
    if (
      selectedSizeCode &&
      prev_selectedSizeCode == selectedSizeCode &&
      !isAddToCartClicked
    ) {
      const eventData = { name: EVENT_SELECT_SIZE, size_value: optionValue, product_name: name, product_id: sku, action:"select_size_no_option" };
      Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData);
      this.sendMoEImpressions(EVENT_SELECT_SIZE);
    }
    if (
      selectedSizeType !== prevSelectedSizeType ||
      selectedSizeCode !== prevSelectedSizeCode
    ) {
      setSize(selectedSizeType, selectedSizeCode);
    }
  }

  containerProps = () => {
    const {
      product,
      setStockAvailability,
      customer,
      guestUserEmail,
      clickAndCollectStores,
    } = this.props;
    const {
      mappedSizeObject,
      selectedClickAndCollectStore,
      openClickAndCollectPopup,
    } = this.state;
    const basePrice =
      product?.price &&
      product.price[0] &&
      product.price[0][Object.keys(product.price[0])[0]]["6s_base_price"];
    return {
      ...this.state,
      sizeObject: mappedSizeObject,
      product,
      basePrice,
      setStockAvailability,
      customer,
      guestUserEmail,
      stores: clickAndCollectStores,
      selectedClickAndCollectStore,
      openClickAndCollectPopup,
    };
  };

  onSizeTypeSelect(type) {
    const {
      product: {sku,name },
    } = this.props;
    const eventData = {
      name: EVENT_SELECT_SIZE_TYPE,
      size_type: type.target.value,
      action: EVENT_SELECT_SIZE_TYPE,
      product_name: name, 
      product_id: sku
    };
    Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData);
    this.setState({
      selectedSizeType: type.target.value,
    });
  }

  onSizeSelect({ target }) {
    const { value } = target;
    const { productStock, isOutOfStock } = this.state;
    let outOfStockVal = isOutOfStock;
    if (productStock && productStock[value]) {
      const selectedSize = productStock[value];
      if (
        selectedSize["quantity"] !== undefined &&
        selectedSize["quantity"] !== null &&
        (typeof selectedSize["quantity"] === "string"
          ? parseInt(selectedSize["quantity"], 0) === 0
          : selectedSize["quantity"] === 0)
      ) {
        outOfStockVal = true;
      } else {
        outOfStockVal = false;
      }
    }
    this.setState({
      selectedSizeCode: value,
      isOutOfStock: outOfStockVal,
      notifyMeSuccess: false,
    });
  }

  addToCart(isClickAndCollect = false) {
    const {
      product: {
        thumbnail_url,
        url,
        color,
        brand_name,
        price = {},
        size_uk = [],
        size_eu = [],
        size_us = [],
        name,
        sku: configSKU,
        objectID,
        product_type_6s,
        categories = {},
      },
      product,
      addProductToCart,
      showNotification,
      prevPath = null,
    } = this.props;
    const { productStock, selectedClickAndCollectStore } = this.state;
    if (!price[0]) {
      showNotification("error", __("Unable to add product to cart."));
      return;
    }
    this.setState({ isAddToCartClicked: true });
    const { selectedSizeType, selectedSizeCode, insertedSizeStatus } =
      this.state;
    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];

    this.setState({ productAdded: true });
    var qid = new URLSearchParams(window.location.search).get("qid");
    let searchQueryId;
    if (!qid) {
      searchQueryId = getStore().getState().SearchSuggestions.queryID;
    } else {
      searchQueryId = qid;
    }
    if (
      (size_uk.length !== 0 || size_eu.length !== 0 || size_us.length !== 0) &&
      selectedSizeCode === ""
    ) {
      showNotification("error", __("Please select a size."));
    }

    if (
      (size_uk.length !== 0 || size_eu.length !== 0 || size_us.length !== 0) &&
      selectedSizeCode !== ""
    ) {
      this.setState({ isLoading: true });
      const { size } = productStock[selectedSizeCode];
      const optionId = selectedSizeType.toLocaleUpperCase();
      const optionValue = size[selectedSizeType];
      addProductToCart(
        {
          sku: selectedSizeCode,
          configSKU,
          qty: 1,
          optionId,
          optionValue,
          selectedClickAndCollectStore:
            selectedClickAndCollectStore?.value || "",
        },
        color,
        optionValue,
        basePrice,
        brand_name,
        thumbnail_url,
        url,
        itemPrice,
        searchQueryId
      ).then((response) => {
        // Response is sent only if error appear
        if (response) {
          showNotification("error", __(response));
          this.afterAddToCart(false, {
            isClickAndCollect: !!isClickAndCollect,
          });
          this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART_FAILED);
        } else {
          this.afterAddToCart(true, {
            isClickAndCollect: !!isClickAndCollect,
          });
          this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART);
        }
      });

      Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_CART, {
        product: {
          name,
          id: configSKU,
          price: itemPrice,
          brand: brand_name,
          category: product_type_6s,
          variant: color,
          quantity: 1,
        },
      });

      // vue analytics
      const locale = VueIntegrationQueries.getLocaleFromUrl();

      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_ADD_TO_CART,
        params: {
          event: VUE_ADD_TO_CART,
          pageType: "pdp",
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          uuid: getUUID(),
          referrer: prevPath,
          url: window.location.href,
          sourceProdID: configSKU,
          sourceCatgID: product_type_6s, // TODO: replace with category id
          prodPrice: itemPrice,
        },
      });
    }

    if (!insertedSizeStatus) {
      this.setState({ isLoading: true });
      const code = Object.keys(productStock);
      addProductToCart(
        {
          sku: code[0],
          configSKU,
          qty: 1,
          optionId: "",
          optionValue: "",
          selectedClickAndCollectStore:
            selectedClickAndCollectStore?.value || "",
        },
        color,
        null,
        basePrice,
        brand_name,
        thumbnail_url,
        url,
        itemPrice,
        searchQueryId
      ).then((response) => {
        // Response is sent only if error appear
        if (response) {
          this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART_FAILED);
          showNotification("error", __(response));
          this.afterAddToCart(false, {
            isClickAndCollect: !!isClickAndCollect,
          });
        } else {
          this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART);
          this.afterAddToCart(true, {
            isClickAndCollect: !!isClickAndCollect,
          });
        }
      });

      Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_CART, {
        product: {
          name,
          id: configSKU,
          price: itemPrice,
          brand: brand_name,
          category: product_type_6s,
          variant: color,
          quantity: 1,
        },
      });

      // vue analytics
      const locale = VueIntegrationQueries.getLocaleFromUrl();
      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_ADD_TO_CART,
        params: {
          event: VUE_ADD_TO_CART,
          pageType: "pdp",
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          uuid: getUUID(),
          referrer: prevPath,
          url: window.location.href,
          sourceProdID: configSKU,
          sourceCatgID: product_type_6s, // TODO: replace with category id
          prodPrice: itemPrice,
        },
      });
    }
  }

  afterAddToCart(isAdded = "true", options) {
    const {
      buttonRefreshTimeout,
      openClickAndCollectPopup,
      selectedClickAndCollectStore,
    } = this.state;

    if (openClickAndCollectPopup) {
      this.togglePDPClickAndCollectPopup();
    }
    const { setMinicartOpen } = this.props;
    // eslint-disable-next-line no-unused-vars
    this.setState({ isLoading: false });
    // TODO props for addedToCart
    const timeout = 1250;
    if (isAdded) {
      if (!!!options?.isClickAndCollect) {
        setMinicartOpen(true);
      }
      if (selectedClickAndCollectStore) {
        this.setState({
          selectedClickAndCollectStore: null,
        });
      }
      this.setState(
        { addedToCart: true },
        () => options?.isClickAndCollect && history.push("/cart")
      );
    }

    setTimeout(
      () => this.setState({ productAdded: false, addedToCart: false }),
      timeout
    );
  }
  sendMoEImpressions(event) {
    const {
      product: {
        categories = {},
        brand_name,
        color,
        name,
        price,
        product_type_6s,
        sku,
        thumbnail_url,
        url,
        simple_products,
        size_uk = [],
        size_eu = [],
        size_us = [],
      },
      product,
    } = this.props;
    const { selectedSizeType, selectedSizeCode } = this.state;

    const productStock = simple_products;

    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];

    const checkproductSize =
      (size_uk.length !== 0 || size_eu.length !== 0 || size_us.length !== 0) &&
      selectedSizeCode !== "";

    const { size } = checkproductSize ? productStock[selectedSizeCode] : "";
    const optionId = checkproductSize
      ? selectedSizeType.toLocaleUpperCase()
      : "";
    const optionValue = checkproductSize ? size[selectedSizeType] : "";

    const checkCategoryLevel = () => {
      if (!categories) {
        return "this category";
      }
      if (categories.level4 && categories.level4.length > 0) {
        return categories.level4[0];
      } else if (categories.level3 && categories.level3.length > 0) {
        return categories.level3[0];
      } else if (categories.level2 && categories.level2.length > 0) {
        return categories.level2[0];
      } else if (categories.level1 && categories.level1.length > 0) {
        return categories.level1[0];
      } else if (categories.level0 && categories.level0.length > 0) {
        return categories.level0[0];
      } else return "";
    };
    const categoryLevel =
      product_type_6s && product_type_6s.length > 0
        ? product_type_6s
        : checkCategoryLevel().includes("///")
        ? checkCategoryLevel().split("///").pop()
        : "";

    const getCartID = BrowserDatabase.getItem(CART_ID_CACHE_KEY)
      ? BrowserDatabase.getItem(CART_ID_CACHE_KEY)
      : "";
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      subcategory: categoryLevel || product_type_6s,
      color: color || "",
      brand_name: brand_name || "",
      full_price: basePrice || "",
      product_url: url || "",
      currency: getCurrency() || "",
      gender: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      product_sku: sku || "",
      discounted_price: itemPrice || "",
      product_image_url: thumbnail_url || "",
      product_name: name || "",
      size_id: optionId,
      size: optionValue,
      quantity: 1,
      ...(event !== EVENT_SELECT_SIZE && { cart_id: getCartID || "" }),
      app6thstreet_platform: "Web",
    });
  }
  clearTimeAll() {
    this.setState({ hideCheckoutBlock: false });

    clearTimeout(this.fullCheckoutHide);
    clearTimeout(this.startCheckoutHide);
  }

  proceedToCheckout() {
    this.setState({ showProceedToCheckout: true });

    this.startCheckoutHide = setTimeout(
      () => this.setState({ hideCheckoutBlock: true }),
      5000
    );
    this.fullCheckoutHide = setTimeout(
      () =>
        this.setState({
          showProceedToCheckout: false,
          hideCheckoutBlock: false,
        }),
      7000
    );
  }

  getPageType() {
    const { urlRewrite, currentRouteName } = window;

    if (currentRouteName === "url-rewrite") {
      if (typeof urlRewrite === "undefined") {
        return "";
      }

      if (urlRewrite.notFound) {
        return "notfound";
      }

      return (urlRewrite.type || "").toLowerCase();
    }

    return (currentRouteName || "").toLowerCase();
  }

  routeChangeToCart() {
    history.push("/cart", { errorState: false });
    Moengage.track_event(EVENT_MOE_VIEW_BAG, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: this.getPageType() || "",
      app6thstreet_platform: "Web",
    });
  }

  showAlertNotification(message) {
    this.props.showNotification("error", message);
  }

  confirmClickAndCollect() {
    this.addToCart();
  }

  selectClickAndCollectStore(value) {
    this.setState({
      selectedClickAndCollectStore: value,
    });
  }

  toggleRootElementsOpacity() {
    const { openClickAndCollectPopup } = this.state;
    const rootElement = document.getElementById("root");
    if (rootElement) {
      root.style.opacity = openClickAndCollectPopup ? 0.5 : 1;
    }
  }

  togglePDPClickAndCollectPopup() {
    const { openClickAndCollectPopup, selectedSizeCode } = this.state;
    const {
      showOverlay,
      hideActiveOverlay,
      product: { price = {}, size_uk = [], size_eu = [], size_us = [] },
      showNotification,
    } = this.props;
    if (!openClickAndCollectPopup) {
      if (!price[0]) {
        showNotification("error", __("Unable to add product to cart."));
        return;
      }

      if (
        (size_uk.length !== 0 ||
          size_eu.length !== 0 ||
          size_us.length !== 0) &&
        selectedSizeCode === ""
      ) {
        showNotification("error", __("Please select a size."));
        return;
      }
      showOverlay(PDP_CLICK_AND_COLLECT_POPUP_ID);
    }

    if (openClickAndCollectPopup) {
      hideActiveOverlay(PDP_CLICK_AND_COLLECT_POPUP_ID);
    }
    this.setState(
      {
        openClickAndCollectPopup: !openClickAndCollectPopup,
      }
      // () => {
      //   this.toggleRootElementsOpacity();
      // }
    );
  }

  render() {
    const { openClickAndCollectPopup } = this.state;
    return (
      <>
        <PDPAddToCart {...this.containerFunctions} {...this.containerProps()} />
        {openClickAndCollectPopup && (
          <PDPClickAndCollectPopup
            {...this.containerFunctions}
            {...this.containerProps()}
          />
        )}
      </>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PDPAddToCartContainer)
);
