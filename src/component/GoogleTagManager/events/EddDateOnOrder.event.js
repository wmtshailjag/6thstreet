/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_EDD_TRACK_ON_ORDER } from "Util/Event";

import BaseEvent from "./Base.event";

export const SPAM_PROTECTION_DELAY = 200;

/**
 * Product add to cart event
 */
class EddTrackOnOrderEvent extends BaseEvent {
  /**
   * Bind add to cart
   */
  bindEvent() {
    Event.observer(EVENT_GTM_EDD_TRACK_ON_ORDER, ({ edd_date }) => {
      this.handle(edd_date);
    });
  }

  /**
   * Handle product add to cart
   */
  handler(edd_date) {
    if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
      return;
    }

    this.pushEventData({
      ecommerce: {
        edd_date: edd_date,
      },
    });
  }
}

export default EddTrackOnOrderEvent;
