import { getStore } from 'Store';
import { getAuthorizationToken } from 'Util/Auth';

import { doFetch } from '../helper/Fetch';
import { merge } from '../helper/Object';

class MagentoAPI {
    makeRequest(type, pathname, body, userOptions={}) {
        const defaults = {
            method: type,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Version': '2.23.0',
                'Request-Source': 'PWA'
            }
        };

        const options = merge(defaults, userOptions);

        const token = getAuthorizationToken();

        if (token) {
            // If customer is signed in, use his token
            options.headers.Authorization = `Bearer ${token}`;
        }

        if (body) {
            // Handle POST requests
            options.body = JSON.stringify(body);
        }

        const { AppState: { locale } } = getStore().getState();
        const url = `/rest/${locale}/${ pathname}`;

        return doFetch(url, options);
    }

    get(url) {
        return this.makeRequest('get', url);
    }

    delete(url, body) {
        return this.makeRequest('delete', url, body);
    }

    post(url, body, options) {
        return this.makeRequest('post', url, body, options);
    }
}

export default new MagentoAPI();
