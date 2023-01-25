import Event, {
  EVENT_PROMOTION_IMPRESSION,
  EVENT_CLICK_PROMOTION_IMPRESSION,
  EVENT_MOE_PROMOTION_IMPRESSION,
  EVENT_MOE_PROMOTION_CLICK
} from "Util/Event";
import BrowserDatabase from "Util/BrowserDatabase";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import BaseEvent from "./Base.event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

/**
 * Website places, from where was received event data
 *
 * @type {string}
 */
export const HOME_PAGE_BANNER_IMPRESSIONS = "HOME_PAGE_BANNER_IMPRESSIONS";
export const HOME_PAGE_BANNER_CLICK_IMPRESSIONS =
  "HOME_PAGE_BANNER_CLICK_IMPRESSIONS";

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
class BannerImpressionEvent extends BaseEvent {
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
    // Home
    Event.observer(HOME_PAGE_BANNER_IMPRESSIONS, (impression) => {
      if (document.readyState == ("complete" || "interactive")) {
        this.handle(EVENT_PROMOTION_IMPRESSION, impression, "promoView");
      }
    });
    Event.observer(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, (impression) => {
      this.handle(EVENT_CLICK_PROMOTION_IMPRESSION, impression, "promoClick");
    });
  }

  /**
   * Handle Impressions
   *
   * @param eventName Unique event id
   * @param impressions banner list
   */
  handler(EVENT_TYPE, impressions = [], promo_key = "promoView") {
    const storage = this.getStorage();
    // if (
    //   !impressions ||
    //   impressions.length === 0 ||
    //   this.spamProtection(SPAM_PROTECTION_DELAY)
    // ) {
    //   console.log("impression not recorded", EVENT_TYPE, impressions);
    //   return;
    // }
    const formattedImpressions = impressions.map(
      ({ label, promotion_name, id, store_code, tag, indexValue }, index) => ({
        id: id ? id : promotion_name ? promotion_name.split(" ").join("-") : "",
        name: (store_code ? store_code + "-" : "") + (label || promotion_name),
        creative: tag || promotion_name || "",
        position: indexValue ? indexValue : index + 1,
      })
    );

    let promoName = [], promoID = [], promoIndex = [];

    formattedImpressions.forEach((item) => {
      promoName.push(item?.name);
      promoID.push(item?.id);
      promoIndex.push(item?.position);
    });
    
    storage.impressions = formattedImpressions;
    this.setStorage(storage);
    this.pushEventData({
      event: EVENT_TYPE,
      ecommerce: {
        [promo_key]: {
          promotions: formattedImpressions,
        },
      },
    });
    const MoeEventType =
      EVENT_TYPE == "promotionImpression"
        ? EVENT_MOE_PROMOTION_IMPRESSION
        : EVENT_TYPE == "promotionClick"
          ? EVENT_MOE_PROMOTION_CLICK
          : null;
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    const currentPageType = this.getPageType() || "";

    if (document.readyState == ("complete" || "interactive")) {
      Moengage.track_event(MoeEventType, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        promotion_id: promoID.length == 1 ? promoID.toString() : promoID,
        promotion_name: promoName.length == 1 ? promoName.toString() : promoName,
        index: promoIndex.length == 1 ? promoIndex.toString() : promoIndex,
        category_name: currentAppState.gender
          ? currentAppState.gender.toUpperCase()
          : "",
        screen_name: currentPageType,
        app6thstreet_platform: "Web",
      });
    }
  }
}

export default BannerImpressionEvent;
