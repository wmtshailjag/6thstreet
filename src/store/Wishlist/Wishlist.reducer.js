import { formatItems } from 'Util/API/endpoint/Wishlist/Wishlist.format';

import { SET_WISHLIST_ITEMS } from './Wishlist.action';

export const getInitialState = () => ({
    isLoading: true,
    items: []
});

export const WishlistReducer = (state = getInitialState(), action) => {
    const { type, items } = action;

    switch (type) {
    case SET_WISHLIST_ITEMS:
        return {
            ...state,
            isLoading: false,
            items: items.filter(({ product }) => !!product)
        };

    default:
        return state;
    }
};

export default WishlistReducer;
