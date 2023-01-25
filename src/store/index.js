import {
    combineReducers,
    createStore,
    applyMiddleware
} from 'redux';

import {
    staticReducers as sourceStaticReducers
} from 'SourceStore';
import ClubApparelReducer from 'Store/ClubApparel/ClubApparel.reducer';
import MenuReducer from 'Store/Menu/Menu.reducer';
import StoreCreditReducer from 'Store/StoreCredit/StoreCredit.reducer';
import CreditCardReducer from 'Store/CreditCard/CreditCard.reducer';
import logger from "redux-logger";

export const staticReducers = {
    ...sourceStaticReducers,
    StoreCreditReducer,
    ClubApparelReducer,
    MenuReducer,
    CreditCardReducer
};

const middlewares = [logger];

export function createReducer(asyncReducers) {
    return combineReducers({
        ...staticReducers,
        ...asyncReducers
    });
}

export const store = createStore(
    createReducer(),
    (process.env.NODE_ENV === 'development' && applyMiddleware(...middlewares))
    // ( // enable Redux dev-tools only in development
    //     process.env.NODE_ENV === 'development'
    //     && window.__REDUX_DEVTOOLS_EXTENSION__
    // ) && window.__REDUX_DEVTOOLS_EXTENSION__({
    //     trace: true
    // })
);

// Configure the store
export default function configureStore() {
    // Add a dictionary to keep track of the registered async reducers
    store.asyncReducers = {};

    // Create an inject reducer function
    // This function adds the async reducer, and creates a new combined reducer
    store.injectReducer = (key, asyncReducer) => {
        store.asyncReducers[key] = asyncReducer;
        store.replaceReducer(createReducer(store.asyncReducers));
    };

    // Return the modified store
    return store;
}

export function getStore() {
    return store;
}
