/* eslint-disable import/no-cycle */
import Event, {
  EVENT_GTM_PURCHASE,
  EVENT_MOE_PURCHASE_SUCCESS,
  EVENT_MOE_PURCHASE_SUCCESS_PRODUCT,
} from "Util/Event";
import { roundPrice } from "Util/Price";

import ProductHelper from "../utils";
import BaseEvent from "./Base.event";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import BrowserDatabase from "Util/BrowserDatabase";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
export const PURCHASE_EVENT_HANDLE_DELAY = 700;
export const SPAM_PROTECTION_DELAY = 10000;

/**
 * On order success page "Purchase"
 */
class PurchaseEvent extends BaseEvent {
  /**
   * Event delay
   *
   * @type {number}
   */
  eventHandleDelay = PURCHASE_EVENT_HANDLE_DELAY;

  /**
   * Bind on product detail
   */
  bindEvent() {
    Event.observer(EVENT_GTM_PURCHASE, ({ orderID: orderId, totals }) => {
      this.handle(orderId, totals);
    });
  }

  /**
   * Handle
   *
   * @param orderId
   * @param totals
   * @param cartData
   */
  handler(orderId, totals) {
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
        purchase: {
          actionField: this.getActionFields(orderId, totals),
          products: this.getProducts(totals),
        },
      },
    });
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    const productDetails = totals?.items;
    let productName = [],
      productColor = [],
      productBrand = [],
      productSku = [],
      productGender = [],
      productBasePrice = [],
      productSizeOption = [],
      productSizeValue = [],
      productSubCategory = [],
      productThumbanail = [],
      productUrl = [],
      productQty = [],
      productCategory = [],
      productItemPrice = [];
    if (productDetails && productDetails.length > 0) {
      productDetails.forEach((item) => {
        let productKeys = item?.full_item_info;
        productName.push(productKeys?.name);
        productColor.push(productKeys?.color);
        productBrand.push(productKeys?.brand_name);
        productSku.push(productKeys?.config_sku);
        productGender.push(productKeys?.gender);
        productBasePrice.push(productKeys?.original_price);
        productSizeOption.push(productKeys?.size_option);
        productSizeValue.push(productKeys?.size_value);
        productSubCategory.push(productKeys?.subcategory);
        productThumbanail.push(productKeys?.thumbnail_url);
        productUrl.push(productKeys?.url);
        productQty.push(productKeys?.qty);
        productCategory.push(productKeys?.category);
        productItemPrice.push(productKeys?.itemPrice);

        Moengage.track_event(EVENT_MOE_PURCHASE_SUCCESS_PRODUCT, {
          country: getCountryFromUrl().toUpperCase(),
          language: getLanguageFromUrl().toUpperCase(),
          category: productKeys?.category
            ? productKeys?.category
            : currentAppState.gender
            ? currentAppState.gender.toUpperCase()
            : "",
          currency: totals?.currency_code || "",
          order_id: orderId || "",
          transaction_id: totals?.id || "",
          brand_name: productKeys?.brand_name || "",
          color: productKeys?.color || "",
          discounted_price: productKeys?.itemPrice || "",
          full_price: productKeys?.original_price || "",
          product_name: productKeys?.name || "",
          product_sku: productKeys?.config_sku || "",
          gender: productKeys?.gender || "",
          size_id: productKeys?.size_option || "",
          size: productKeys?.size_value || "",
          subcategory: productKeys?.subcategory || "",
          app6thstreet_platform: "Web",
        });
      });

      Moengage.track_event(EVENT_MOE_PURCHASE_SUCCESS, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        category:
          productCategory.length > 0
            ? productCategory
            : currentAppState.gender
            ? currentAppState.gender.toUpperCase()
            : "",
        coupon_code_applied: totals?.coupon_code || "",
        currency: totals?.currency_code || "",
        product_count: totals?.items.length || "",
        discounted_amount: totals?.discount || "",
        shipping_fee: totals?.shipping_fee || "",
        subtotal_amount: totals?.subtotal || "",
        order_id: orderId || "",
        total_amount: totals?.total || "",
        transaction_id: totals?.id || "",
        brand_name: productBrand.length > 0 ? productBrand : "",
        color: productColor.length > 0 ? productColor : "",
        discounted_price: productItemPrice.length > 0 ? productItemPrice : "",
        full_price: productBasePrice.length > 0 ? productBasePrice : "",
        product_name: productName.length > 0 ? productName : "",
        product_sku: productSku.length > 0 ? productSku : "",
        gender: productGender.length > 0 ? productGender : "",
        size_id: productSizeOption.length > 0 ? productSizeOption : "",
        size: productSizeValue.length > 0 ? productSizeValue : "",
        subcategory: productSubCategory.length > 0 ? productSubCategory : "",
        app6thstreet_platform: "Web",
        //shipping: "",
        //value: "",
      });
    }
  }
  getMOEPurchaseDetails() {}
  /**
   * Get order information
   *
   * @return {{revenue: number, coupon_discount_abs: string, coupon: string, shipping: number, affiliation: string, coupon_discount_amount: string, tax: number, id: *}}
   */
  getActionFields(
    orderId = "",
    { tax_amount, total, shipping_fee, coupon_code = "" }
  ) {
    return {
      id: orderId,
      affiliation: "Online Store",
      revenue: +roundPrice(total),
      tax: +roundPrice(tax_amount),
      shipping: +roundPrice(shipping_fee),
      coupon: coupon_code,
    };
  }

  /**
   * Get product detail
   *
   * @param totals
   *
   * @return {{quantity: number, price: number, name: string, variant: string, id: string, category: string, brand: string, url: string}[]}
   * @param cartData
   */
  getProducts({ items = [] }) {
    const products = items.reduce(
      (acc, item) => [
        ...acc,
        {
          ...ProductHelper.getItemData(item),
          quantity: ProductHelper.getQuantity(item),
        },
      ],
      []
    );

    const groupedProducts = this.getGroupedProducts();
    Object.values(groupedProducts || {}).forEach(({ data }) =>
      products.push(data)
    );

    return products;
  }
}

export default PurchaseEvent;
