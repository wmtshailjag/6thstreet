import MobileAPI from '../../provider/MobileAPI';

export const getMember = (customerId) => MobileAPI.get(
    `/club-apparel/members/${ customerId }`
) || {};

export const linkAccount = (data) => {
    return MobileAPI.post( '/club-apparel/link', data) || {}
}

export const verifyOtp = (data) => MobileAPI.post(
    '/club-apparel/verify',
    data
) || {};

export const applyPoints = (cartId, points, pointValue) => MobileAPI.post(
    `/carts2/${ cartId }/club-apparel`,
    { loyaltyPointsValue: points, loyaltyBalanceValue: pointValue }
) || {};

export const removePoints = (cartId) => MobileAPI.delete(
    `/carts2/${ cartId }/club-apparel`
) || {};
