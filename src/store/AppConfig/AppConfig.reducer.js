import BrowserDatabase from 'Util/BrowserDatabase';

import { SET_APP_CONFIG } from './AppConfig.action';
import { getCountryFromUrl } from 'Util/Url/Url';

export const APP_CONFIG_CACHE_KEY = 'APP_CONFIG_CACHE_KEY';

export const getInitialState = () => (
    BrowserDatabase.getItem(APP_CONFIG_CACHE_KEY) || {
        config: {},
        edd_info: null,
        suggestionEnabled: true,
        is_exchange_enabled:false,
        ctcReturnEnabled:false,
        is_live_party_enabled:false
    }
);

export const AppConfigReducer = (state = getInitialState(), action) => {
    const {
        type,
        config
    } = action;

    switch (type) {
        case SET_APP_CONFIG:
            const ONE_YEAR_IN_SECONDS = 31536000;
            const getCountryCode = getCountryFromUrl();

            const newState = {
                ...state,
                config,
                edd_info: config.countries[getCountryCode]?.edd_info,
                suggestionEnabled: config.countries[getCountryCode]?.query_suggestion_enabled,
                is_exchange_enabled: config.countries[getCountryCode]?.is_exchange_enabled,
                ctcReturnEnabled: config.countries[getCountryCode]?.is_ctc_return_enabled,
                is_live_party_enabled: config.countries[getCountryCode]?.is_live_party_enabled
            };

            // this will invalidate config after one year
            BrowserDatabase.setItem(
                newState,
                APP_CONFIG_CACHE_KEY,
                ONE_YEAR_IN_SECONDS
            );

            // We do not care about multiple state update,
            // the Redux will not trigger component update
            // because it does shallow compartment
            return newState;

        default:
            return state;
    }
};

export default AppConfigReducer;
