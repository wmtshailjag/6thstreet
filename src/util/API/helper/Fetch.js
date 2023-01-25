import { getErrorMsg } from './API';
import { store } from "../../../store/index";
import MyAccountDispatcher from "Store/MyAccount/MyAccount.dispatcher"

// eslint-disable-next-line
export const doFetch = async (url, options,  checkUser=false) => {
    try {
        const response = await fetch(url, options);
        const { ok, status } = response;
        const regExpUrl = /verify|send/;

        if (!ok && !url.match(regExpUrl)) {
            const error = getErrorMsg(response);

            if(status === 412 && checkUser) {
                MyAccountDispatcher.logout(null, store.dispatch)
            }

            if (typeof error !== 'object') {
                throw new Error(error);
            } else {
                return error;
            }
        }
        return response.json();
    } catch (e) {
        return { error: e };
    }
};
