import {
    SET_SHIPPING
} from './Checkout.action';

export const getInitialState = () => ({
    shipping: {},
});

export const CheckoutReducer = (state = getInitialState(), action) => {
    const { type } = action;

    switch (type) {
    case SET_SHIPPING:
        const { shipping } = action;

        return {
            ...state,
            shipping,
        };

    default:
        return state;
    }
};

export default CheckoutReducer;
