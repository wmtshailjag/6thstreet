import { isSignedIn, ONE_HOUR } from 'Util/Auth';
import BrowserDatabase from 'Util/BrowserDatabase';
import { ONE_MONTH_IN_SECONDS } from "Util/Request/QueryDispatcher";

import {
    PROCESSING_CART_REQUEST,
    PROCESSING_PAYMENT_SELECT_REQUEST,
    REMOVE_CART_ITEM,
    REMOVE_CART_ITEMS,
    RESET_CART,
    SET_CART_ID,
    SET_CART_TOTALS,
    SET_MINICART_OPEN,
    UPDATE_CART_ITEM,
    UPDATE_TOTALS,
    SET_DETAIL_STEP,
    SET_CART_COUPON
} from './Cart.action';

export const CART_ID_CACHE_KEY = 'CART_ID_CACHE_KEY';

export const CART_ITEMS_CACHE_KEY = 'CART_ITEMS_CACHE_KEY';

export const getInitialState = () => ({
    cartId: BrowserDatabase.getItem(CART_ID_CACHE_KEY),
    // TODO set initial data to empty cart structure???
    cartTotals: {},
    isLoading: true,
    cartItems: BrowserDatabase.getItem(CART_ITEMS_CACHE_KEY) || [],
    isMinicartOpen: false,
    checkoutDetails:false
});

const updateCartItem = (cartItems, newItem) => {
    const newItemIndex = cartItems.findIndex((x) => x.sku === newItem.sku);

    if (newItemIndex > -1) {
        cartItems.splice(newItemIndex, 1, newItem);
    } else {
        cartItems.push(newItem);
    }

    return cartItems;
};

const removeCartItem = (cartItems, itemToRemove) => {
    const itemToRemoveIndex = cartItems.findIndex((x) => x.item_id === itemToRemove.item_id);

    if (itemToRemoveIndex > -1) {
        cartItems.splice(itemToRemoveIndex, 1);
    }

    return cartItems;
};

export const CartReducer = (state = getInitialState(), action) => {
    const {
        type, cartId, cartItem, cartTotals, requestStatus, checkoutDetails, cartCoupons
    } = action;
    const { cartItems } = state;
    const ONE_DAY_IN_SECONDS = 86400;
    const item = { ...cartItem };
    const totals = { ...cartTotals };
    const expireTime = isSignedIn() ? ONE_MONTH_IN_SECONDS : ONE_DAY_IN_SECONDS;

    switch (type) {
       
        case SET_DETAIL_STEP:
    
            return {
                ...state,
                checkoutDetails:checkoutDetails
            };
        
    case SET_CART_ID:
        BrowserDatabase.setItem(
            cartId,
            CART_ID_CACHE_KEY,
            expireTime
        );

        return {
            ...state,
            cartId
        };

    case PROCESSING_CART_REQUEST:
        return {
            ...state,
            processingRequest: true
        };

    case PROCESSING_PAYMENT_SELECT_REQUEST:
        return {
            ...state,
            processingPaymentSelectRequest: requestStatus
        };

    case SET_CART_TOTALS:
        return {
            ...state,
            cartTotals: {
                ...cartTotals,
                items: cartItems,
                subtotal_incl_tax: totals.subtotal || 0,
                quote_currency_code: totals.currency_code
            },
            currency: totals.currency_code,
            isLoading: false,
            processingRequest: false
        };

    case UPDATE_CART_ITEM:
        const formattedCartItem = {
            customizable_options: [],
            bundle_options: [],
            item_id: item.item_id,
            product: {
                name: item.name,
                type_id: item.product_type,
                configurable_options: {},
                parent: {},
                thumbnail: {
                    url: item.thumbnail_url
                },
                url: item.url,
                variants: [],
                product_type_6s: item.product_type_6s,
            },
            row_total: item.itemPrice || 0,
            product_type_6s: item.product_type_6s,
            sku: item.sku,
            qty: item.qty,
            color: item.color,
            optionValue: item.optionValue,
            thumbnail_url: item.thumbnail_url,
            basePrice: item.basePrice,
            brand_name: item.brand_name,
            currency: totals.currency,
            availability: item.availability,
            availableQty: item.available_qty,
            extension_attributes: item.extension_attributes,
            full_item_info: item,
            processingRequest: false
        };

        const updatedCartItems = updateCartItem(cartItems, formattedCartItem);
        BrowserDatabase.setItem(
            updatedCartItems,
            CART_ITEMS_CACHE_KEY,
            expireTime
        );

        return {
            ...state,
            cartItems: updatedCartItems
        };

    case REMOVE_CART_ITEM:
        const reducedCartItems = removeCartItem(cartItems, cartItem);
        BrowserDatabase.setItem(
            reducedCartItems,
            CART_ITEMS_CACHE_KEY,
            expireTime
        );

        return {
            ...state,
            cartItems: reducedCartItems
        };

    case REMOVE_CART_ITEMS:
        BrowserDatabase.setItem(
            [],
            CART_ITEMS_CACHE_KEY,
            expireTime
        );

        return {
            ...state,
            cartItems: []
        };

    case RESET_CART:
        BrowserDatabase.deleteItem(
            CART_ID_CACHE_KEY
        );

        BrowserDatabase.deleteItem(
            CART_ITEMS_CACHE_KEY
        );        

        return {
            ...getInitialState(),
            checkoutDetails:state.checkoutDetails
        };
    case UPDATE_TOTALS:
    case SET_MINICART_OPEN:
        const { isMinicartOpen } = action;

        return {
            ...state,
            isMinicartOpen
        };
    case SET_CART_COUPON:
        return {
            ...state,
            cartCoupons
        };
    default:
        return state;
    }
};

export default CartReducer;
