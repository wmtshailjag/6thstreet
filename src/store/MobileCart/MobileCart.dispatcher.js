import { getStore } from 'Store';
import {
    removeCartItem,
    setCartId,
    setCartTotals,
    updateCartItem
} from 'Store/MobileCart/MobileCart.action';
import { showNotification } from 'Store/Notification/Notification.action';
import {
    addProductToCart,
    applyCouponCode,
    createCart,
    getCartTotals,
    removeCouponCode,
    removeProductFromCart,
    updateProductInCart
} from 'Util/API/endpoint/Cart/Cart.enpoint';
import Logger from 'Util/Logger';
import BrowserDatabase from 'Util/BrowserDatabase';
import { LAST_CART_ID_CACHE_KEY } from 'MobileCart.reducer';

export class MobileCartDispatcher {
    async getCart(dispatch) {
        const { MobileCart: { cartId } } = getStore().getState();
        const cart_id = BrowserDatabase.getItem(LAST_CART_ID_CACHE_KEY);
        if (!cartId) {
            try {
                const { data: cartId = null } = await createCart(cart_id);

                if (!cartId) {
                    dispatch(
                        showNotification(
                            'error',
                            __('There was an error creating your cart, please refresh the page in a little while')
                        )
                    );

                    return;
                }

                dispatch(setCartId(cartId));
            } catch (e) {
                Logger.log(e);
            }
        }

        await this.getCartTotals(dispatch, cartId);
    }

    async getCartTotals(dispatch, cartId) {
        try {
            const { data } = await getCartTotals(cartId);

            dispatch(setCartTotals(data));
        } catch (e) {
            Logger.log(e);
        }
    }

    async addProductToCart(dispatch, productData) {
        const { MobileCart: { cartId } } = getStore().getState();

        try {
            const { data } = await addProductToCart({ ...productData, cartId });

            dispatch(updateCartItem(data));
        } catch (e) {
            Logger.log(e);
        }

        await this.getCartTotals(dispatch, cartId);
    }

    async removeProductFromCart(dispatch, productId) {
        const { MobileCart: { cartId } } = getStore().getState();

        try {
            const { data } = await removeProductFromCart({ cartId, productId });

            // if 'data' in response was not true there was some error
            // catch will process that
            if (data) {
                dispatch(removeCartItem({ item_id: productId }));
            }
        } catch (e) {
            Logger.log(e);
        }

        await this.getCartTotals(dispatch, cartId);
    }

    async updateProductInCart(dispatch, productId, qty) {
        const { MobileCart: { cartId } } = getStore().getState();

        try {
            const { data } = await updateProductInCart({ cartId, productId, qty });
            dispatch(updateCartItem(data));
        } catch (e) {
            Logger.log(e);
        }

        await this.getCartTotals(dispatch, cartId);
    }

    async applyCouponCode(dispatch, couponCode) {
        const { MobileCart: { cartId } } = getStore().getState();

        try {
            const resp = await applyCouponCode({ cartId, couponCode });

            // TODO Validate response and update UI,
            //  by adding option to remove coupon code or show error

        } catch (e) {
            Logger.log(e);
        }

        await this.getCartTotals(dispatch, cartId);
    }

    async removeCouponCode(dispatch, couponCode) {
        const { MobileCart: { cartId } } = getStore().getState();

        try {
            const resp = await removeCouponCode({ cartId, couponCode });

            // TODO Validate response and update UI,
            //  by removing option to remove coupon code or show error

        } catch (e) {
            Logger.log(e);
        }

        await this.getCartTotals(dispatch, cartId);
    }
}

export default new MobileCartDispatcher();
