import MyAccountDispatcher, {
  CUSTOMER,
} from "Store/MyAccount/MyAccount.dispatcher";
import { getCurrency } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";

export const URL_REWRITE = "url-rewrite";

export const DATA_RECHECK_TIMEOUT = 1500;
export const EVENT_HANDLE_DELAY = 1500;

/**
 * Base event for GTM PWA events
 */
class BaseEvent {
  /**
   *
   * @type {GoogleTagManager}
   */
  gtmReference = null;

  /**
   * Current event name
   *
   * @type {string}
   */
  eventName = "";

  /**
   * Time when last event was fired
   *
   * @type {Object}
   */
  lastEventTime = {};

  /**
   * Event delay
   *
   * @type {number}
   */
  eventHandleDelay = EVENT_HANDLE_DELAY;

  /**
   * Constructor
   *
   * @param eventName
   * @param gtmReference
   */
  constructor(eventName, gtmReference) {
    this.eventName = eventName;
    this.gtmReference = gtmReference;
  }

  /**
   * Bind event trigger, when triggered call handler
   * Called by GTM main component
   */
  bindEvent() {}

  /**
   * Called, when event should be unmounted and destructed
   * Called by GTM main component
   */
  destruct() {}

  /**
   * Check that we have loaded all data, if no, load or wait until will be loaded
   */
  checkDataExists(...args) {
    if (this.isLoadingData) {
      return false;
    }

    // Wait until config data will be loaded
    if (Object.entries(this.getAppState().ConfigReducer || {}).length === 0) {
      this.isLoadingData = true;

      setTimeout(() => {
        this.isLoadingData = false;
        this.handle(...args);
      }, DATA_RECHECK_TIMEOUT);

      return false;
    }

    // Wait until customer data will be loaded (or load customer data manually)
    if (
      this.isSignedIn() &&
      Object.entries(BrowserDatabase.getItem(CUSTOMER) || {}).length === 0
    ) {
      this.isLoadingData = true;

      const dispatch = this.getAppDispatch();
      MyAccountDispatcher.requestCustomerData(dispatch);

      // Wait until user details will be loaded
      setTimeout(() => {
        this.isLoadingData = false;
        this.handle(...args);
      }, DATA_RECHECK_TIMEOUT);

      return false;
    }

    if (this.getPageType() === "") {
      this.isLoadingData = true;

      setTimeout(() => {
        this.isLoadingData = false;
        this.handle(...args);
      }, DATA_RECHECK_TIMEOUT);

      return false;
    }

    return true;
  }

  /**
   * Handle event fire
   * Process event logic
   */
  handle(...args) {
    if (!this.checkDataExists(...args)) {
      return;
    }

    // Set little delay on event fire. make it async, to do not block main code
    setTimeout(() => {
      this.handler(...args);
    }, this.eventHandleDelay);
  }

  /**
   * Handle Event
   */
  handler() {}

  /**
   * Get element by class name
   *
   * @param className
   * @param container
   *
   * @return {boolean}
   */
  getElementByClass(className, container = document) {
    const elements = container.getElementsByClassName(className) || [];

    if (elements && elements.length) {
      const [element] = elements;

      return element || false;
    }

    return false;
  }

  /**
   * Check if given element in window viewport
   *
   * @param element
   */
  elementInViewPort(element) {
    const doomElement =
      typeof element === "object" ? element : this.getElementByClass(element);

    if (doomElement) {
      const bounds = doomElement.getBoundingClientRect();
      const viewPortHeight = window.innerHeight || document.body.clientHeight;

      return (
        bounds.y + bounds.height > 0 &&
        bounds.y - bounds.height < viewPortHeight
      );
    }

    return false;
  }

  /**
   * Check if handle event is fired too often
   *
   * @param delay
   * @param type
   *
   * @return {boolean}
   */
  spamProtection(delay, type = "default") {
    const previousEventTime = this.lastEventTime[type] || 0;
    this.lastEventTime[type] = Date.now();

    return previousEventTime + delay > this.lastEventTime[type];
  }

  /**
   * Push data to google tag manager
   *
   * @param event
   * @param data
   */
  pushEventData(data) {
    this.getGTM().processDataPush(this.eventName, data);
  }

  /**
   * Get current application state
   *
   * @return {{}}
   */
  getAppState() {
    return this.getGTM().props.state;
  }

  /**
   * Get reference to GoogleTagManager
   *
   * @return {GoogleTagManager}
   */
  getGTM() {
    return this.gtmReference;
  }

  /**
   * Get application dispatch
   *
   * @return {function}
   */
  getAppDispatch() {
    return this.getGTM().props.dispatch;
  }

  /**
   * Get Store currency code
   *
   * @return {string}
   */
  getCurrencyCode() {
    return getCurrency();
  }

  /**
   * Get page type
   *
   * @return {string}
   */
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

  /**
   * if user is signed in
   *
   * @return {*|boolean}
   */
  isSignedIn() {
    return this.getAppState().MyAccountReducer.isSignedIn || false;
  }

  /**
   * Get reference to the event storage
   *
   * @param event
   * @return {*}
   */
  getStorage(event = this.eventName) {
    return this.getGTM().getEventDataStorage(event);
  }

  /**
   * Clean event storage
   *
   * @param event
   */
  cleanStorage(event = this.eventName) {
    this.getGTM().resetEventDataStorage(event);
  }

  /**
   * Set storage data
   *
   * @param data
   * @param event
   */
  setStorage(data, event = this.eventName) {
    this.getGTM().setEventStorage(event, data);
  }

  /**
   * Set grouped products
   *
   * @param groupedProducts
   */
  setGroupedProducts(groupedProducts) {
    this.getGTM().setGroupedProducts(groupedProducts);
  }

  /**
   * Get grouped products
   *
   * @param groupedProducts
   */
  getGroupedProducts() {
    return this.getGTM().getGroupedProducts();
  }

  /**
   * Prepare cart data
   *
   * @return array
   */
  prepareCartData() {
    const { items = [] } = this.getCartProductData();

    return items.map(
      ({
        product: { name } = {},
        sku,
        row_total,
        brand_name,
        optionValue,
        qty,
        color,
      }) => ({
        name,
        id: sku,
        price: row_total,
        brand: brand_name,
        category: "",
        quantity: qty,
        size: optionValue,
        variant: color,
      })
    );
  }

  /**
   * Get cart products
   *
   * @return {initialState.cartTotals|{}}
   */
  getCartProductData() {
    const appState = this.getAppState();

    return appState.CartReducer.cartTotals || {};
  }
}

export default BaseEvent;
