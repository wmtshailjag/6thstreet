/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_EDD_VISIBILITY } from "Util/Event";

import BaseEvent from "./Base.event";

export const SPAM_PROTECTION_DELAY = 200;

/**
 * Product add to cart event
 */
class EddVisibilityEvent extends BaseEvent {
  /**
   * Bind add to cart
   */
  bindEvent() {
    Event.observer(EVENT_GTM_EDD_VISIBILITY, ({ edd_details, page }) => {
      this.handle(edd_details, page);
    });
  }

  /**
   * Handle product add to cart
   */
  handler(edd_details, page) {
    if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
      return;
    }

    this.pushEventData({
      ecommerce: {
        edd_details,
        page,
      },
    });
  }
}

export default EddVisibilityEvent;
