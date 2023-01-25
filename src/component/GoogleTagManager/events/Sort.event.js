import Event, { EVENT_GTM_SORT } from "Util/Event";
import BaseEvent from "./Base.event";

/**
 * Website places, from where was received event data
 *
 * @type {string}
 */

/**
 * Constants
 *
 * @type {number}
 */
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;
export const URL_REWRITE = "url-rewrite";
/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class SortEvent extends BaseEvent {
  /**
   * Set base event call delay
   *
   * @type {number}
   */
  eventHandleDelay = EVENT_HANDLE_DELAY;

  /**
   * Bind PWA event handling
   */
  bindEvent() {
    Event.observer(EVENT_GTM_SORT, (data) => {
      this.handle(data);
    });
  }

  handler(data) {
    const sortEventAction =
      data == "sort_by_latest"
        ? "sort_by_latest_click"
        : data == "sort_by_discount"
        ? "sort_by_discount_click"
        : data == "sort_by_price_low"
        ? "sort_by_price_low_click"
        : data == "sort_by_price_high"
        ? "sort_by_price_high_click"
        : data == "sort_by_recommended"
        ? "sort_by_our_picks_click"
        : "plp_sort_click";
    this.pushEventData({
      event: data,
      eventCategory: "plp_sort",
      eventAction: sortEventAction,
      UserType:
        this.getCustomerId().toString().length > 0 ? "Logged In" : "Logged Out",
      CustomerID: this.getCustomerId(),
      PageType: this.getPageType(),
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

export default SortEvent;
