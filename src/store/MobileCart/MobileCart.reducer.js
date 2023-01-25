import BrowserDatabase from 'Util/BrowserDatabase';

import {
    REMOVE_CART_ITEM,
    SET_CART_ID,
    SET_CART_TOTALS,
    UPDATE_CART_ITEM
} from './MobileCart.action';

export const CART_ID_CACHE_KEY = 'CART_ID_CACHE_KEY';
export const CART_ITEMS_CACHE_KEY = 'CART_ITEMS_CACHE_KEY';
export const LAST_CART_ID_CACHE_KEY = 'LAST_CART_ID_CACHE_KEY';

export const getInitialState = () => ({
    cartId: BrowserDatabase.getItem(CART_ID_CACHE_KEY),
    // TODO set initial data to empty cart structure???
    cartTotals: {},
    cartItems: BrowserDatabase.getItem(CART_ITEMS_CACHE_KEY) || []
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

export const MobileCartReducer = (state = getInitialState(), action) => {
    const { type, cartItem } = action;
    const { cartItems } = state;
    const ONE_YEAR_IN_SECONDS = 31536000;

    switch (type) {
    case SET_CART_ID:
        const { cartId } = action;

        BrowserDatabase.setItem(
            cartId,
            CART_ID_CACHE_KEY,
            ONE_YEAR_IN_SECONDS // TODO Get info from Backend developers on cart expire time
        );

        return {
            ...state,
            cartId
        };

    case SET_CART_TOTALS:
        const { cartTotals } = action;
        return {
            ...state,
            cartTotals
        };

    case UPDATE_CART_ITEM:
        const updatedCartItems = updateCartItem(cartItems, cartItem);

        BrowserDatabase.setItem(
            updatedCartItems,
            CART_ITEMS_CACHE_KEY,
            ONE_YEAR_IN_SECONDS
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
            ONE_YEAR_IN_SECONDS
        );

        return {
            ...state,
            cartItems: reducedCartItems
        };

    default:
        return state;
    }
};

export default MobileCartReducer;
