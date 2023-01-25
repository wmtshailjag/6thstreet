import { getStore } from "Store";
import { getMobileAuthorizationToken } from "Util/Auth";

import { doFetch } from '../helper/Fetch';
import { getQueryParam } from "Util/Url";

class MobileAPI {
    async _fetch(method, relativeURL, body = {}) {
        // TODO: get proper locale
        const token = getMobileAuthorizationToken();
        const { AppState: { locale } } = getStore().getState();
        const localePrefix = relativeURL.indexOf('?') >= 0 ? '&' : '?';
        const url = `/api/${relativeURL}${localePrefix}locale=${locale}`
            .replace(/([^:]\/)\/+/g, '$1'); // this replaces // to /

        const payload = (value) => (['post', 'put', 'delete'].includes(method) ? value : {});
        const Apptoken = getQueryParam("token", location);
        const tokenHeader = Apptoken ? { 'X-API-Token': Apptoken } : token ? { 'X-API-Token': token } : {};
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Version': '2.23.0',
                'Request-Source': 'PWA',
                ...tokenHeader
            },
            ...payload({ body: JSON.stringify(body) })
        };

        return doFetch(url, options, true);
    }

    post(url, data) {
        return this._fetch('post', url, data);
    }

    get(url) {
        return this._fetch('get', url);
    }

    delete(url) {
        return this._fetch('delete', url);
    }

    put(url, data) {
        return this._fetch('put', url, data);
    }
}

export default new MobileAPI();
