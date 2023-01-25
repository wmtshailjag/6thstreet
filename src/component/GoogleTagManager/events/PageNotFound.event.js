import Event, { EVENT_PAGE_NOT_FOUND } from "Util/Event";

import BaseEvent from "./Base.event";

/**
 * Website places, from where was received event data
 *
 * @type {string}
 */
//export const HOME_PAGE_BANNER_IMPRESSIONS = "HOME_PAGE_BANNER_IMPRESSIONS";

/**
 * Constants
 *
 * @type {number}
 */
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;

class PageNotFoundEvent extends BaseEvent {
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
    Event.observer(EVENT_PAGE_NOT_FOUND, (url) => {
      this.handle(EVENT_PAGE_NOT_FOUND, url);
    });
  }
  handler(EVENT_TYPE, url) {
    this.pushEventData({
      event: EVENT_TYPE,
      ecommerce: {
        url: url,
      },
    });
  }
}

export default PageNotFoundEvent;
