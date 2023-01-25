import Event, {
  EVENT_GTM_CANCEL_SEARCH, // Done
  EVENT_GTM_CLEAR_SEARCH, // Done
  EVENT_GTM_GO_TO_SEARCH, // Done
  EVENT_CLICK_SEARCH_QUERY_SUGGESSTION_CLICK, // Done
  EVENT_CLICK_SEARCH_WISH_LIST_CLICK,
  EVENT_GTM_VIEW_SEARCH_RESULTS,
  EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW,
  EVENT_CLICK_RECENT_SEARCHES_CLICK, // Done
  EVENT_EXPLORE_MORE_SEARCH_CLICK,
  EVENT_GTM_SEARCH_LOGS_SCREEN_VIEW,
  EVENT_GTM_SEARCH_SCREEN_VIEW,
  EVENT_CLICK_TOP_SEARCHES_CLICK, // Done
  EVENT_CLICK_RECOMMENDATION_CLICK, // Done
} from "Util/Event";

import BaseEvent from "./Base.event";

/**
 * Constants
 *
 * @type {number}
 */
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;

/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class SearchEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_VIEW_SEARCH_RESULTS, () => {
      this.handle(EVENT_GTM_VIEW_SEARCH_RESULTS);
    });
    Event.observer(EVENT_GTM_SEARCH_LOGS_SCREEN_VIEW, () => {
      this.handle(EVENT_GTM_SEARCH_LOGS_SCREEN_VIEW);
    });
    Event.observer(EVENT_GTM_SEARCH_SCREEN_VIEW, () => {
      this.handle(EVENT_GTM_SEARCH_SCREEN_VIEW);
    });
  }

  handler(EVENT_TYPE) {
    this.pushEventData({
      event: EVENT_TYPE,
    });
  }
}

export default SearchEvent;
