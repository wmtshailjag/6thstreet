export const SET_CART_ID = 'SET_CART_ID';
export const SET_CART_TOTALS = 'SET_CART_TOTALS';
export const UPDATE_CART_ITEM = 'UPDATE_CART_ITEM';
export const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM';

export const setCartId = (cartId) => ({
    type: SET_CART_ID,
    cartId
});

export const setCartTotals = (cartTotals) => ({
    type: SET_CART_TOTALS,
    cartTotals
});

export const updateCartItem = (cartItem) => ({
    type: UPDATE_CART_ITEM,
    cartItem
});

export const removeCartItem = (cartItem) => ({
    type: REMOVE_CART_ITEM,
    cartItem
});
