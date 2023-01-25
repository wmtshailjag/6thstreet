import MobileAPI from '../../provider/MobileAPI';

export const getPromo = (fileName) => {
    const url = !fileName ? '/app-promo' : `/app-promo?json=${fileName}`;
    return MobileAPI.get(url) || {};
};

export const addPromoKitToCart = (data = {}) => (
    MobileAPI.post('/promo-kits', data)
);
