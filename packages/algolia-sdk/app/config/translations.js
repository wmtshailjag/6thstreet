const translations = {
  en: {
    sizes: 'Sizes',
    sort_by: 'Sort by',
    our_picks: 'Our Picks',
    latest: 'Latest',
    highest_discount: 'Highest Discount',
    price_low: 'Prices (low first)',
    price_high: 'Prices (high first)',
    price_range: 'Price Range',
    discount: 'Discount',
    brands: 'Brands',
    categories: 'Categories',
    subcategories: 'Subcategories',
    colours: 'Colours',
    gender: 'Gender',
    heel_height: 'Heel Height',
    toe_shape: 'Toe Shape',
    and_above: 'and above',
    new_in: 'New In',
    size_eu: 'Size EU',
    size_uk: 'Size UK',
    size_us: 'Size US',

    women: 'Women',
    men: 'Men',
    kids: 'Kids',
    girl: 'Girl',
    boy: 'Boy',
    baby_girl: 'Baby Girl',
    baby_boy: 'Baby Boy',
    unisex: 'Unisex',
    infant: 'Infant'
  },

  ar: {
    sizes: 'المقاسات',
    sort_by: 'التصنيف حسب',
    our_picks: 'اخترنا لك',
    latest: 'آخر',
    highest_discount: 'أعلى خصم',
    price_low: 'السعر (الأقل أولاً)',
    price_high: 'السعر (الأعلى أولاً)',
    price_range: 'السعر',
    discount: 'خصم',
    brands: 'الماركات',
    categories: 'الفئة',
    subcategories: 'لأقسام الفرعية',
    colours: 'ألوان',
    gender: 'الجنس',
    heel_height: '"علو الكعب',
    toe_shape: 'شكل اصبع',
    and_above: 'وما فوق',
    new_in: 'وصلنا حديثا',
    size_eu: 'المقاسات الأوروبية',
    size_uk: 'المقاسات البريطانية',
    size_us: 'المقاسات الامريكية',
    women: 'نساء',
    men: 'رجال',
    kids: 'أطفال',
    girl: 'بنات',
    boy: 'أولاد',
    baby_girl: 'طفلة',
    baby_boy: 'طفل',
    unisex: 'الجنسين',
    infant: 'للرضع'
  }
};

function translate(word, lang = 'en') {
  return translations[lang][word] || '';
}

export { translations, translate };
