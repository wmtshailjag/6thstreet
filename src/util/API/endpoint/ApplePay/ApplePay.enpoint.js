import CheckoutAPI from '../../provider/CheckoutAPI';

// eslint-disable-next-line import/prefer-default-export
export const tokenize = (data) => CheckoutAPI.post(
    '/tokens',
    data
) || {};
