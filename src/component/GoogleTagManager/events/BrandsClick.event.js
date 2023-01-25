/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_BRANDS_CLICK } from "Util/Event";
import BaseEvent from "./Base.event";

/**
 * Brands click event
 */
class BrandsClickEvent extends BaseEvent {
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
    Event.observer(EVENT_GTM_BRANDS_CLICK, (brands) => {
      this.handle(brands);
    });
  }

  /**
   * Handle brands click
   */
  handler(brands) {
    this.pushEventData({
      ecommerce: {
        click: {
          brands: brands,
        },
      },
    });
  }
}

export default BrandsClickEvent;
