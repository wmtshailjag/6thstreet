import { getIndex } from './index';
import { translate } from '../config/translations';
import { CURRENCY_STRIP_INSIGNIFICANT_ZEROS } from '../config';
import i18n from 'i18n-js';
import { getCountryCurrencyCode } from 'Util/Url/Url';

const getLabel = (facetKey, lang) => {
  switch (facetKey) {
    case 'brand_name':
      return translate('brands', lang);
    case 'categories.level1':
      return translate('categories', lang);
    case 'categories.level2':
      return translate('subcategories', lang);
    case 'colorfamily':
      return translate('colours', lang);
    case 'gender':
      return translate('gender', lang);
    case 'heel_height':
      return translate('heel_height', lang);
    case 'toe_shape':
      return translate('toe_shape', lang);
    case 'sizes':
      return translate('sizes', lang);
    case 'size_eu':
      return translate('size_eu', lang);
    case 'size_uk':
      return translate('size_uk', lang);
    case 'size_us':
      return translate('size_us', lang);

    default:
      return '';
  }
};

const getFacetSlug = (facetKey) => {
  // TODO: slugify
  return facetKey;
};

const getFacetLabel = (facetValue) => {
  return facetValue.includes('///')
    ? facetValue.substring(facetValue.lastIndexOf('///') + 4)
    : facetValue;
};

const getIndexBySort = (sortName, env = 'production', locale = 'en-ae') => {
  switch (sortName) {
    case 'recommended':
      return getIndex(locale, env, 'default');
    case 'latest':
      return getIndex(locale, env, 'latest');
    case 'discount':
      return getIndex(locale, env, 'discount');
    case 'price_low':
      return getIndex(locale, env, 'price_low');
    case 'price_high':
      return getIndex(locale, env, 'price_high');
    default:
      return getIndex(locale, env, 'default');
  }
};

const formatPrice = (value = 0, currency = getCountryCurrencyCode()) => {
  try {
    const priceStrip = CURRENCY_STRIP_INSIGNIFICANT_ZEROS.includes(currency);

    return i18n.toCurrency(value, {
      precision: 3,
      unit: currency,
      strip_insignificant_zeros: priceStrip,
      format: '%u %n',
      delimiter: ',',
      separator: '.'
    });
  } catch (err) {
    return `-1`;
  }
};

export { getLabel, getFacetSlug, getFacetLabel, getIndexBySort, formatPrice };
