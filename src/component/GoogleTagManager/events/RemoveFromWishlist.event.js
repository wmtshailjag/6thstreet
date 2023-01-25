/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_PRODUCT_REMOVE_FROM_WISHLIST } from "Util/Event";
import BaseEvent from "./Base.event";

export const SPAM_PROTECTION_DELAY = 200;
/**
 * Product remove from wishlist
 */
class RemoveFromWishlistEvent extends BaseEvent {
  /**
   * Bind remove from wishlist
   */
  bindEvent() {
    Event.observer(EVENT_GTM_PRODUCT_REMOVE_FROM_WISHLIST, ({ product }) => {
      this.handle(product);
    });
  }

  /**
   * Handle product remove from wishlist
   */
  handler(product) {
    if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
      return;
    }

    this.pushEventData({
      ecommerce: {
        currencyCode: this.getCurrencyCode(),
        remove: {
          products: [product],
        },
      },
    });
  }
}

export default RemoveFromWishlistEvent;
