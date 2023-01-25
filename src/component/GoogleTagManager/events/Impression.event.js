import Event, {
    EVENT_GTM_GENERAL_INIT,
    EVENT_GTM_IMPRESSIONS_CROSS_SELL,
    EVENT_GTM_IMPRESSIONS_HOME,
    EVENT_GTM_IMPRESSIONS_LINKED,
    EVENT_GTM_IMPRESSIONS_PLP,
    EVENT_GTM_IMPRESSIONS_SEARCH,
    EVENT_GTM_IMPRESSIONS_WISHLIST
} from 'Util/Event';

import BaseEvent from './Base.event';

/**
 * Website places, from where was received event data
 *
 * @type {string}
 */
export const PLP_IMPRESSIONS = 'catalog';
export const HOME_IMPRESSIONS = 'home';
export const WISHLIST_IMPRESSIONS = 'wishlist';
export const CHECKOUT_CROSS_SELL_IMPRESSIONS = 'checkout_cross_sell';
export const SEARCH_IMPRESSIONS = 'search';
export const RECOMMENDED_IMPRESSIONS = 'recommended';

/**
 * Constants
 *
 * @type {number}
 */
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;

/**
 * GTM PWA Impression Event
 *
 * Called when customer see product list
 * On: Home, PLP, WishList, Up-Sell, Cross-Sell, Accessories(related things on PDP)
 */
class ImpressionEvent extends BaseEvent {
    /**
     * Set base event call delay
     *
     * @type {number}
     */
    eventHandleDelay = EVENT_HANDLE_DELAY;

    /**
     * Bind PWA event handling
     */
    bindEvent() {
        // PLP
        Event.observer(EVENT_GTM_IMPRESSIONS_PLP, ({ impressions, category }) => {
            this.handle(PLP_IMPRESSIONS, impressions, category);
        });

        // Home
        Event.observer(EVENT_GTM_IMPRESSIONS_HOME, ({ impressions, category }) => {
            this.handle(HOME_IMPRESSIONS, impressions, category);
        });

        // Checkout Cross-sell
        Event.observer(EVENT_GTM_IMPRESSIONS_CROSS_SELL, ({ impressions, category }) => {
            this.handle(CHECKOUT_CROSS_SELL_IMPRESSIONS, impressions, category);
        });

        // Wishlist
        Event.observer(EVENT_GTM_IMPRESSIONS_WISHLIST, ({ impressions, category }) => {
            this.handle(WISHLIST_IMPRESSIONS, impressions, category);
        });

        // Search
        Event.observer(EVENT_GTM_IMPRESSIONS_SEARCH, ({ impressions, category }) => {
            this.handle(SEARCH_IMPRESSIONS, impressions, category);
        });

        // Recommended
        Event.observer(EVENT_GTM_IMPRESSIONS_LINKED, ({ impressions, category }) => {
            this.handle(RECOMMENDED_IMPRESSIONS, impressions, category);
        });

        // General
        Event.observer(EVENT_GTM_GENERAL_INIT, () => {
            this.cleanStorage();
        });
    }

    /**
     * Handle Impressions
     *
     * @param eventName Unique event id
     * @param impressions Product list
     * @param category Category name
     */
    handler(eventName, impressions = [], category) {
        const storage = this.getStorage();
        const categoryName = (!category || category === '') ? this.getFallbackCategory(eventName) : category;

        if (!impressions
            || impressions.length === 0
            || this.spamProtection(SPAM_PROTECTION_DELAY)
        ) {
            return;
        }

        const formattedImpressions = impressions.map(({
            brand_name,
            sku,
            name,
            price = {},
            url,
            colorfamily
        }, index) => ({
            brand: brand_name,
            category: categoryName,
            id: sku,
            list: categoryName,
            name,
            position: index + 1,
            price: price[Object.keys(price)[0]].default || 0,
            url,
            variant: colorfamily
        }));

        storage.impressions = formattedImpressions;

        this.setStorage(storage);
        this.pushEventData({
            ecommerce: {
                currencyCode: this.getCurrencyCode(),
                impressions: formattedImpressions
            }
        });
    }

    /**
     * Get product collection list name
     *
     * @param productCollectionType
     *
     * @return {string}
     */
    getFallbackCategory(productCollectionType) {
        switch (productCollectionType) {
        case HOME_IMPRESSIONS:
            return 'Homepage';
        case RECOMMENDED_IMPRESSIONS:
            return 'Recommended';
        case SEARCH_IMPRESSIONS:
            return 'Search results';
        case WISHLIST_IMPRESSIONS:
            return 'Wishlist';
        case CHECKOUT_CROSS_SELL_IMPRESSIONS:
            return 'Cross sell impressions';
        case PLP_IMPRESSIONS:
        default:
            return 'Product List';
        }
    }
}

export default ImpressionEvent;
