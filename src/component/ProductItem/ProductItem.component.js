import {
  HOME_PAGE_BANNER_CLICK_IMPRESSIONS,
  HOME_PAGE_BANNER_IMPRESSIONS,
} from "Component/GoogleTagManager/events/BannerImpression.event";
import { EVENT_PRODUCT_LIST_IMPRESSION } from "Component/GoogleTagManager/events/ProductImpression.event";
import Image from "Component/Image";
import Link from "Component/Link";
import Price from "Component/Price";
import ProductLabel from "Component/ProductLabel/ProductLabel.component";
import WishlistIcon from "Component/WishlistIcon";
import PLPAddToCart from "Component/PLPAddToCart/PLPAddToCart.component";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { getStore } from "Store";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { Product } from "Util/API/endpoint/Product/Product.type";
import { getGenderInArabic } from "Util/API/endpoint/Suggestions/Suggestions.create";
import Algolia from "Util/API/provider/Algolia";
import { isArabic, getCurrency } from "Util/App";
import { getUUIDToken } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import isMobile from "Util/Mobile";
import Event, {
  EVENT_GTM_PRODUCT_CLICK,
  SELECT_ITEM_ALGOLIA,
  EVENT_MOE_PRODUCT_CLICK,
} from "Util/Event";
import "./ProductItem.style";
import { setPrevPath } from "Store/PLP/PLP.action";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { RequestedOptions } from "Util/API/endpoint/Product/Product.type";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

//Global Variable for PLP AddToCart
var urlWithQueryID;
export const mapStateToProps = (state) => ({
  prevPath: state.PLP.prevPath,
  requestedOptions: state.PLP.options,
});

export const mapDispatchToProps = (dispatch, state) => ({
  setPrevPath: (prevPath) => dispatch(setPrevPath(prevPath)),
  resetProduct: () => PDPDispatcher.resetProduct({}, dispatch),
});

class ProductItem extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
    page: PropTypes.string,
    position: PropTypes.number,
    qid: PropTypes.string,
    isVueData: PropTypes.bool,
    pageType: PropTypes.string,
    prevPath: PropTypes.string,
    requestedOptions: RequestedOptions.isRequired,
  };

  static defaultProps = {
    page: "",
    impressionSent: false,
  };

  state = {
    isArabic: isArabic(),
    stockAvailibility: true,
    selectedSizeType: "eu",
    selectedSizeCode: "",
  };
  componentDidMount() {
    this.registerViewPortEvent();
  }

  registerViewPortEvent() {
    let observer;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    observer = new IntersectionObserver(this.handleIntersect, options);
    observer.observe(this.viewElement);
  }
  sendImpressions() {
    const { product = [], sendProductImpression, page } = this.props;
    if (page == "plp") {
      sendProductImpression([product]);
    } else {
      Event.dispatch(EVENT_PRODUCT_LIST_IMPRESSION, [product]);
    }
    this.setState({ impressionSent: true });
  }
  handleIntersect = (entries, observer) => {
    const { impressionSent } = this.state;
    if (impressionSent) {
      return;
    }
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.sendImpressions();
      }
    });
  };
  setSize = (sizeType, sizeCode) => {
    // this.setState({
    //   selectedSizeType: sizeType || "eu",
    //   selectedSizeCode: sizeCode || "",
    // });
  };

  setStockAvailability = (status) => {
    // const {
    //   product: { price },
    // } = this.props;
    // console.log("hi",status)
    // this.setState({ stockAvailibility: !!price && status });
  };

  handleClick = this.handleProductClick.bind(this);

  handleProductClick() {
    const {
      product,
      position,
      qid,
      isVueData,
      setPrevPath,
      resetProduct,
      product: {
        name,
        url,
        sku,
        color,
        brand_name,
        product_type_6s,
        categories,
        price = {},
        product_Position,
        thumbnail_url,
      },
    } = this.props;

    var data = localStorage.getItem("customer");
    let userData = JSON.parse(data);
    let userToken;
    let queryID;
    resetProduct();
    setPrevPath(window.location.href);
    if (!isVueData) {
      if (!qid) {
        queryID = getStore().getState().SearchSuggestions.queryID;
      } else {
        queryID = qid;
      }
    }
    if (userData?.data) {
      userToken = userData.data.id;
    }
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
      checkCategoryLevel().includes("///")
        ? checkCategoryLevel().split("///").pop()
        : "";

    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];
    Event.dispatch(EVENT_GTM_PRODUCT_CLICK, {
      name: name,
      id: sku,
      price: itemPrice,
      brand: brand_name,
      category: product_type_6s || categoryLevel,
      varient: color || "",
      position: product_Position || "",
    });
    if (queryID) {
      new Algolia().logAlgoliaAnalytics("click", SELECT_ITEM_ALGOLIA, [], {
        objectIDs: [product.objectID],
        queryID,
        userToken: userToken ? `user-${userToken}` : getUUIDToken(),
        position: [position],
      });
    }
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    Moengage.track_event(EVENT_MOE_PRODUCT_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      subcategory: categoryLevel || product_type_6s,
      color: color || "",
      brand_name: brand_name || "",
      full_price: basePrice || "",
      product_url: url,
      currency: getCurrency() || "",
      product_sku: sku || "",
      discounted_price: itemPrice || "",
      product_image_url: thumbnail_url || "",
      product_name: name,
      app6thstreet_platform: "Web",
    });
    // this.sendBannerClickImpression(product);
  }

  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderWishlistIcon() {
    const {
      product: { sku },
      product,
      pageType,
      renderMySignInPopup,
    } = this.props;
    return (
      <WishlistIcon
        renderMySignInPopup={renderMySignInPopup}
        sku={sku}
        data={product}
        pageType={pageType}
      />
    );
  }

  renderLabel() {
    const { product } = this.props;
    return <ProductLabel product={product} section="productItem" />;
  }

  renderColors() {
    const {
      product: { also_available_color, promotion },
    } = this.props;

    if (also_available_color && !promotion) {
      const count = also_available_color.split(",").length - 2;

      return count > 0 ? (
        <div block="PLPSummary" elem="Colors">
          {" "}
          {`+${count} `} {__("Colors")}{" "}
        </div>
      ) : null;
    }

    return null;
  }

  renderExclusive() {
    const {
      product: { promotion },
    } = this.props;

    if (promotion !== undefined) {
      return promotion !== null ? (
        <div block="PLPSummary" elem="Exclusive">
          {" "}
          {promotion}{" "}
        </div>
      ) : null;
    }

    return null;
  }

  renderOutOfStock() {
    const {
      product: { in_stock, stock_qty },
    } = this.props;
    if (in_stock === 0 || (in_stock === 1 && stock_qty === 0)) {
      return (
        <span block="ProductItem" elem="OutOfStock">
          {" "}
          {__("out of stock")}
        </span>
      );
    }

    return null;
  }

  renderImage() {
    const {
      product: { thumbnail_url, brand_name, product_type_6s, color },
      lazyLoad = true,
      requestedOptions,
    } = this.props;

    const checkCatgeroyPath = () => {
      if (requestedOptions.hasOwnProperty("categories.level4") == 1) {
        return requestedOptions["categories.level4"];
      } else if (requestedOptions.hasOwnProperty("categories.level3") == 1) {
        return requestedOptions["categories.level3"];
      } else if (requestedOptions.hasOwnProperty("categories.level2") == 1) {
        return requestedOptions["categories.level2"];
      } else if (requestedOptions.hasOwnProperty("categories.level1") == 1) {
        return requestedOptions["categories.level1"];
      } else if (requestedOptions.hasOwnProperty("categories.level0") == 1) {
        return requestedOptions["categories.level0"];
      } else {
        return "";
      }
    };
    const categoryTitle = checkCatgeroyPath().split("///").pop();

    const altText =
      brand_name + " " + categoryTitle + " - " + color + " " + product_type_6s;
    return (
      <div block="ProductItem" elem="ImageBox">
        <Image lazyLoad={lazyLoad} src={thumbnail_url} alt={altText} />
        {/* {this.renderOutOfStock()} */}
        {this.renderExclusive()}
        {this.renderColors()}
      </div>
    );
  }

  renderBrand() {
    const {
      product: { brand_name },
    } = this.props;
    return (
      <h2 block="ProductItem" elem="Brand">
        {" "}
        {brand_name}{" "}
      </h2>
    );
  }
  renderTitle() {
    const {
      product: { name },
    } = this.props;

    return (
      <p block="ProductItem" elem="Title">
        {" "}
        {name}{" "}
      </p>
    );
  }

  renderPrice() {
    const {
      product: { price },
      page,
    } = this.props;
    if(!price || (Array.isArray(price) && !price[0])){
      return null;
    }
    return <Price price={price} page={page} renderSpecialPrice={true} />;
  }

  renderAddToCartOnHover() {
    const { 
      product,
      pageType,
      removeFromWishlist,
      wishlist_item_id,
    } = this.props;
    let price = Array.isArray(product.price)
      ? Object.values(product.price[0])
      : Object.values(product.price);
    if (price[0].default === 0) {
      return null;
    }
    return (
      <div block="ProductItem" elem="AddToCart">
        <PLPAddToCart 
          product={this.props.product}
          url={urlWithQueryID}
          pageType={pageType}
          removeFromWishlist={removeFromWishlist}
          wishlist_item_id={wishlist_item_id}
        />
      </div>
    );
  }

  renderLink() {
    const {
      product,
      product: { url, link },
      qid,
      isVueData,
      prevPath = null,
    } = this.props;
    let queryID;
    if (!isVueData) {
      if (!qid) {
        queryID = getStore().getState().SearchSuggestions.queryID;
      } else {
        queryID = qid;
      }
    }

    let pathname = "/";
    if (!isVueData && url) {
      try {
        pathname = new URL(url)?.pathname;
      } catch (err) {
        console.error(err);
      }
      if (queryID) {
        urlWithQueryID = `${pathname}?qid=${queryID}`;
      } else {
        urlWithQueryID = pathname;
      }
    } else {
      urlWithQueryID = url ? url : link ? link: link; // From api link and url both in different cases.
    }
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";
    let requestedGender = isArabic ? getGenderInArabic(gender) : gender;

    let parseLink = urlWithQueryID;
    const linkTo = {
      pathname: parseLink,
      state: {
        product,
        prevPath: prevPath,
      },
    };

    return (
      <Link to={isVueData ? parseLink : linkTo} onClick={this.handleClick}>
        {this.renderImage()}
        {this.renderOutOfStock()}
        {this.renderBrand()}
        {this.renderTitle()}
        {this.renderPrice()}
      </Link>
    );
  }

  render() {
    const { isArabic } = this.state;
    const {
      product: { sku },
      pageType
    } = this.props;
    let setRef = (el) => {
      this.viewElement = el;
    };
    return (
      <li
        id={sku}
        ref={setRef}
        block="ProductItem"
        mods={{
          isArabic,
        }}
      >
        {" "}
        {this.renderLabel()}
        {this.renderWishlistIcon()} {this.renderLink()}{" "}
        {!isMobile.any() && pageType !== "vuePlp" && pageType !== "cart" && this.renderAddToCartOnHover()}
      </li>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProductItem)
);
