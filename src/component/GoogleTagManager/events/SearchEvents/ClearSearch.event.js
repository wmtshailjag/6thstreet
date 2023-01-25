import Event, {
  EVENT_GTM_CLEAR_SEARCH, // Done
} from "Util/Event";

import BaseEvent from "../Base.event";

/**
 * Constants
 *
 * @type {number}
 */
export const URL_REWRITE = "url-rewrite";
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;

/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class ClearSearchEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_CLEAR_SEARCH, (search) => {
      this.handle(EVENT_GTM_CLEAR_SEARCH,search );
    });
  }

  handler(EVENT_TYPE, search) {
    this.pushEventData({
      event: EVENT_TYPE,
      eventCategory: "search",
      eventAction: EVENT_TYPE,
      UserType: this.getCustomerId().toString().length > 0 ? "Logged In" : "Logged Out",
      CustomerID: this.getCustomerId(),
      PageType: this.getPageType(),
      SearchTerm: search || "",
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

export default ClearSearchEvent;
