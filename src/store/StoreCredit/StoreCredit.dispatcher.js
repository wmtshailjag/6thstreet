import { getStore } from 'Store';
import CartDispatcher from 'Store/Cart/Cart.dispatcher';
import { showNotification } from 'Store/Notification/Notification.action';
import {
    setIsLoading,
    setStoreCredit
} from 'Store/StoreCredit/StoreCredit.action';
import {
    applyStoreCredit,
    getStoreCredit,
    removeStoreCredit
} from 'Util/API/endpoint/StoreCredit/StoreCredit.enpoint';
import { isSignedIn } from 'Util/Auth';
import Logger from 'Util/Logger';

export const STORE_CREDIT = 'store_credit';

export const ONE_MONTH_IN_SECONDS = 2628000;

export class StoreCreditDispatcher {
    async getStoreCredit(dispatch) {
        try {
            dispatch(setIsLoading(true));

            const { data } = isSignedIn()
                ? await getStoreCredit()
                : {};

            dispatch(setStoreCredit(data));
        } catch (e) {
            Logger.log(e);
        }
    }

    async toggleStoreCredit(dispatch, apply) {
        try {
            dispatch(setIsLoading(true));

            const { Cart: { cartId } } = getStore().getState();

            if (apply) {
                await applyStoreCredit(cartId);

                dispatch(showNotification('success', __('Store Credits are applied!')));
            } else {
                await removeStoreCredit(cartId);

                dispatch(showNotification('success', __('Store Credits are removed!')));
            }

            await CartDispatcher.getCartTotals(dispatch, cartId);
            await this.getStoreCredit(dispatch);

            return true;
        } catch (e) {
            Logger.log(e);

            dispatch(showNotification('error', __('There was an error, please try again later.')));

            return false;
        }
    }
}

export default new StoreCreditDispatcher();
