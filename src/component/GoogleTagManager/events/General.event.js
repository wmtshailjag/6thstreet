/* eslint-disable import/no-cycle */
import { isArabic } from 'Util/App';
import Event, { EVENT_GTM_GENERAL_INIT, EVENT_GTM_META_UPDATE } from 'Util/Event';

import BaseEvent from './Base.event';

export const GENERAL_EVENT_DELAY = 500;

/**
 * GTM PWA General event
 *
 * On: page load, page change location
 */
class GeneralEvent extends BaseEvent {
    /**
     * Set base event call delay
     *
     * @type {number}
     */
    eventHandleDelay = 0;

    /**
     * Current meta data
     *
     * @type {{}}
     */
    currentMeta = { title: '' };

    /**
     * Bind PWA event handling
     */
    bindEvent() {
        this.delayedEvent();

        // Catch custom triggers e.g. login
        Event.observer(EVENT_GTM_GENERAL_INIT, ({ initial }) => {
            if (!initial) {
                this.delayedEvent();
            }
        });

        // Receive current meta
        Event.observer(EVENT_GTM_META_UPDATE, (meta) => {
            this.currentMeta = meta;
        });
    }

    delayedEvent() {
        // Page load, wait a bit for better user performance
        setTimeout(() => {
            this.saveCartDataToStorage();
            this.handle();
        }, GENERAL_EVENT_DELAY);

        // eslint-disable-next-line prefer-destructuring
        const history = this.getGTM().props.history;

        // eslint-disable-next-line fp/no-let
        let prevLocation = history.location;

        history.listen((location) => { // On page change
            const { pathname } = location;
            const { pathname: prevPathname } = prevLocation;

            // prevents from firing general on filter change (PLP) and on attribute change (PDP)
            if (pathname === prevPathname) {
                return;
            }

            this.saveCartDataToStorage();
            prevLocation = location;

            setTimeout(() => {
                this.handle();
            }, GENERAL_EVENT_DELAY);
        });
    }

    saveCartDataToStorage() {
        const storage = this.getStorage() || {};
        storage.cartLast = storage.cart;
        storage.cart = this.getAppState().CartReducer.cartTotals.items;
        this.setStorage(storage);
    }

    /**
     * Handler General
     * Wait for cart to load before firing event as we need cart data
     */
    handler() {
        Event.dispatch(EVENT_GTM_GENERAL_INIT, { initial: true });

        const checkOnCartDataInterval = 500;
        const interval = setInterval(() => {
            if (Object.keys(this.getAppState().Cart.cartTotals || {}).length) {
                clearInterval(interval);

                this.pushEventData({
                    country: this.getCountryName(),
                    pageType: this.getPageType(),
                    language: this.getLanguage(),
                    storeView: this.getStoreView(),
                    customerId: this.getCustomerId(),
                    cart: this.prepareCartData()
                });
            }
        }, checkOnCartDataInterval);
    }

    /**
     * Get current store view
     *
     * @return {string}
     */
    getStoreView() {
        return this.getAppState().AppState.locale || '';
    }

    /**
     * Get current language
     *
     * @return {string}
     */
    getLanguage() {
        return isArabic() ? 'ar_SA' : 'en_US';
    }

    /**
     * Get current signed in customer id
     *
     * @return {string}
     */
    getCustomerId() {
        return this.isSignedIn() ? this.getAppState().MyAccountReducer.customer.id || '' : '';
    }

    /**
     * Get customer city
     *
     * @return {string}
     */
    getCountryName() {
        return this.getAppState().AppState.country || '';
    }
}

export default GeneralEvent;
