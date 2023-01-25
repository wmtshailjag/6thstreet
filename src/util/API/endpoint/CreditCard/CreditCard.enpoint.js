import CheckoutAPI from '../../provider/CheckoutAPI';
import MagentoAPI from '../../provider/MagentoAPI';

// eslint-disable-next-line import/prefer-default-export
export const addNewCreditCard = (data) => CheckoutAPI.post(
    process.env.REACT_APP_CHECKOUT_COM_API_IS_LIVE === 'true' ? '/tokens' : '/tokens/card',
    data
) || {};

export const saveCreditCard = (data) => MagentoAPI.post(
    'checkout/instruments',
    data
) || {};

export const getSavedCards = () => MagentoAPI.get(
    'customers/me/instruments'
) || {};