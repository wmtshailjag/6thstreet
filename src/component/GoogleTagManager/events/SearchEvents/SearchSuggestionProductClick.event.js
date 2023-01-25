import Event, {
  EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK, // Done
} from "Util/Event";

import BaseEvent from "../Base.event";

/**
 * Constants
 *
 * @type {number}
 */
export const URL_REWRITE = "url-rewrite";
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 200;

/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class SearchSuggestionProductClickEvent extends BaseEvent {
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
    Event.observer(EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK, (product) => {
      this.handle(EVENT_SEARCH_SUGGESTION_PRODUCT_CLICK, product);
    });
  }

  handler(EVENT_TYPE, product) {
    this.pushEventData({
      event: EVENT_TYPE,
      eventCategory: "search",
      eventAction: "'search result",
      UserType: this.getCustomerId().toString().length > 0 ? "Logged In" : "Logged Out",
      CustomerID: this.getCustomerId(),
      PageType: this.getPageType(),
      SearchTerm: product || "",
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

export default SearchSuggestionProductClickEvent;
