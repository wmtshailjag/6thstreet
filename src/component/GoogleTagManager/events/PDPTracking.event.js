import Event, { EVENT_GTM_PDP_TRACKING } from "Util/Event";
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
class PDPTrackingEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_PDP_TRACKING, (data) => {
      this.handle(data);
    });
  }

  handler(data) {
    const eventName = data.name;
    const EventAction = data.action ? data.action : eventName;
    this.pushEventData({
      event: eventName,
      eventCategory: "pdp_tracking",
      eventAction: EventAction,
      ...(data.product_id && { productId: data.product_id }),
      ...(data.product_name && { productName: data.product_name }),
      ...(data.stockStatus && { stockStatus: data.stockStatus }),
      ...(data.size_type && { size_type: data.size_type }),
      ...(data.size_value && { size_type: data.size_value }),
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

export default PDPTrackingEvent;
