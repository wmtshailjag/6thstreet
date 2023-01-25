import Event, { EVENT_GTM_TOP_NAV_CLICK } from "Util/Event";
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
class TopNavigationEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_TOP_NAV_CLICK, (data) => {
      this.handle(data);
    });
  }

  handler(data) {
    if (typeof data === "object" && data.name) {
      this.pushEventData({
        event: data.name,
        eventCategory: data.name,
        eventAction: "language_change_click",
        languageChange: data.value ? data.value : "",
        UserType:
          this.getCustomerId().toString().length > 0
            ? "Logged In"
            : "Logged Out",
        CustomerID: this.getCustomerId(),
        PageType: this.getPageType(),
      });
    } else {
      this.pushEventData({
        event: data,
        eventCategory: "top_navigation_menu",
        eventAction: data + "_click",
        UserType:
          this.getCustomerId().toString().length > 0
            ? "Logged In"
            : "Logged Out",
        CustomerID: this.getCustomerId(),
        PageType: this.getPageType(),
      });
    }
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

export default TopNavigationEvent;
