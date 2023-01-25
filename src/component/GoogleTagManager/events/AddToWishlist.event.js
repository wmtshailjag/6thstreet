/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_PRODUCT_ADD_TO_WISHLIST } from "Util/Event";
import BaseEvent from "./Base.event";

export const SPAM_PROTECTION_DELAY = 200;

/**
 * Product add to wishlist
 */
class AddToWishlistEvent extends BaseEvent {
  /**
   * Bind add to wishlist
   */
  bindEvent() {
    Event.observer(EVENT_GTM_PRODUCT_ADD_TO_WISHLIST, ({ product }) => {
      this.handle(product);
    });
  }

  /**
   * Handle product add to wishlist
   */
  handler(product) {
    if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
      return;
    }

    this.pushEventData({
      ecommerce: {
        currencyCode: this.getCurrencyCode(),
        add_wishlist: {
          products: [product],
        },
      },
    });
  }
}

export default AddToWishlistEvent;
