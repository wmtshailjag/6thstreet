export const getCountriesForSelect = (config) => {
    const { countries = {} } = config;

    const countryMap = {
        AE: __('UAE'),
        SA: __('Saudi Arabia'),
        KW: __('Kuwait'),
        OM: __('Oman'),
        BH: __('Bahrain'),
        QA: __('Qatar')
    };

    // TODO ask if this has endpoint, take from M2
    // const allowedCountries = ['AE', 'SA', 'KW'];

    return Object.keys(countries).map((value = '') => ({
        id: value,
        value,
        label: countryMap[value.toUpperCase()]
    }));
};

export const getCountryLocaleForSelect = (config, country) => {
    const languageMap = {
        en: __('English'),
        ar: __('Arabic')
    };

    const { countries } = config;
    const defaultValue = { locales: Object.keys(languageMap) };

    // Return all keys, if language is not yet defined
    const { locales = [] } = countries[country] || defaultValue;

    return locales.map((locale = '') => {
        const language = locale.slice(0, 2).toLowerCase();

        return {
            label: languageMap[language],
            id: language,
            value: language
        };
    });
};

export const indexConfig = async (config) => {
    const { countries = [] } = await config;

    return {
        ...await config,
        countries: countries.reduce((acc, country) => {
            const { value } = country;
            acc[value] = country;
            return acc;
        }, {})
    };
};
