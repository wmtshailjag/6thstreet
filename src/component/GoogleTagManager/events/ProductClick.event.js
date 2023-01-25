/* eslint-disable import/no-cycle */
import Event, {
  EVENT_GTM_PRODUCT_CLICK,
  EVENT_GTM_VUE_PRODUCT_CLICK,
} from "Util/Event";

import { EVENT_IMPRESSION } from "../GoogleTagManager.component";
import ProductHelper from "../utils";
import BaseEvent from "./Base.event";

/**
 * Product click event
 */
class ProductClickEvent extends BaseEvent {
  /**
   * Set delay
   *
   * @type {number}
   */
  eventHandleDelay = 0;

  /**
   * Bind click events
   */
  bindEvent() {
    Event.observer(EVENT_GTM_PRODUCT_CLICK, (product) => {
      this.handle(product);
    });
    Event.observer(EVENT_GTM_VUE_PRODUCT_CLICK, (product) => {
      this.handle(product, true);
    });
  }

  /**
   * Handle product click
   */
  handler(product) {
    const {list} = this.getProductFromImpression(product) || {};

    this.pushEventData({
      ecommerce: {
        currencyCode: this.getCurrencyCode(),
        click: {
          products: [product],
        },
      },
    });
  }

  /**
   * Get product position in impression
   *
   * @return {*}
   * @param clickedProduct
   */
  getProductFromImpression(clickedProduct) {
    const { impressions = [] } = this.getStorage(EVENT_IMPRESSION);
    const id = ProductHelper.getSku(clickedProduct);

    const { sku } = clickedProduct;

    return impressions.find(
      ({ id: impressionId }) => impressionId === id || impressionId === sku
    );
  }
}

export default ProductClickEvent;
