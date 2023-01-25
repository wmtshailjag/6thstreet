import { getStore } from 'Store';
import CartDispatcher from 'Store/Cart/Cart.dispatcher';
import {
    setClubApparel,
    setIsLoading
} from 'Store/ClubApparel/ClubApparel.action';
import { showNotification } from 'Store/Notification/Notification.action';
import {
    applyPoints,
    getMember,
    linkAccount,
    removePoints,
    verifyOtp
} from 'Util/API/endpoint/ClubApparel/ClubApparel.enpoint';
import { isSignedIn } from 'Util/Auth';
import Logger from 'Util/Logger';

export const CLUB_APPAREL = 'club_apparel';

export const ONE_MONTH_IN_SECONDS = 2628000;

export class ClubApparelDispatcher {
    async getMember(dispatch, id) {
        try {
            dispatch(setIsLoading(true));

            const { data } = isSignedIn()
                ? await getMember(id)
                : {};

            dispatch(setClubApparel(data));
        } catch (e) {
            dispatch(setClubApparel());

            Logger.log(e);
        }
    }

    /* eslint-disable-next-line */
    async linkAccount(dispatch, data) {
        try {
            return await linkAccount(data);
        } catch (e) {
            Logger.log(e);

            return false;
        }
    }

    /* eslint-disable-next-line */
    async verifyOtp(dispatch, data) {
        try {
            return await verifyOtp(data);
        } catch (e) {
            Logger.log(e);
        }
    }

    async toggleClubApparelPoints(dispatch, apply, id) {
        try {
            dispatch(setIsLoading(true));

            const {
                Cart: { cartId },
                ClubApparelReducer: { clubApparel: { caPoints = 0, caPointsValue = 0 } = {} }
            } = getStore().getState();

            if (apply) {
                await applyPoints(cartId, caPoints, caPointsValue);

                dispatch(showNotification('success', __('Club Apparel Points are applied!')));
            } else {
                await removePoints(cartId);

                dispatch(showNotification('success', __('Club Apparel Points are removed!')));
            }

            await CartDispatcher.getCartTotals(dispatch, cartId);
            await this.getMember(dispatch, id);

            return true;
        } catch (e) {
            Logger.log(e);

            dispatch(showNotification('error', __('There was an error, please try again later.')));

            return false;
        }
    }
}

export default new ClubApparelDispatcher();
