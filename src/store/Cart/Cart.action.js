export const SET_CART_ID = "SET_CART_ID";
export const SET_CART_TOTALS = "SET_CART_TOTALS";
export const UPDATE_CART_ITEM = "UPDATE_CART_ITEM";
export const REMOVE_CART_ITEM = "REMOVE_CART_ITEM";
export const REMOVE_CART_ITEMS = "REMOVE_CART_ITEMS";
export const UPDATE_TOTALS = "UPDATE_TOTALS";
export const PROCESSING_CART_REQUEST = "START_CART_REQUEST";
export const PROCESSING_PAYMENT_SELECT_REQUEST = "SET_PAYMENT_SELECT_REQUEST";
export const SET_MINICART_OPEN = "SET_MINICART_OPEN";
export const SET_DETAIL_STEP = "SET_DETAIL_STEP";
export const RESET_CART = "RESET_CART";
export const SET_CART_COUPON = "SET_CART_COUPON";

export const setCheckoutDetails = (checkoutDetails) => ({
  type: SET_DETAIL_STEP,
  checkoutDetails,
});

export const setCartId = (cartId) => ({
  type: SET_CART_ID,
  cartId,
});

export const setCartTotals = (cartTotals) => ({
  type: SET_CART_TOTALS,
  cartTotals,
});

export const processingCartRequest = () => ({
  type: PROCESSING_CART_REQUEST,
});

export const processingPaymentSelectRequest = (requestStatus) => ({
  type: PROCESSING_PAYMENT_SELECT_REQUEST,
  requestStatus,
});

export const updateCartItem = (
  cartItem,
  color,
  optionValue,
  basePrice,
  brand_name,
  thumbnail_url,
  url,
  itemPrice,
  availability,
  available_qty,
  extension_attributes
) => ({
  type: UPDATE_CART_ITEM,
  cartItem: {
    ...cartItem,
    color,
    optionValue,
    basePrice,
    brand_name,
    thumbnail_url,
    extension_attributes,
    url,
    itemPrice,
    availability,
    available_qty,
  },
});

export const removeCartItem = (cartItem) => ({
  type: REMOVE_CART_ITEM,
  cartItem,
});

export const removeCartItems = () => ({
  type: REMOVE_CART_ITEMS,
});

export const resetCart = () => ({
  type: RESET_CART,
});

export const updateTotals = (cartData) => ({
  type: UPDATE_TOTALS,
  cartData,
});

export const setMinicartOpen = (isMinicartOpen = false) => ({
  type: SET_MINICART_OPEN,
  isMinicartOpen,
});

export const setCartCoupon = (cartCoupons) => ({
  type: SET_CART_COUPON,
  cartCoupons,
});
