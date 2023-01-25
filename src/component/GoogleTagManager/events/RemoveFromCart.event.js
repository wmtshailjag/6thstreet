/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_PRODUCT_REMOVE_FROM_CART } from 'Util/Event';

import BaseEvent from './Base.event';

export const SPAM_PROTECTION_DELAY = 200;
/**
 * Product remove from cart
 */
class RemoveFromCartEvent extends BaseEvent {
    /**
     * Bind remove from cart
     */
    bindEvent() {
        Event.observer(EVENT_GTM_PRODUCT_REMOVE_FROM_CART, ({
            product
        }) => {
            this.handle(product);
        });
    }

    /**
     * Handle product remove from cart
     */
    handler(product) {
        if (this.spamProtection(SPAM_PROTECTION_DELAY)) {
            return;
        }

        this.pushEventData({
            ecommerce: {
                currencyCode: this.getCurrencyCode(),
                remove: {
                    products: [product]
                }
            }
        });
    }
}

export default RemoveFromCartEvent;
