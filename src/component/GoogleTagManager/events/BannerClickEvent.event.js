/* eslint-disable import/no-cycle */
import Event, { EVENT_GTM_BANNER_CLICK } from 'Util/Event';

import { EVENT_IMPRESSION } from '../GoogleTagManager.component';
import ProductHelper from '../utils';
import BaseEvent from './Base.event';

/**
 * Product click event
 */
class BannerClickEvent extends BaseEvent {
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
        Event.observer(EVENT_GTM_BANNER_CLICK, (banner) => {
            this.handle(banner);
        });
    }

    /**
     * Handle product click
     */
    handler(banner) {
        this.pushEventData({
            ecommerce: {
                click: {
                    banners: banner
                }
            }
        });
    }
}

export default BannerClickEvent;
