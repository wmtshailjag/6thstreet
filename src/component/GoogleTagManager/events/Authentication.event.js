import Event, { EVENT_GTM_AUTHENTICATION } from "Util/Event";
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
export const EVENT_HANDLE_DELAY = 2000;
export const URL_REWRITE = "url-rewrite";
/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class AutheneticationEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_AUTHENTICATION, (data) => {
      this.handle(data);
    });
  }

  handler(data) {
    this.pushEventData({
      event: data.name,
      eventCategory: data.category ? data.category : data.name,
      eventAction: data.action ? data.action : data.name,
      ...(data.failReason && { failReason: data.failReason }),
      ...(data.loginMode && { loginMode: data.loginMode }),
      ...(data.attemptNumber && { attemptNumber: data.attemptNumber }),
      UserType:
        data.name == "login"
          ? "Logged In"
          : this.getCustomerId().toString().length > 0
          ? "Logged In"
          : "Logged Out",
      CustomerID: this.getCustomerId(),
      PageType: this.getPageType(),
      ClientID: this.getGAID(),
    });
  }

  getCustomerId() {
    return this.isSignedIn()
      ? this.getAppState().MyAccountReducer.customer.id || ""
      : "";
  }
  getGAID() {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_ga"))
      ?.split("=")[1];
    if (cookieValue) {
      const splitGAID = () => {
        if (cookieValue.includes(".")) {
          let cookieSplit = cookieValue.split(".");
          if (cookieSplit.length == 4) {
            return cookieSplit[2] + "." + cookieSplit[3];
          }
        } else if (cookieValue.includes("GA1.1.")) {
          return cookieValue.split("GA1.1.")[1];
        } else if (cookieValue.includes("GA1.2.")) {
          return cookieValue.split("GA1.2.")[1];
        } else if (cookieValue.includes("GA1.3.")) {
          return cookieValue.split("GA1.3.")[1];
        } else if (cookieValue.includes("GA1.3.")) {
          return cookieValue.split("GA1.4.")[1];
        } else {
          return cookieValue;
        }
      };
      return splitGAID();
    } else {
      return "";
    }
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

export default AutheneticationEvent;
