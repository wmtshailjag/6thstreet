import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { getStore } from "Store";
import { setMinicartOpen } from "Store/Cart/Cart.action";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import Event, {
  ADD_TO_CART_ALGOLIA,
  EVENT_GTM_PRODUCT_ADD_TO_CART,
} from "Util/Event";
import PDPMixAndMatchProduct from "./PDPMixAndMatchProduct.component";
import PDPMixAndMatchProductSizePopup from "../PDPMixAndMatchProductSizePopup";

import { PDP_MIX_AND_MATCH_POPUP_ID } from "../PDPMixAndMatchProductSizePopup/PDPMixAndMatchProductSizePopup.config";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";

export const mapDispatchToProps = (dispatch) => ({
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  getCartTotals: (cartId) => CartDispatcher.getCartTotals(dispatch, cartId),
  addProductToCart: (
    productData,
    color,
    optionValue,
    basePrice,
    brand_name,
    thumbnail_url,
    url,
    itemPrice
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
      itemPrice
    ),
  setMinicartOpen: (isMinicartOpen = false) =>
    dispatch(setMinicartOpen(isMinicartOpen)),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
});

export class PDPMixAndMatchProductContainer extends PureComponent {
  static propTypes = {
    product: PropTypes.object.isRequired,
    addProductToCart: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    totals: PropTypes.object,
    PrevTotal: PropTypes.number,
    total: PropTypes.number,
    productAdded: PropTypes.bool,
    setMinicartOpen: PropTypes.func.isRequired,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
  };

  state = {
    sizeObject: {},
    mappedSizeObject: {},
    selectedSizeType: "eu",
    selectedSizeCode: "",
    insertedSizeStatus: true,
    addedToCart: false,
    buttonRefreshTimeout: 1250,
    isSizePopupOpen: false,
    isLoading: false,
  };

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
        sizeTypes: filteredProductSizeKeys || [],
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

  routeChangeToCart() {
    history.push("/cart");
  }

  afterAddToCart(isAdded = "true") {
    const { setMinicartOpen } = this.props;
    // eslint-disable-next-line no-unused-vars
    const { buttonRefreshTimeout } = this.state;
    this.setState({ isLoading: false });
    // TODO props for addedToCart
    const timeout = 1250;

    if (isAdded) {
      setMinicartOpen(true);
      this.setState({ addedToCart: true });
    }

    setTimeout(
      () => this.setState({ productAdded: false, addedToCart: false }),
      timeout
    );
  }

  addToCart() {
    const {
      product: {
        simple_products = {},
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
      },
      addProductToCart,
      showNotification,
    } = this.props;

    if (!price[0]) {
      showNotification("error", __("Unable to add product to cart."));

      return;
    }

    const { selectedSizeType, selectedSizeCode, insertedSizeStatus } =
      this.state;
    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];

    this.setState({ productAdded: true });

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
      const { size } = simple_products[selectedSizeCode];
      const optionId = selectedSizeType.toLocaleUpperCase();
      const optionValue = size[selectedSizeType];
      addProductToCart(
        {
          sku: selectedSizeCode,
          configSKU,
          qty: 1,
          optionId,
          optionValue,
        },
        color,
        optionValue,
        basePrice,
        brand_name,
        thumbnail_url,
        url,
        itemPrice
      ).then((response) => {
        // Response is sent only if error appear
        if (response) {
          showNotification("error", __(response));
          this.afterAddToCart(false);
        } else {
          this.afterAddToCart();
        }
      });

      Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_CART, {
        product: {
          brand: brand_name,
          category: "",
          id: configSKU,
          name,
          price: itemPrice,
          quantity: 1,
          size: optionValue,
          variant: color,
        },
      });
      var data = localStorage.getItem("customer");
      let userData = JSON.parse(data);
      let userToken;
      var qid = new URLSearchParams(window.location.search).get("qid");
      let queryID;
      if (!qid) {
        queryID = getStore().getState().SearchSuggestions.queryID;
      } else {
        queryID = qid;
      }
      if (userData?.data?.id) {
        userToken = userData.data.id;
      }
      if (queryID) {
        new Algolia().logAlgoliaAnalytics(
          "conversion",
          ADD_TO_CART_ALGOLIA,
          [],
          {
            objectIDs: [objectID],
            queryID,
            userToken: userToken ? `user-${userToken}` : getUUIDToken(),
          }
        );
      }
    }

    if (!insertedSizeStatus) {
      this.setState({ isLoading: true });
      const code = Object.keys(simple_products);

      addProductToCart(
        {
          sku: code[0],
          configSKU,
          qty: 1,
          optionId: "",
          optionValue: "",
        },
        color,
        null,
        basePrice,
        brand_name,
        thumbnail_url,
        url,
        itemPrice
      ).then((response) => {
        // Response is sent only if error appear
        if (response) {
          showNotification("error", __(response));
          this.afterAddToCart(false);
        } else {
          this.afterAddToCart();
        }
      });

      Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_CART, {
        product: {
          brand: brand_name,
          category: "",
          id: configSKU,
          name,
          price: itemPrice,
          quantity: 1,
          size: "",
          variant: "",
        },
      });
      var data = localStorage.getItem("customer");
      let userData = JSON.parse(data);
      let userToken;
      const queryID = getStore().getState().SearchSuggestions.queryID;
      if (userData?.data?.id) {
        userToken = userData.data.id;
      }
      if (queryID) {
        new Algolia().logAlgoliaAnalytics(
          "conversion",
          ADD_TO_CART_ALGOLIA,
          [],
          {
            objectIDs: [objectID],
            queryID,
            userToken: userToken ? `user-${userToken}` : getUUIDToken(),
          }
        );
      }
    }
  }

  toggleRootElementsOpacity() {
    const { isSizePopupOpen } = this.state;
    const rootElement = document.getElementById("root");
    if (rootElement) {
      root.style.opacity = isSizePopupOpen ? 0.3 : 1;
    }
  }

  togglePDPMixAndMatchProductSizePopup() {
    const { isSizePopupOpen } = this.state;
    const { showOverlay, hideActiveOverlay } = this.props;

    if (!isSizePopupOpen) {
      showOverlay(PDP_MIX_AND_MATCH_POPUP_ID);
    }

    if (isSizePopupOpen) {
      hideActiveOverlay(PDP_MIX_AND_MATCH_POPUP_ID);
    }

    this.setState({ isSizePopupOpen: !isSizePopupOpen }, () => {
      this.toggleRootElementsOpacity();
    });
  }

  onSizeTypeSelect(e) {
    e.persist();
    this.setState({
      selectedSizeType: e.target.value,
    });
  }

  onSizeSelect(e) {
    e.persist();
    this.setState(
      { selectedSizeCode: e.target.value },
      this.togglePDPMixAndMatchProductSizePopup
    );
  }

  containerProps = () => {
    const { product, setStockAvailability, renderMySignInPopup } = this.props;
    const { mappedSizeObject } = this.state;
    const basePrice =
      product.price[0] &&
      product.price[0][Object.keys(product.price[0])[0]]["6s_base_price"];

    return {
      ...this.state,
      ...this.props,
      sizeObject: mappedSizeObject,
      product,
      basePrice,
      setStockAvailability,
      renderMySignInPopup,
    };
  };

  containerFunctions = {
    onSizeTypeSelect: this.onSizeTypeSelect.bind(this),
    onSizeSelect: this.onSizeSelect.bind(this),
    addToCart: this.addToCart.bind(this),
    routeChangeToCart: this.routeChangeToCart.bind(this),
    togglePDPMixAndMatchProductSizePopup:
      this.togglePDPMixAndMatchProductSizePopup.bind(this),
  };

  componentDidMount() {
    const {
      product: { sku , simple_products=[]},
    } = this.props;
    const {
      sizeObject: { sizeCodes = [], sizeTypes },
    } = this.state;
    this.setState({ processingRequest: true });

      const emptyStockSizes = Object.entries(simple_products).reduce((acc, size) => {
        const sizeCode = size[0];
        const { quantity } = size[1];

        if (parseInt(quantity, 0) === 0) {
          acc.push(sizeCode);
        }

        return acc;
      }, []);

      const mappedSizes = sizeCodes.reduce((acc, sizeCode) => {
        if (!emptyStockSizes.includes(sizeCode)) {
          acc.push(sizeCode);
        }

        return acc;
      }, []);

      const object = {
        sizeTypes,
        sizeCodes: mappedSizes,
      };

      this.setState({
        processingRequest: false,
        mappedSizeObject: object,
        selectedSizeCode: object.sizeCodes[0],
      });
  }

  render() {
    const { isSizePopupOpen } = this.state;
    return (
      <>
        <PDPMixAndMatchProduct
          {...this.containerFunctions}
          {...this.containerProps()}
        />
        {isSizePopupOpen && (
          <PDPMixAndMatchProductSizePopup
            {...this.containerFunctions}
            {...this.containerProps()}
          />
        )}
      </>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps
)(PDPMixAndMatchProductContainer);
