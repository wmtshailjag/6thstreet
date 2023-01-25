/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-globals */


export const FIXED_CURRENCIES = ['BHD', 'KWD', 'OMR'];

export const getFinalPrice = (price, code) => {
    const fixedPrice = FIXED_CURRENCIES.includes(code);
    return fixedPrice && !isNaN(price) ? Number(price).toFixed(3) : price;
};