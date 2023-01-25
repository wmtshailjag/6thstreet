export const SET_COUNTRY = 'SET_COUNTRY';
export const SET_COUNTRY_FOR_WELCOME = 'SET_COUNTRY_FOR_WELCOME';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_LANGUAGE_FOR_WELCOME = 'SET_LANGUAGE_FOR_WELCOME';

export const SET_GENDER = 'SET_GENDER';
export const SET_LOCALE = 'SET_LOCALE';
export const SET_PDP_WIDGET_DATA = 'SET_PDP_WIDGET_DATA';

export const setCountry = (country) => ({
    type: SET_COUNTRY,
    country
});

export const setCountryForWelcome = (country) => ({
    type: SET_COUNTRY_FOR_WELCOME,
    country
});

export const setLanguage = (language) => ({
    type: SET_LANGUAGE,
    language
});

export const setLanguageForWelcome = (language) => ({
    type: SET_LANGUAGE_FOR_WELCOME,
    language
});

export const setGender = (gender) => {
    const maxAge = 86400 * 90; // 1 Day * 90
    if(gender === "all"){
        document.cookie = `gender=; max-age=${maxAge}; path=/`;
    }else{
        document.cookie = `gender=${gender}.html; max-age=${maxAge}; path=/`;
    }
    return ({
        type: SET_GENDER,
        gender
    });
};

export const setLocale = (locale) => ({
    type: SET_LOCALE,
    locale
});

export const setPdpWidgetsData = (pdpWidgetsData) => ({
    type: SET_PDP_WIDGET_DATA,
    pdpWidgetsData
})
