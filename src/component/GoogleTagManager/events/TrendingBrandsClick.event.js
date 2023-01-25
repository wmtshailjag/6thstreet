/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_TRENDING_BRANDS_CLICK } from "Util/Event";
import BaseEvent from "./Base.event";

/**
 * Trending brands click event
 */

export const URL_REWRITE = "url-rewrite";
class TrendingBrandsClickEvent extends BaseEvent {
  /**
   * Set delay
   *
   * @type {number}
   */
  eventHandleDelay = 0;

  /**
   * Bind click events
   */
  bindEvent() {
    Event.observer(EVENT_GTM_TRENDING_BRANDS_CLICK, (trendingBrands) => {
      this.handle(trendingBrands);
    });
  }

  /**
   * Handle trending brands click
   */
  handler(trendingBrands) {
    this.pushEventData({
      event: "trending_brand_click",
      eventCategory: "search",
      eventAction: "trending_brand_click",
      UserType: this.getCustomerId().toString().length > 0 ? "Logged In" : "Logged Out",
      CustomerID: this.getCustomerId(),
      PageType: this.getPageType(),
      SearchTerm: trendingBrands || "",
      ecommerce: {
        click: {
          trendingBrands: trendingBrands,
        },
      },
    });
  }
  getCustomerId() {
    return this.isSignedIn()
      ? this.getAppState().MyAccountReducer.customer.id || ""
      : "";
  }
  getPageType() {
    const { urlRewrite, currentRouteName } = window;

    if (currentRouteName === URL_REWRITE) {
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
}

export default TrendingBrandsClickEvent;
