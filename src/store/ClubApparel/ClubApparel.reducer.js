import { CLUB_APPAREL, ONE_MONTH_IN_SECONDS } from 'Store/ClubApparel/ClubApparel.dispatcher';
import { getCurrency } from 'Util/App';
import BrowserDatabase from 'Util/BrowserDatabase';

import {
    SET_CLUB_APPAREL,
    SET_CLUB_APPAREL_STATE,
    SET_IS_CLUB_APPAREL_LOADING
} from './ClubApparel.action';

export const getInitialState = () => ({
    accountLinked: false,
    caLoyaltyMember: false,
    isMember: false,
    caPoints: 0,
    caPointsValue: 0,
    currency: getCurrency()
});

export const getFallbackState = () => {
    const storageClubApparel = BrowserDatabase.getItem(CLUB_APPAREL) || null;
    const { clubApparel: initialState } = getInitialState();
    const clubApparel = storageClubApparel || initialState;

    return { clubApparel };
};

export const ClubApparelReducer = (state = getFallbackState(), action) => {
    const { type } = action;

    switch (type) {
    case SET_IS_CLUB_APPAREL_LOADING:
        const { isLoading } = action;

        return {
            ...state,
            isLoading
        };
    case SET_CLUB_APPAREL_STATE:
        const { applied } = action;

        return {
            ...state,
            applied,
            isLoading: false
        };
    case SET_CLUB_APPAREL:
        const { clubApparel = getInitialState() } = action;

        BrowserDatabase.setItem(
            clubApparel,
            CLUB_APPAREL,
            ONE_MONTH_IN_SECONDS
        );

        return {
            ...state,
            clubApparel,
            isLoading: false
        };

    default:
        return state;
    }
};

export default ClubApparelReducer;
