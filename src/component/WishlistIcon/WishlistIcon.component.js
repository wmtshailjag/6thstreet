/* eslint-disable fp/no-let */
import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { PureComponent } from "react";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getUUID } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import Event, {
  EVENT_GTM_PRODUCT_ADD_TO_WISHLIST,
  EVENT_GTM_PRODUCT_REMOVE_FROM_WISHLIST,
  VUE_ADD_TO_WISHLIST,
  VUE_REMOVE_TO_WISHLIST,
  EVENT_CLICK_SEARCH_WISH_LIST_CLICK,
  EVENT_MOE_ADD_TO_WISHLIST,
  EVENT_MOE_REMOVE_FROM_WISHLIST,
} from "Util/Event";
import { Favourite, FavouriteFilled } from "../Icons";
import "./WishlistIcon.style";
import { isSignedIn } from "Util/Auth";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class WishlistIcon extends PureComponent {
  static propTypes = {
    sku: PropTypes.string.isRequired,
    removeFromWishlist: PropTypes.func.isRequired,
    addToWishlist: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
    pageType: PropTypes.string.isRequired,
  };

  state = {
    skuFromProps: "",
  };

  static getDerivedStateFromProps(props) {
    const { sku } = props;

    return {
      skuFromProps: sku,
    };
  }

  handleClick = () => {
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender;
    const {
      addToWishlist,
      removeFromWishlist,
      items,
      data,
      pageType,
      renderMySignInPopup,
      swipeWishlist = false,
    } = this.props;
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    const { skuFromProps } = this.state;
    const wishListItem = items.find(
      ({ product: { sku } }) => sku === skuFromProps
    );
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    if (wishListItem) {
      const { wishlist_item_id, product } = wishListItem;
      //removeFromWishlist(wishlist_item_id);
      if (swipeWishlist) {
        renderMySignInPopup();
      } else {
        removeFromWishlist(wishlist_item_id);
      }
      Event.dispatch(EVENT_GTM_PRODUCT_REMOVE_FROM_WISHLIST, {
        product: {
          brand: wishListItem.product.brand_name,
          category: "",
          id: wishListItem.product.sku,
          name: wishListItem.product.name,
          price: wishListItem.product.price,
          variant: wishListItem.product.color,
        },
      });
      const prodPriceObject = wishListItem?.product?.price[0];
      const prodPrice = prodPriceObject
        ? prodPriceObject[Object.keys(prodPriceObject)[0]]["6s_base_price"]
        : "";
      const itemPrice = prodPriceObject
        ? prodPriceObject[Object.keys(prodPriceObject)[0]]["6s_special_price"]
        : "";
      Moengage.track_event(EVENT_MOE_REMOVE_FROM_WISHLIST, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        category: currentAppState.gender
          ? currentAppState.gender.toUpperCase()
          : "",
        brand_name: wishListItem.product?.brand_name || "",
        full_price: prodPrice || "",
        product_url: wishListItem.product?.url || "",
        currency: getCurrency() || "",
        gender: currentAppState.gender
          ? currentAppState.gender.toUpperCase()
          : gender
          ? gender
          : "",
        product_sku: wishListItem.product?.sku || "",
        discounted_price: itemPrice || "",
        product_image_url: wishListItem.product?.thumbnail_url || "",
        product_name: wishListItem.product?.name || "",
        app6thstreet_platform: "Web",
        // subcategory: Yet to add,
        // color: Yet to add,
      });

      if (userID) {
        // to do add 6s_special_price when we get response from backend.
        VueIntegrationQueries.vueAnalayticsLogger({
          event_name: VUE_REMOVE_TO_WISHLIST,
          params: {
            event: VUE_REMOVE_TO_WISHLIST,
            pageType: pageType,
            currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
            clicked: Date.now(),
            prodPrice: prodPrice,
            sourceCatgID: gender,
            sourceProdID: skuFromProps,
            uuid: getUUID(),
            referrer: window.location.href,
            url: product.url ? product.url : null,
            userID: userID,
          },
        });
      }
      return;
    }
    if (isSignedIn()) {
      if (swipeWishlist) {
        renderMySignInPopup();
      }
      addToWishlist(skuFromProps);
    } else {
      localStorage.setItem("Wishlist_Item", skuFromProps);
      renderMySignInPopup();
    }
    // Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_WISHLIST, { product: data });
    const priceObject = data.price[0];
    const itemPrice = priceObject
      ? priceObject[Object.keys(priceObject)[0]]["6s_special_price"]
      : "";
    const basePrice = priceObject
      ? priceObject[Object.keys(priceObject)[0]]["6s_base_price"]
      : "";
    if (pageType == "search") {
      Event.dispatch(EVENT_CLICK_SEARCH_WISH_LIST_CLICK, data?.name);
      Moengage.track_event(EVENT_CLICK_SEARCH_WISH_LIST_CLICK, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        category: currentAppState.gender
          ? currentAppState.gender.toUpperCase()
          : "",
        search_term: data?.name || "",
        app6thstreet_platform: "Web",
      });
    } else {
      Event.dispatch(EVENT_GTM_PRODUCT_ADD_TO_WISHLIST, {
        product: {
          brand: data.brand_name,
          category: gender,
          id: skuFromProps,
          name: data.name,
          price: itemPrice,
          variant: data.color,
        },
      });
    }
    const windowLocation= new URL(window.location.href);
    const parseProductUrl = windowLocation + data?.url_key + ".html";

    Moengage.track_event(EVENT_MOE_ADD_TO_WISHLIST, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      subcategory: data.product_type_6s || "",
      color: data.color || "",
      brand_name: data.brand_name || "",
      full_price: basePrice || data?.original_price ||"",
      product_url: data?.url && data?.url !== null ? data.url : parseProductUrl || "",
      currency: getCurrency() || "",
      gender: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : gender
        ? gender
        : "",
      product_sku: data.config_sku || data.sku ||"",
      discounted_price: itemPrice || data?.itemPrice || "",
      product_image_url: data?.thumbnail_url || "",
      product_name: data?.name || "",
      app6thstreet_platform: "Web",
    });
    if (userID) {
      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_ADD_TO_WISHLIST,
        params: {
          event: VUE_ADD_TO_WISHLIST,
          pageType: pageType,
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          prodPrice: itemPrice,
          sourceCatgID: gender,
          sourceProdID: skuFromProps,
          uuid: getUUID(),
          referrer: window.location.href,
          url: data.url ? data.url : null,
          userID: userID,
        },
      });
    }
  };

  isBlack = (item) => {
    const { skuFromProps } = this.state;
    const {
      product: { sku: wishlistSku },
    } = item;

    return skuFromProps === wishlistSku;
  };

  renderIcon() {
    const { items = [] } = this.props;
    const blackMod = items.some(this.isBlack);

    return (
      <button
        block="WishlistIcon"
        elem="Icon"
        aria-label="Wishlist"
        onClick={this.handleClick}
      >
        {blackMod ? <FavouriteFilled /> : <Favourite />}
      </button>
    );
  }

  render() {
    return (
      <div block="WishlistIcon" mods={{ isArabic: isArabic() }}>
        {this.renderIcon()}
      </div>
    );
  }
}

export default WishlistIcon;
