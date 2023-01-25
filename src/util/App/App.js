import { APP_CONFIG_CACHE_KEY } from 'Store/AppConfig/AppConfig.reducer';
import { APP_STATE_CACHE_KEY } from 'Store/AppState/AppState.reducer';
import BrowserDatabase from 'Util/BrowserDatabase';

export const getCurrency = () => {
    const { country } = BrowserDatabase.getItem(APP_STATE_CACHE_KEY) || {};
    const { config: { countries = {} } = {} } = BrowserDatabase.getItem(APP_CONFIG_CACHE_KEY) || {};
    const { currency } = countries[country] || {};

    return currency || '';
};

export const getDiscountFromTotals = (totalSegments, totalsCode) => {
    const { value } = totalSegments.find(({ code }) => code === totalsCode) || { value: 0 };

    return value;
};

export const isDiscountApplied = (cartTotals, totalsCode) => {
    const { total_segments: totals = [] } = cartTotals || {};
    const value = getDiscountFromTotals(totals, totalsCode);

    return !!(value && value !== 0);
};

export const isArabic = () => (BrowserDatabase.getItem(APP_STATE_CACHE_KEY)
    ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY).language === 'ar'
    : false);

export const capitalize = (s = '') => s && s[0].toUpperCase() + s.slice(1);

export const truncate = (input, max) => input.length > max ? `${input.substring(0, max)}...` : input;

export default {};
