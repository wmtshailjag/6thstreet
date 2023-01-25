/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_PRODUCT_ADD_TO_CART } from "Util/Event";
import BrowserDatabase from "Util/BrowserDatabase";
import BaseEvent from "./Base.event";

export const SPAM_PROTECTION_DELAY = 200;

/**
 * Product add to cart event
 */
class AddToCartEvent extends BaseEvent {
  /**
   * Bind add to cart
   */
  bindEvent() {
    Event.observer(EVENT_GTM_PRODUCT_ADD_TO_CART, ({ product }) => {
      this.handle(product);
    });
  }

  /**
   * Handle product add to cart
   */
  handler(product) {
    if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
      return;
    }
    const sha_email =
      BrowserDatabase.getItem("TT_Data") &&
      BrowserDatabase.getItem("TT_Data")?.mail
        ? BrowserDatabase.getItem("TT_Data").mail
        : null;
    const sha_phone =
      BrowserDatabase.getItem("TT_Data") &&
      BrowserDatabase.getItem("TT_Data")?.phone
        ? BrowserDatabase.getItem("TT_Data").phone
        : null;
    this.pushEventData({
      sha256_email: sha_email,
      sha256_phone_number: sha_phone,
      ecommerce: {
        currencyCode: this.getCurrencyCode(),
        add: {
          products: [product],
        },
      },
    });
  }
}

export default AddToCartEvent;
