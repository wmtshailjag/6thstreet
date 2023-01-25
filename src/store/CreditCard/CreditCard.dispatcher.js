import { getStore } from "Store";
import { showNotification } from 'Store/Notification/Notification.action';
import { getCardType } from 'Util/API/endpoint/Checkout/Checkout.endpoint';
import { setSavedCards, setSavedCardsLoading, setNewCardVisible } from './CreditCard.action';
import { addNewCreditCard, saveCreditCard, getSavedCards } from 'Util/API/endpoint/CreditCard/CreditCard.enpoint';

export class CreditCardDispatcher {
    /* eslint-disable-next-line */
    async addNewCreditCard(dispatch, data) {
        const { number, expMonth, expYear, cvv } = data;

        return addNewCreditCard({
            type: 'card',
            number,
            expiryMonth: expMonth,
            expiry_month: expMonth,
            expiryyear: expYear,
            expiry_year: expYear,
            cvv
        });
    }

    async getCardType(dispatch, bin) {
        return getCardType({ bin });
    }

    async saveCreditCard(_, data) {
        return saveCreditCard(data);
    }

    async toggleNewCardVisible(dispatch, data) {
        dispatch(setNewCardVisible(data));
    }

    async selectSavedCard(dispatch, entity_id) {
        const { CreditCardReducer: { savedCards } } = getStore().getState();
        let newData = [...savedCards];
        newData.forEach(element => {
            element.selected = element.entity_id === entity_id
        });
        dispatch(setSavedCards([...newData]));
    }

    async getSavedCards(dispatch) {
        dispatch(setSavedCardsLoading(true));
        getSavedCards().then((resp) => {
            let cardsData = [];
            resp.forEach(element => {
                if (element.details && element.details.bin && element.details.scheme) {
                    cardsData.push(element);
                }
            });
            // If length is 1 card is selected by default
            if(cardsData.length === 1){
                cardsData[0].selected = true;
            }
            dispatch(setSavedCards([...cardsData]));
            dispatch(setSavedCardsLoading(false));
            dispatch(setNewCardVisible(cardsData && cardsData.length === 0));
        })
            .catch((err) => {
                dispatch(setNewCardVisible(true));
                dispatch(setSavedCardsLoading(false));
                dispatch(showNotification('error', __('Something went wrong! Please, try again!')));
            })
    }
}

export default new CreditCardDispatcher();
