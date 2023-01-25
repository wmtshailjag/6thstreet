import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MobileAPI from '../../provider/MobileAPI';

export const getStoreCredit = () => MagentoAPI.get('returns/storecredit') || {};

export const applyStoreCredit = (cartId) => MobileAPI.post(
    `/carts2/${ cartId }/store-credit`,
    { cartId }
) || {};

export const removeStoreCredit = (cartId) => MobileAPI.delete(
    `carts2/${ cartId }/store-credit`,
    { cartId }
) || {};
