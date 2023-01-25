import { Fragment, PureComponent } from "react";
import { isArabic } from "Util/App";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import VueIntegrationQueries from "Query/vueIntegration.query";
import StrikeThrough from "./icons/strike-through.png";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import { setMinicartOpen } from "Store/Cart/Cart.action";
import { getUUID } from "Util/Auth";
import { getStore } from "Store";
import Image from "Component/Image";
import Event, {
  EVENT_GTM_PRODUCT_ADD_TO_CART,
  VUE_ADD_TO_CART,
  EVENT_MOE_ADD_TO_CART,
  EVENT_MOE_ADD_TO_CART_FAILED,
} from "Util/Event";
import { v4 } from "uuid";
import "./PLPAddToCart.style";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getCurrency } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  language: state.AppState.language,
  country: state.AppState.country,
  prevPath: state.PLP.prevPath,
});

export const CART_ID_CACHE_KEY = "CART_ID_CACHE_KEY";

export const mapDispatchToProps = (dispatch) => ({
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  setMinicartOpen: (isMinicartOpen = false) =>
    dispatch(setMinicartOpen(isMinicartOpen)),
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
});

class PLPAddToCart extends PureComponent {
  state = {
    insertedSizeStatus: null,
    sizeObject: {},
    selectedSizeCode: "",
    selectedSizeType: "eu",
    selectedClickAndCollectStore: null,
    addedToCart: false,
    isLoading: false,
    isOutOfStock: false,
    isArabic: isArabic(),
  };

  componentDidMount() {
    this.setSizeData();
    this.updateDefaultSizeType();
    const {
      product: {
        size_eu,
        size_uk,
        size_us,
        in_stock,
        stock_qty,
        simple_products = [],
      },
    } = this.props;

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
      isOutOfStock: outOfStockStatus,
    });
  }

  componentDidUpdate() {
    const sliders = document.querySelectorAll(
      ".PLPAddToCart-SizeSelector-SizeContainer-AvailableSizes"
    );
    sliders.forEach((slider) => {
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        if (slider) {
          slider.scrollLeft = scrollLeft - walk;
        }
      });
    });
  }

  setSizeData = () => {
    const { product } = this.props;

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

      let object = {
        sizeCodes: filteredProductKeys || [],
        sizeTypes: filteredProductSizeKeys?.length ? ["eu", "uk", "us"] : [],
      };

      const allSizes = Object.entries(simple_products).reduce((acc, size) => {
        const sizeCode = size[0];
        const { quantity } = size[1];

        if (quantity !== null && quantity !== undefined) {
          acc.push(sizeCode);
        }

        return acc;
      }, []);

      object.sizeCodes = allSizes;

      if (
        filteredProductKeys.length <= 1 &&
        filteredProductSizeKeys.length === 0
      ) {
        this.setState({
          insertedSizeStatus: false,
          sizeObject: object,
        });
        return;
      }

      if (
        filteredProductKeys.length > 1 &&
        filteredProductSizeKeys.length === 0
      ) {
        const object = {
          sizeCodes: [filteredProductKeys[1]],
          sizeTypes: filteredProductSizeKeys,
        };

        this.setState({
          insertedSizeStatus: false,
          sizeObject: object,
        });
        return;
      }

      this.setState({
        sizeObject: object,
      });
      return;
    }
    this.setState({
      insertedSizeStatus: false,
      sizeObject: {
        sizeCodes: [],
        sizeTypes: [],
      },
    });
    return;
  };

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

  onSizeTypeSelect = (type) => {
    this.setState({
      selectedSizeType: type.target.value,
    });
  };

  getSizeTypeSelect() {
    const { product } = this.props;
    const { selectedSizeType, sizeObject = {}, isArabic } = this.state;

    if (this.state.isOutOfStock) {
      return null;
    }

    if (sizeObject.sizeTypes !== undefined) {
      return (
        <div block="PLPAddToCart" elem="SizeTypeSelect" mods={{ isArabic }}>
          <select
            key="SizeTypeSelect"
            block="PLPAddToCart"
            elem="SizeTypeSelectElement"
            value={selectedSizeType}
            onChange={this.onSizeTypeSelect}
          >
            {sizeObject.sizeTypes.map((type = "") => {
              if (type) {
                if (product[`size_${type}`]?.length > 0) {
                  return (
                    <option
                      key={type}
                      block="PLPAddToCart"
                      elem="SizeTypeOption"
                      value={type}
                    >
                      {type.toUpperCase()}
                    </option>
                  );
                }
              }
              return null;
            })}
          </select>
        </div>
      );
    }

    return null;
  }

  getSizeSelect() {
    let productStock = this.props.product.simple_products;
    let selectedSizeType = this.state.selectedSizeType;
    let sizeObject = this.state.sizeObject;
    let product = this.props.product;
    let isArabic = this.state.isArabic;

    if (
      sizeObject?.sizeCodes !== undefined &&
      Object.keys(productStock || []).length !== 0 &&
      product[`size_${selectedSizeType}`].length !== 0
    ) {
      return (
        <div
          block="PLPAddToCart-SizeSelector-SizeContainer"
          elem="AvailableSizes"
          mods={{ isArabic }}
        >
          {sizeObject.sizeCodes.reduce((acc, code) => {
            const label = productStock[code].size[selectedSizeType];

            if (label) {
              acc.push(this.renderSizeOption(productStock, code, label));
            }

            return acc;
          }, [])}
        </div>
      );
    }

    return <span id="notavailable">{__("OUT OF STOCK")}</span>;
  }

  renderSizeOption(productStock, code, label) {
    const { selectedSizeCode } = this.state;
    const isNotAvailable = parseInt(productStock[code].quantity) === 0;
    const selectedLabelStyle = {
      fontSize: "14px",
      color: "#ffffff",
      fontWeight: 600,
      letterSpacing: 0,
      backgroundColor: "#000000",
    };
    const selectedStrikeThruLineStyle = {
      opacity: 0.6,
      filter: "none",
    };
    const isCurrentSizeSelected = selectedSizeCode === code;

    return (
      <div
        block="PLPAddToCart-SizeSelector"
        elem={isNotAvailable ? "SizeOptionContainerOOS" : "SizeOptionContainer"}
        key={v4()}
        className="SizeOptionList"
        onClick={() => {
          this.onSizeSelect({ target: { value: code } });
        }}
      >
        <input
          id={code}
          key={code}
          type="radio"
          elem="SizeOption"
          name="size"
          block="PLPAddToCart"
          value={code}
          checked={isCurrentSizeSelected}
        />
        <div>
          <label
            htmlFor={code}
            style={isCurrentSizeSelected ? selectedLabelStyle : {}}
          >
            {label}
          </label>
          {isNotAvailable && (
            <Image
              lazyLoad={false}
              src={StrikeThrough}
              className="lineImg"
              style={isCurrentSizeSelected ? selectedStrikeThruLineStyle : {}}
              alt={"strike-through-icon"}
            />
          )}
        </div>
        <div />
      </div>
    );
  }

  onSizeSelect = ({ target }) => {
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
    });
  };

  renderAddToCartButton() {
    const { sizeObject = {}, isLoading, addedToCart } = this.state;
    if (!Object.keys(sizeObject).length) {
      return null;
    }
    const {
      product: { stock_qty, highlighted_attributes, simple_products },
      product = {},
    } = this.props;
    let productStock = simple_products || {};

    // const disabled = this.checkStateForButtonDisabling();
    return (
      <>
        {(stock_qty !== 0 ||
          highlighted_attributes === null ||
          (Object.keys(product).length !== 0 &&
            product.constructor !== Object)) &&
          Object.keys(productStock).length !== 0 && (
            <button
              onClick={() => this.addToCart()}
              block="PLPAddToCart"
              elem="AddToCartButton"
              mods={{ isLoading }}
              mix={{
                block: "PLPAddToCart",
                elem: "AddToCartButton",
                mods: {
                  addedToCart,
                  isArabic: isArabic(),
                },
              }}
              //   disabled={disabled}
            >
              <span>{__("Add to bag")}</span>
              <span>{__("Adding...")}</span>
              <span>{__("Added to bag")}</span>
            </button>
          )}
      </>
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
    const checkproductStock =
      typeof productStock === "object" && productStock !== null;
    const { size } =
      checkproductSize && checkproductStock
        ? productStock[selectedSizeCode]
        : "";
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
      cart_id: getCartID || "",
      app6thstreet_platform: "Web",
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
        simple_products,
      },
      addProductToCart,
      showNotification,
      prevPath = null,
      product,
    } = this.props;
    const {
      selectedClickAndCollectStore,
      selectedSizeType,
      selectedSizeCode,
      insertedSizeStatus,
    } = this.state;
    const productStock = simple_products;
    if (!price[0]) {
      showNotification("error", __("Unable to add product to cart."));
      return;
    }
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
      return;
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
          this.afterAddToCart(false, {});
          this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART_FAILED);
        } else {
          this.afterAddToCart(true, {});
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

      //   vue analytics
      const locale = VueIntegrationQueries.getLocaleFromUrl();
      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_ADD_TO_CART,
        params: {
          event: VUE_ADD_TO_CART,
          pageType: "plp",
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          uuid: getUUID(),
          referrer: prevPath,
          url: window.location.href,
          sourceProdID: configSKU,
          sourceCatgID: product_type_6s, // TODO: replace with category id
          prodPrice: basePrice,
        },
      });
    } else if (!insertedSizeStatus) {
      this.setState({ isLoading: true });
      const code = Object.keys(productStock);
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
        itemPrice,
        searchQueryId
      ).then((response) => {
        // Response is sent only if error appear
        if (response) {
          showNotification("error", __(response));
          this.afterAddToCart(false);
        } else {
          this.afterAddToCart(true);
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
          pageType: "plp",
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          uuid: getUUID(),
          referrer: prevPath,
          url: window.location.href,
          sourceProdID: configSKU,
          sourceCatgID: product_type_6s, // TODO: replace with category id
          prodPrice: basePrice,
        },
      });
    }
  }

  afterAddToCart(isAdded = "true") {
    const { 
      setMinicartOpen,
      pageType,
      removeFromWishlist,
      wishlist_item_id,
    } = this.props;
    // eslint-disable-next-line no-unused-vars
    const { buttonRefreshTimeout } = this.state;
    this.setState({ isLoading: false });
    //this.sendMoEImpressions(EVENT_MOE_ADD_TO_CART);
    // TODO props for addedToCart
    const timeout = 1250;

    if (isAdded) {
      setMinicartOpen(true);
      this.setState({ addedToCart: true });

      /* if user is adding product from wishlist to cart then after adding to cart 
           that product should remove from wishlist   */
      
      if(wishlist_item_id) {
      removeFromWishlist(wishlist_item_id);
      }
    }

    setTimeout(
      () => this.setState({ productAdded: false, addedToCart: false }),
      timeout
    );
  }

  render() {
    const { sizeObject } = this.state;
    return (
      <div block="PLPAddToCart">
        <div block="PLPAddToCart" elem="SizeSelector">
          {sizeObject.sizeTypes !== undefined &&
          sizeObject.sizeTypes.length !== 0 ? (
            <>
              <div block="PLPAddToCart-SizeSelector" elem="SizeTypeContainer">
                {this.getSizeTypeSelect()}
              </div>
              <div block="PLPAddToCart-SizeSelector" elem="SizeContainer">
                {this.getSizeSelect()}
              </div>
            </>
          ) : null}
        </div>
        {this.renderAddToCartButton()}
        <a href={this.props.url} block="PLPAddToCart-ViewDetails">
          {__("VIEW DETAILS")}
        </a>
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PLPAddToCart)
);
