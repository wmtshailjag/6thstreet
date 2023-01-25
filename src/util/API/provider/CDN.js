import { doFetch } from '../helper/Fetch';

class CDN {
    get(someUrl) {
        // const relativeUrl = someUrl.replace('https://mobilecdn.6thstreet.com/', '/');
        const CDN_BASE_URL = process.env.REACT_APP_CDN_API_URL;
        // const url = `/cdn/${relativeUrl}`.replace(/([^:]\/)\/+/g, '$1'); // this replaces // to /

        const options = {
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        };

        return doFetch(`${CDN_BASE_URL}${someUrl}`, options);
    }
}

export default new CDN();
