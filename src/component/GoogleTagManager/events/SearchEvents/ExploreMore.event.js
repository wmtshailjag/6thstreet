import Event, {
    EVENT_EXPLORE_MORE_SEARCH_CLICK, // Done
} from "Util/Event";

import BaseEvent from "../Base.event";

/**
 * Constants
 *
 * @type {number}
 */
export const URL_REWRITE = "url-rewrite";
export const SPAM_PROTECTION_DELAY = 200;
export const EVENT_HANDLE_DELAY = 700;

/**
 * GTM PWA Impression Event
 *
 * Called when customer see banners on home page
 */
class ExploreMoreClickEvent extends BaseEvent {
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
        Event.observer(EVENT_EXPLORE_MORE_SEARCH_CLICK, (data) => {
            this.handle(EVENT_EXPLORE_MORE_SEARCH_CLICK, data);
        });
    }

    handler(EVENT_TYPE, data) {
        this.pushEventData({
            event: EVENT_TYPE,
            eventCategory: EVENT_TYPE,
            eventAction: EVENT_TYPE,
            UserType: this.getCustomerId().toString().length > 0 ? "Logged In" : "Guest User",
            CustomerID: this.getCustomerId(),
            PageType: this.getPageType(),
            BannerName: data || "",
        });
    }
    getCustomerId() {
        return this.isSignedIn()
            ? this.getAppState().MyAccountReducer.customer.id || ""
            : "";
    }
    getPageType() {
        const { urlRewrite, currentRouteName } = window;

        if (currentRouteName === URL_REWRITE) {
            if (typeof urlRewrite === "undefined") {
                return "";
            }

            if (urlRewrite.notFound) {
                return "notfound";
            }

            return (urlRewrite.type || "").toLowerCase();
        }

        return (currentRouteName || "").toLowerCase();
    }
}

export default ExploreMoreClickEvent;
