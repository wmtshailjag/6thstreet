import Event, { EVENT_GTM_FILTER } from "Util/Event";
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
class FilterEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_FILTER, (data) => {
      this.handle(data);
    });
  }

  handler(data) {
    const eventName = data.name;
    const eventValue = data.value ? data.value : "";
    const EventAction =
      eventName == "categories_without_path_search_filter"
        ? "categories_without_path_search_filter_click"
        : eventName == "brand_search_filter"
        ? "brand_search_filter_click"
        : eventName == "color_search_filter"
        ? "color_search_filter_click"
        : eventName;
    this.pushEventData({
      event: eventName,
      eventCategory: "plp_filter",
      eventAction: EventAction,
      ...(eventName == "categories_without_path_search_filter" && { selectCategory: eventValue }),
      ...(eventName == "categories_without_path_search_focus" && { categoryFocus: eventValue }),
      ...(eventName == "brand_search_filter" && { selectBrand: eventValue }),
      ...(eventName == "color_search_filter" && { selectColor: eventValue }),
      ...(eventName == "color_search_focus" && { colorFocus: eventValue }),
      ...(eventName == "price_filter_click" && { selectPrice: eventValue }),
      ...(eventName == "discount_filter_click" && { selectDiscount: eventValue }),
      ...(eventName == "sizes_search_filter" && { selectSize: eventValue }),
      ...(eventName == "set_preferences_gender" && { selectGender: eventValue }),
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

export default FilterEvent;
