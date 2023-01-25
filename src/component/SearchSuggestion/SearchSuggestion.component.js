import Image from "Component/Image";
import Link from "Component/Link";
import Loader from "Component/Loader";
import Price from "Component/Price";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { withRouter } from "react-router";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { Products } from "Util/API/endpoint/Product/Product.type";
import DragScroll from "Component/DragScroll/DragScroll.component";
import {
  getGenderInArabic,
  getHighlightedText,
} from "Util/API/endpoint/Suggestions/Suggestions.create";
// import { WishlistItems } from "Util/API/endpoint/Wishlist/Wishlist.type";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App/App";
import BrowserDatabase from "Util/BrowserDatabase";
import Event, {
  EVENT_CLICK_RECENT_SEARCHES_CLICK,
  EVENT_CLICK_SEARCH_QUERY_SUGGESSTION_CLICK,
  EVENT_CLICK_TOP_SEARCHES_CLICK,
  EVENT_GTM_BRANDS_CLICK,
  EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW,
  EVENT_GTM_PRODUCT_CLICK,
  EVENT_GTM_TRENDING_BRANDS_CLICK,
  EVENT_GTM_TRENDING_TAGS_CLICK,
  EVENT_MOE_BRANDS_CLICK,
  EVENT_MOE_TRENDING_BRANDS_CLICK,
  EVENT_MOE_TRENDING_TAGS_CLICK,
  EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK,
} from "Util/Event";
import isMobile from "Util/Mobile";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { v4 } from "uuid";
import ExploreMore from "../ExploreMore";
import RecommendedForYouVueSliderContainer from "../RecommendedForYouVueSlider";
// import WishlistSliderContainer from "../WishlistSlider";
import BRAND_MAPPING from "./SearchSiggestion.config";
import "./SearchSuggestion.style";

var ESCAPE_KEY = 27;

class SearchSuggestion extends PureComponent {
  static propTypes = {
    inNothingFound: PropTypes.bool.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    isActive: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    products: Products.isRequired,
    brands: PropTypes.array.isRequired,
    trendingBrands: PropTypes.array.isRequired,
    trendingTags: PropTypes.array.isRequired,
    hideActiveOverlay: PropTypes.func,
    querySuggestions: PropTypes.array,
    topSearches: PropTypes.array,
    recentSearches: PropTypes.array,
    recommendedForYou: PropTypes.array,
    trendingProducts: PropTypes.array,
    searchString: PropTypes.string,
    // wishlistData: WishlistItems.isRequired,
  };

  static defaultProps = {
    hideActiveOverlay: () => {},
  };
  ref = React.createRef();

  state = {
    isArabic: isArabic(),
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  _handleKeyDown = (event) => {
    switch (event.keyCode) {
      case ESCAPE_KEY:
        this.props.closeSearch();
        break;
      default:
        break;
    }
  };

  getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
  };

  getBrandUrl = (brandName) => {
    const { isArabic } = this.state;
    let name = brandName;
    if (isArabic) {
      name = this.getKeyByValue(BRAND_MAPPING, brandName);
    }

    name = name ? name : brandName;
    const urlName = name
      ?.replace(/'/g, "")
      .replace(/[(\s+).&]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/\-$/, "")
      .replace("@", "at")
      .toLowerCase();
    // .replace("&", "")
    // .replace(/'/g, "")
    // .replace(/(\s+)|--/g, "-")
    // .replace("@", "at")
    // .toLowerCase();
    return urlName;
  };

  // query suggestion block starts

  getBrandSuggestionUrl = (brandName, queryID) => {
    const { isArabic } = this.state;
    let brandUrl;
    let formattedBrandName;
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";

    if (isArabic) {
      let requestedGender =
        BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
          ? "أولاد,بنات,نساء,رجال"
          : getGenderInArabic(gender);
      let arabicAlphabetDigits =
        /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]|[\u0200]|[\u00A0]/g;
      if (arabicAlphabetDigits.test(brandName)) {
        formattedBrandName = brandName.match("\\s*[^a-zA-Z]+\\s*");
        brandName = formattedBrandName[0].trim();
      }
      brandUrl = `${this.getBrandUrl(
        brandName
      )}.html?q=${brandName}&qid=${queryID}&dFR[gender][0]=${requestedGender.replace(
        requestedGender.charAt(0),
        requestedGender.charAt(0).toUpperCase()
      )}`;
    } else {
      formattedBrandName = brandName
        ?.toUpperCase()
        .split(" ")
        .filter(function (allItems, i, a) {
          return i == a.indexOf(allItems?.toUpperCase());
        })
        .join(" ")
        .toLowerCase();
      brandUrl = `${this.getBrandUrl(
        formattedBrandName
      )}.html?q=${formattedBrandName}&dFR[gender][0]=${gender.replace(
        gender.charAt(0),
        gender.charAt(0).toUpperCase()
      )}`;
    }
    return brandUrl;
  };

  getCatalogUrl = (query, gender) => {
    const { isArabic } = this.state;
    let requestedGender = gender;
    let catalogUrl;
    let genderInURL;
    if (isArabic) {
      if (gender === "kids") {
        genderInURL = "أولاد,بنات";
        // to add Boy~Girl in arabic
      } else if (gender === "all") {
        genderInURL = "أولاد,بنات,نساء,رجال";
      } else {
        if (gender !== "home") {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    } else {
      if (gender === "kids") {
        genderInURL = "Boy,Girl";
      } else if (gender === "all") {
        genderInURL = "Boy,Girl,Men,Women,Kids";
      } else {
        if (gender !== "home") {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    }
    catalogUrl = `/catalogsearch/result/?q=${encodeURIComponent(
      query
    )}&p=0&dFR[gender][0]=${genderInURL}`;
    return catalogUrl;
  };

  // query suggestion block ends

  discountPercentage(basePrice, specialPrice, haveDiscount) {
    let discountPercentage = Math.round(100 * (1 - specialPrice / basePrice));
    if (discountPercentage === 0) {
      discountPercentage = 1;
    }

    return (
      <span
        block="SearchProduct"
        elem="Discount"
        mods={{ discount: haveDiscount }}
      >
        -({discountPercentage}%)<span> </span>
      </span>
    );
  }

  closeSearchPopup = () => {
    this.props.closeSearch();
  };

  logRecentSearches = (search) => {
    let recentSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    let tempRecentSearches = [];
    if (recentSearches) {
      tempRecentSearches = [...recentSearches.reverse()];
    }
    tempRecentSearches = tempRecentSearches.filter(
      (item) => item.name.toUpperCase().trim() !== search.toUpperCase().trim()
    );
    if (tempRecentSearches.length > 4) {
      tempRecentSearches.shift();
      tempRecentSearches.push({
        name: search,
      });
    } else {
      tempRecentSearches.push({ name: search });
    }
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(tempRecentSearches.reverse())
    );
  };

  // common function for top search, recent search, query suggestion search.
  onSearchQueryClick = (search) => {
    const { closeSearch, setPrevPath } = this.props;
    this.logRecentSearches(search);
    setPrevPath(window.location.href);
    closeSearch();
  };

  handleProductClick = (product) => {
    Event.dispatch(EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK, product?.name);
    Moengage.track_event(EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      search_term: product?.name || "",
      app6thstreet_platform: "Web",
    });
    Event.dispatch(EVENT_GTM_PRODUCT_CLICK, product);
    this.closeSearchPopup();
  };

  handleBrandsClick = (brandItem) => {
    const { closeSearch, setPrevPath } = this.props;
    Event.dispatch(EVENT_GTM_BRANDS_CLICK, brandItem);
    Moengage.track_event(EVENT_MOE_BRANDS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      search_term: brandItem || "",
      app6thstreet_platform: "Web",
    });
    setPrevPath(window.location.href);
    closeSearch();
  };

  handleTrendingBrandsClick = (brandName) => {
    const { closeSearch, setPrevPath } = this.props;
    Event.dispatch(EVENT_GTM_TRENDING_BRANDS_CLICK, brandName);
    Moengage.track_event(EVENT_MOE_TRENDING_BRANDS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      search_term: brandName || "",
      app6thstreet_platform: "Web",
    });
    setPrevPath(window.location.href);
    closeSearch();
  };

  handleTrendingTagsClick = (label) => {
    const { closeSearch, setPrevPath } = this.props;
    Event.dispatch(EVENT_GTM_TRENDING_TAGS_CLICK, label);
    Moengage.track_event(EVENT_MOE_TRENDING_TAGS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      search_term: label || "",
      app6thstreet_platform: "Web",
    });
    setPrevPath(window.location.href);
    closeSearch();
  };

  // render functions

  renderBrand = (brand) => {
    const { brand_name: name = "", count } = brand;
    const urlName = this.getBrandUrl(name);

    return (
      <li key={v4()}>
        <Link
          to={{
            pathname: `/${urlName}.html?q=${urlName}`,
          }}
          onClick={() => this.handleBrandsClick(urlName)}
        >
          <div className="suggestion-details-box">
            {name}
            <div>{count}</div>
          </div>
        </Link>
      </li>
    );
  };

  renderLoader() {
    const { isLoading } = this.props;
    const { isMobile } = this.state;

    return isMobile ? null : <Loader isLoading={isLoading} />;
  }

  renderBrands() {
    const { brands = [] } = this.props;

    return (
      <div block="SearchSuggestion" elem="Brands">
        <h2>{__("Brands")}</h2>
        <ul>{brands.map(this.renderBrand)}</ul>
      </div>
    );
  }

  renderQuerySuggestion = (querySuggestions, i) => {
    const { query, label } = querySuggestions;
    const { searchString, products = [] } = this.props;
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";
    const fetchSKU = products?.find(
      (item) =>
        item?.name?.toUpperCase()?.includes(query?.toUpperCase()) ||
        item?.sku?.toUpperCase()?.includes(query?.toUpperCase())
    );

    const suggestionEventDipatch = (query) => {
      if (query == searchString) {
        Event.dispatch(EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW, query);
        Moengage.track_event(EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW, {
          country: getCountryFromUrl().toUpperCase(),
          language: getLanguageFromUrl().toUpperCase(),
          search_term: query || "",
          app6thstreet_platform: "Web",
        });
      } else {
        Event.dispatch(EVENT_CLICK_SEARCH_QUERY_SUGGESSTION_CLICK, query);
        Moengage.track_event(EVENT_CLICK_SEARCH_QUERY_SUGGESSTION_CLICK, {
          country: getCountryFromUrl().toUpperCase(),
          language: getLanguageFromUrl().toUpperCase(),
          search_term: query || "",
          app6thstreet_platform: "Web",
        });
      }
      this.onSearchQueryClick(query)
    };
    const suggestionContent = () => {
      if (products?.length === 1 && fetchSKU) {
        return (
          <Link
            to={fetchSKU?.url}
            onClick={() => suggestionEventDipatch(query)}
            key={i}
          >
            <div className="suggestion-details-box text-capitalize">
              {getHighlightedText(query, searchString)}
            </div>
          </Link>
        );
      } else {
        return (
          <Link
            to={{
              pathname: this.getCatalogUrl(query, gender),
            }}
            onClick={() => suggestionEventDipatch(query)}
            key={i}
          >
            <div className="suggestion-details-box">
              {getHighlightedText(label, searchString)}
            </div>
          </Link>
        );
      }
    };
    return <li>{suggestionContent()}</li>;
  };

  renderQuerySuggestions() {
    const { querySuggestions = [] } = this.props;
    return (
      <div block="SearchSuggestion" elem="Item">
        {querySuggestions?.length > 0 ? (
          <ul>
            {querySuggestions?.slice(0, 5).map(this.renderQuerySuggestion)}
          </ul>
        ) : null}
      </div>
    );
  }

  renderSpecialPrice(specialPrice, haveDiscount) {
    const currency = getCurrency();
    return (
      <span
        block="SearchProduct"
        elem="SpecialPrice"
        mods={{ discount: haveDiscount }}
      >
        {currency}
        <span> </span>
        {specialPrice}
      </span>
    );
  }

  renderPrice = (price) => {
    if (price && price.length > 0) {
      const priceObj = price?.[0],
        currency = getCurrency();
      const basePrice = priceObj?.[currency]?.["6s_base_price"];
      const specialPrice = priceObj?.[currency]?.["6s_special_price"];
      const haveDiscount =
        specialPrice !== "undefined" &&
        specialPrice &&
        basePrice !== specialPrice;

      return (
        <div block="SearchProduct" elem="SpecialPriceCon">
          <Price price={price} renderSpecialPrice={false} />
        </div>
      );
    }
    return null;
  };

  renderProduct = (product) => {
    const { url, name, thumbnail_url, brand_name, price } = product;
    const { isArabic } = this.state;
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";

    let requestedGender = gender;
    let genderInURL;
    if (isArabic) {
      if (gender === "kids") {
        genderInURL = "أولاد,بنات";
        // to add Boy~Girl in arabic
      } else if (gender === "all") {
        genderInURL = "أولاد,بنات,نساء,رجال";
      } else {
        if (gender !== "home") {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    } else {
      if (gender === "kids") {
        genderInURL = "Boy,Girl";
      } else if (gender === "all") {
        genderInURL = "Boy,Girl,Men,Women,Kids";
      } else {
        if (gender !== "home") {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    }
    let parseLink = url?.includes("catalogsearch/result")
      ? url?.split("&")[0] + `&p=0&dFR[gender][0]=${genderInURL}`
      : url;

    return (
      <li key={v4()}>
        <Link
          to={parseLink ? parseLink : "#"}
          onClick={() => this.handleProductClick(product)}
        >
          <div block="SearchProduct">
            <Image
              lazyLoad={true}
              src={thumbnail_url}
              alt={ name ? name : "Product Image"}
              block="SearchProduct"
              elem="Image"
            />

            <div block="SearchProduct" elem="Info">
              <h6 block="SearchProduct" elem="Brand">
                {brand_name}
              </h6>
              <span block="SearchProduct" title={name} elem="ProductName">
                {name}
              </span>
              {this.renderPrice(price)}
            </div>
          </div>
        </Link>
      </li>
    );
  };

  renderProducts() {
    const { products = [] } = this.props;
    return (
      <div block="SearchSuggestion" elem="Recommended">
        {/* <h2>{__("Trending Products")}</h2> */}
        <ul>{products.map(this.renderProduct)}</ul>
      </div>
    );
  }

  renderSuggestions() {
    const { products = [],querySuggestions, suggestionEnabled = false } = this.props;
    let isRecommended = products.length === 0 && querySuggestions.length === 1;
    return (
      <>
        {suggestionEnabled ? this.renderQuerySuggestions(): null}
        {/* {this.renderBrands()} */}
        {/* {this.renderWishlistProducts()} */}
        {this.renderProducts()}
        {isRecommended && this.renderRecommendedForYou()}
      </>
    );
  }

  renderNothingFound() {
    const { searchString } = this.props;
    return (
      <>
        <div block="NothingFound">
          <p>
            {__("No result found for")} &nbsp;
            <span>{searchString}</span>
            {__(" but here are few suggestions")}
          </p>
        </div>
        {this.renderRecentSearches()}
        {/* {this.renderTopSearches()} */}
        {this.renderTrendingBrands()}
        {this.renderRecommendedForYou()}
        {/* {this.renderTrendingProducts()} */}
        {this.renderTrendingTags()}
      </>
    );
  }

  // recommended for you

  renderRecommendedForYou = () => {
    const { recommendedForYou, renderMySignInPopup } = this.props;
    const sku =
      localStorage.getItem("PRODUCT_SKU") !== "undefined"
        ? JSON.parse(localStorage.getItem("PRODUCT_SKU"))
        : null;
    const sourceCatgID =
      localStorage.getItem("PRODUCT_CATEGORY") !== "undefined"
        ? JSON.parse(localStorage.getItem("PRODUCT_CATEGORY"))
        : null;
    if (recommendedForYou && recommendedForYou.length > 0) {
      return (
        <div className="recommendedForYouSliderBox">
          <RecommendedForYouVueSliderContainer
            renderMySignInPopup={renderMySignInPopup}
            widgetID="vue_trending_slider"
            products={recommendedForYou}
            heading={__("Recommended for you")}
            key={`DynamicContentVueProductSliderContainer99`}
            pageType="search"
            sourceProdID={sku ? sku : null}
            sourceCatgID={sourceCatgID ? sourceCatgID : null}
          />
        </div>
      );
    }
  };

  renderTrendingProducts = () => {
    const { trendingProducts } = this.props;
    if (trendingProducts && trendingProducts.length > 0) {
      return (
        <div className="recommendedForYouSliderBox">
          <TrendingProductsVueSliderContainer
            widgetID="vue_trending_slider"
            products={trendingProducts}
            isHome={true}
            heading={__("Trending products")}
            key={`TrendingProductsVueSliderContainer`}
          />
        </div>
      );
    }
  };

  // renderWishlistProducts = () => {
  //   const { wishlistData, searchString } = this.props;
  //   if (wishlistData && wishlistData.length > 0) {
  //     let filteredWishlist =
  //       wishlistData.filter(
  //         (item) =>
  //           item.product.brand_name
  //             .toUpperCase()
  //             .includes(searchString.toUpperCase()) ||
  //           item.product.name
  //             .toUpperCase()
  //             .includes(searchString.toUpperCase()) ||
  //           item.product.sku.toUpperCase().includes(searchString.toUpperCase())
  //       ) || [];
  //     return (
  //       <div className="wishlistSliderContainer">
  //         <WishlistSliderContainer
  //           products={
  //             searchString && filteredWishlist.length > 0
  //               ? filteredWishlist
  //               : wishlistData
  //           }
  //           heading={__("Your Wishlist")}
  //           key={`Wishlist`}
  //           isHome={true}
  //         />
  //       </div>
  //     );
  //   }
  // };

  renderTrendingBrand = (brand, i) => {
    const { label = "", image_url, link = "" } = brand;
    const { isArabic } = this.state;
    // const urlName = label
    //   .replace("&", "")
    //   .replace(/'/g, "")
    //   .replace(/(\s+)|--/g, "-")
    //   .replace("@", "at")
    //   .toLowerCase();
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";

    let requestedGender = gender;
    let genderInURL;
    if (isArabic) {
      if (gender === "kids") {
        genderInURL = "أولاد,بنات";
        // to add Boy~Girl in arabic
      } else if (gender === "all") {
        genderInURL = "أولاد,بنات,نساء,رجال";
      } else {
        if (gender !== "home") {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    } else {
      if (gender === "kids") {
        genderInURL = "Boy,Girl";
      } else if (gender === "all") {
        genderInURL = "Boy,Girl,Men,Women,Kids";
      } else {
        if (gender !== "home") {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    }

    return (
      <li key={i}>
        <Link
          to={{
            pathname: link
              ? `${link}`
              : `/catalogsearch/result/?q=${encodeURIComponent(
                  label
                )}&p=0&dFR[gender][0]=${genderInURL}`,
          }}
          onClick={() => this.handleTrendingBrandsClick(label)}
        >
          <div block="SearchSuggestion" elem="TrandingImg">
            <Image lazyLoad={true} src={image_url} alt="Trending" />

            {/* {label} */}
          </div>
        </Link>
        <div block="CircleSliderLabel">{label}</div>
      </li>
    );
  };

  renderTrendingBrands() {
    const { trendingBrands = [] } = this.props;
    const { isArabic } = this.state;

    return trendingBrands.length > 0 ? (
      <div block="TrandingBrands">
        <h2>{__("Trending brands")}</h2>
        <DragScroll data={{ rootClass: "TrandingBrands", ref: this.ref }}>
        <ul id="TrandingBrands" block="TrandingBrands" elem="trendingBrandList" mods={{ isArabic }} ref={this.ref}>
          {trendingBrands.map(this.renderTrendingBrand)}
        </ul>
        </DragScroll>
      </div>
    ) : null;
  }

  renderTrendingTag = ({ link, label }, i) => (
    <li key={i}>
      <Link
        to={{
          pathname: link && link.split("#q")[0],
        }}
        onClick={() => this.handleTrendingTagsClick(label)}
      >
        <div block="SearchSuggestion" elem="TrandingTag">
          {label}
        </div>
      </Link>
    </li>
  );

  renderTrendingTags() {
    const { trendingTags = [] } = this.props;
    const { isArabic } = this.state;
    return trendingTags.length > 0 ? (
      <div block="TrandingTags">
        <h2>{__("Trending tags")}</h2>
        <ul block="TrandingTags" elem="trendingTagsList" mods={{ isArabic }}>
          {trendingTags.map(this.renderTrendingTag)}
        </ul>
      </div>
    ) : null;
  }

  renderTopSearch = ({ search, link }, i) => {
    const { isArabic } = this.state;
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";

    let requestedGender = gender;
    let genderInURL;
    if (isArabic) {
      if (gender === "kids") {
        genderInURL = "أولاد,بنات";
        // to add Boy~Girl in arabic
      } else if (gender === "all") {
        genderInURL = "أولاد,بنات,نساء,رجال";
      } else {
        if (gender !== "home") {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    } else {
      if (gender === "kids") {
        genderInURL = "Boy,Girl";
      } else if (gender === "all") {
        genderInURL = "Boy,Girl,Men,Women,Kids";
      } else {
        if (gender !== "home") {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    }
    return (
      <li key={i}>
        <Link
          to={{
            pathname: link
              ? link
              : `/catalogsearch/result/?q=${encodeURIComponent(
                  search
                )}&p=0&dFR[gender][0]=${genderInURL}`,
          }}
          onClick={() => {
            Event.dispatch(EVENT_CLICK_TOP_SEARCHES_CLICK, search);
            Moengage.track_event(EVENT_CLICK_TOP_SEARCHES_CLICK, {
              country: getCountryFromUrl().toUpperCase(),
              language: getLanguageFromUrl().toUpperCase(),
              search_term: search || "",
              app6thstreet_platform: "Web",
            });
          }}
        >
          <div block="SearchSuggestion" elem="TopSearches">
            {search}
          </div>
        </Link>
      </li>
    );
  };

  /*
  renderTopSearches() {
    const { topSearches = [] } = this.props;
    const { isArabic } = this.state;
    return topSearches.length > 0 ? (
      <div block="TopSearches">
        <h2>{__("Top searches")}</h2>
        <ul block="TopSearches" elem="searchList" mods={{ isArabic }}>
          {topSearches.map(this.renderTopSearch)}
        </ul>
      </div>
    ) : null;
  }
  */

  // recent searches

  renderRecentSearch = ({ name, link }, i) => {
    const { isArabic } = this.state;
    const gender =
      BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender === "all"
        ? "Men,Women,Kids,Boy,Girl"
        : BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
        : "home";

    let requestedGender = gender;
    let genderInURL;
    if (isArabic) {
      if (gender === "kids") {
        genderInURL = "أولاد,بنات";
        // to add Boy~Girl in arabic
      } else if (gender === "all") {
        genderInURL = "أولاد,بنات,نساء,رجال";
      } else {
        if (gender !== "home") {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    } else {
      if (gender === "kids") {
        genderInURL = "Boy,Girl";
      } else if (gender === "all") {
        genderInURL = "Boy,Girl,Men,Women,Kids";
      } else {
        if (gender !== "home") {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        } else {
          genderInURL = "";
        }
      }
    }
    return (
      <li key={i}>
        <Link
          to={
            link
              ? link
              : `/catalogsearch/result/?q=${encodeURIComponent(
                  name
                )}&p=0&dFR[gender][0]=${genderInURL}`
          }
          onClick={() => {
            Event.dispatch(EVENT_CLICK_RECENT_SEARCHES_CLICK, name);
            Moengage.track_event(EVENT_CLICK_RECENT_SEARCHES_CLICK, {
              country: getCountryFromUrl().toUpperCase(),
              language: getLanguageFromUrl().toUpperCase(),
              search_term: name || "",
              app6thstreet_platform: "Web",
            });
          }}
        >
          <div block="SearchSuggestion" elem="TrandingTag">
            #{name}
          </div>
        </Link>
      </li>
    );
  };

  renderRecentSearches() {
    const { recentSearches = [] } = this.props;
    const { isArabic } = this.state;
    return recentSearches.length > 0 ? (
      <div block="RecentSearches">
        <h2>{__("Recent searches")}</h2>
        <ul block="RecentSearches" elem="searchList" mods={{ isArabic }}>
          {recentSearches.map(this.renderRecentSearch)}
        </ul>
      </div>
    ) : null;
  }

  renderExploreMore = () => {
    let a = this.props.exploreMoreData;
    if (a) {
      return <ExploreMore data={this.props.exploreMoreData} />;
    }
  };

  renderEmptySearch() {
    return (
      <>
        {this.renderRecentSearches()}
        {/* {this.renderTopSearches()} */}
        {this.renderTrendingBrands()}
        {this.renderExploreMore()}
        {this.renderRecommendedForYou()}
        {/* {this.renderTrendingProducts()} */}
        {/* {this.renderWishlistProducts()} */}
        {/* {this.renderTrendingTags()} */}
      </>
    );
  }

  renderContent() {
    const {
      isActive,
      isEmpty,
      inNothingFound,
      querySuggestions = [],
      searchString,
    } = this.props;

    if (!isActive) {
      return null;
    }
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";

    if (gender === "home" && querySuggestions.length === 0) {
      return null;
    }
    if (isEmpty) {
      return this.renderEmptySearch();
    }

    if (inNothingFound && querySuggestions.length === 0) {
      return this.renderNothingFound();
    }
    if (searchString.length > 2) {
      return this.renderSuggestions();
    } else {
      return this.renderEmptySearch();
    }
  }

  renderCloseButton() {
    const { closeSearch } = this.props;
    const { isArabic, isMobile } = this.state;
    if (!isMobile) {
      return null;
    }
    const svg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 -1 26 26"
      >
        <path
          d="M23.954 21.03l-9.184-9.095 9.092-9.174-1.832-1.807-9.09 9.179-9.176-9.088-1.81
                  1.81 9.186 9.105-9.095 9.184 1.81 1.81 9.112-9.192 9.18 9.1z"
        />
      </svg>
    );

    return (
      <div block="SearchSuggestion" elem="CloseContainer" mods={{ isArabic }}>
        <button
          block="CloseContainer"
          elem="Close"
          mods={{ isArabic }}
          onClick={closeSearch}
        >
          Cancel
          {/* {svg} */}
        </button>
      </div>
    );
  }

  render() {
    const { isPDPSearchVisible, suggestionEnabled } = this.props;
    const { isArabic } = this.state;
    // const { isPDPSearchVisible } = this.props;
    return (
      <div block="SearchSuggestion" mods={{ isArabic }}>
        <div
          block="SearchSuggestion"
          elem="Content"
          mods={{ isPDPSearchVisible }}
        >
          {/* {this.renderCloseButton()} */}
          {/* {this.renderLoader()} */}
          {this.renderContent()}
        </div>
        <div block="SearchSuggestion" elem="ShadeWrapper">
          <div block="SearchSuggestion" elem="Shade" />
        </div>
      </div>
    );
  }
}

export default withRouter(SearchSuggestion);
