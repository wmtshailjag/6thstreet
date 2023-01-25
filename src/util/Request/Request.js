/* eslint-disable @scandipwa/scandipwa-guidelines/create-config-files */
/* eslint-disable no-console */

import { getStore } from 'Store';
import {
    formatURI,
    getFetch,
    GRAPHQL_URI,
    HTTP_201_CREATED,
    HTTP_410_GONE,
    parseResponse,
    postFetch,
    putPersistedQuery
} from 'Util/Request/Request';

export {
    GRAPHQL_URI,
    getStoreCodePath,
    appendTokenToHeaders,
    formatURI,
    getFetch,
    putPersistedQuery,
    postFetch,
    checkForErrors,
    handleConnectionError,
    parseResponse,
    HTTP_410_GONE,
    HTTP_201_CREATED,
    listenForBroadCast,
    debounce
} from 'SourceUtil/Request/Request';

// Proxy to locale based store
export const getGraphqlEndpoint = () => {
    const { AppState: { locale } } = getStore().getState();
    return `${ GRAPHQL_URI }/${ locale }`;
};

export const executeGet = (queryObject, name, cacheTTL) => {
    const { query, variables } = queryObject;
    const uri = formatURI(query, variables, getGraphqlEndpoint());

    return parseResponse(new Promise((resolve) => {
        getFetch(uri, name).then((res) => {
            if (res.status === HTTP_410_GONE) {
                putPersistedQuery(getGraphqlEndpoint(), query, cacheTTL).then((putResponse) => {
                    if (putResponse.status === HTTP_201_CREATED) {
                        getFetch(uri, name).then((res) => resolve(res));
                    }
                });
            } else {
                resolve(res);
            }
        });
    }));
};

export const executePost = (queryObject) => {
    const { query, variables } = queryObject;
    return parseResponse(postFetch(getGraphqlEndpoint(), query, variables));
};
