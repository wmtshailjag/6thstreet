/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-magic-numbers */
/* eslint-disable radix */
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { PureComponent } from 'react';
import { getCardType } from 'Util/Common';
import cardValidator from 'card-validator';

import CreditCard from './CreditCard.component';
import { MINI_CARDS } from './CreditCard.config';
import CreditCardDispatcher from "Store/CreditCard/CreditCard.dispatcher";

export const mapStateToProps = (state) => ({
    customer: state.MyAccountReducer.customer,
    savedCards: state.CreditCardReducer.savedCards,
    newCardVisible: state.CreditCardReducer.newCardVisible,
    loadingSavedCards: state.CreditCardReducer.loadingSavedCards,
});

export const mapDispatchToProps = (dispatch) => ({
    getSavedCards: () => CreditCardDispatcher.getSavedCards(dispatch),
    selectSavedCard: (entity_id) => CreditCardDispatcher.selectSavedCard(dispatch, entity_id),
    toggleNewCardVisible: (value) => CreditCardDispatcher.toggleNewCardVisible(dispatch, value)
});
export class CreditCardContainer extends PureComponent {
    static propTypes = {
        setCreditCardData: PropTypes.func.isRequired
    };

    state = {
        isAmex: false
    };

    containerFunctions = {
        expDateValidator: this.expDateValidator,
        isNumber: this.isNumber,
        reformatInputField: this.reformatInputField.bind(this),
        getCardLogo: this.getCardLogo.bind(this),
        toggleNewCardVisible: this.toggleNewCardVisible.bind(this),
        selectSavedCard: this.selectSavedCard.bind(this),
        cardNumberValidator: this.cardNumberValidator
    };

    containerProps = () => {
        const { isAmex } = this.state;

        return { isAmex };
    };

    componentDidMount() {
        const { customer, toggleNewCardVisible, getSavedCards } = this.props;
        if (customer && customer.id) {
            getSavedCards();
        } else {
            toggleNewCardVisible(true);
        }
    }

    isNumber(value) {
        const stringVal = value.toString() || '';
        const lastInput = stringVal.charAt(stringVal.length - 1);
        if (lastInput === '.') {
            return false;
        }

        return !isNaN(-value);
    }

    format(value = '', spacePosition, expInput) {
        const regex = new RegExp(`(.{${spacePosition}})`, 'g');

        if (expInput) {
            return value.replace(/[^\dA-Z]/gi, '')
                .toUpperCase()
                .replace(regex, '$1/')
                .replace(/^\|+|\/+$/g, '');
        }

        if (getCardType(value).type === 'american-express') {
            return value.replace(/[^\dA-Z]/gi, '')
                .toUpperCase()
                .replace(/^(\d{4})/, '$1 ')
                .replace(/(\s\d{6})/, '$1 ')
                .trim();
        }

        return value.replace(/[^\dA-Z]/gi, '')
            .toUpperCase()
            .replace(regex, '$1 ')
            .trim();
    }

    countSpaces(text = '', expInput) {
        if (expInput) {
            return text.includes('/') ? 1 : 0;
        }

        const spaces = text.match(/(\s+)/g);
        return spaces ? spaces.length : 0;
    }

    reformatInputField(element, spacePosition) {
        const expInput = spacePosition === 2;
        const onlyNumbers = expInput ? element.value.replace('/', '') : element.value.replace(/\s/g, '');

        if (!this.isNumber(onlyNumbers)) {
            element.value = element.value.slice(0, -1);
            return;
        }

        const position = element.selectionEnd;
        const previousValue = element.value || '';
        element.value = this.format(element.value, spacePosition, expInput);

        if (position !== previousValue.length) {
            const beforeCaret = previousValue.substr(0, position);
            const countPrevious = this.countSpaces(beforeCaret, expInput);
            const countCurrent = this.countSpaces(this.format(beforeCaret, spacePosition, expInput), expInput);
            element.selectionEnd = position + (countCurrent - countPrevious);
        }
    }

    expDateValidator(isMonth, value = '') {
        if (isMonth && !cardValidator.expirationMonth(value).isValid) {
            return __("Card exp month is not valid");
        } else if (!cardValidator.expirationYear(value).isValid) {
            return __("Card exp year is not valid");
        }
        return null;
    }

    cardNumberValidator(value = '') {
        if (value && value.length >= 15) {
            if (!cardValidator.number(value.replace(/\D+/g, '')).isValid) {
                return __("Card number is not valid");
            }
        }

        return null;
    }

    getCardLogo(numbers) {
        const { visa, mastercard, amex } = MINI_CARDS;
        const first = parseInt(numbers.charAt(0));
        const second = parseInt(numbers.charAt(1));

        if (first === 4) {
            return visa;
        }

        if (first === 5) {
            return mastercard;
        }

        if (first === 3 && (second === 4 || second === 7)) {
            this.setState({ isAmex: true });
            return amex;
        }

        this.setState({ isAmex: false });

        return null;
    }

    toggleNewCardVisible(value) {
        this.props.toggleNewCardVisible(value);
    }

    selectSavedCard(entity_id) {
        this.props.selectSavedCard(entity_id);
    }

    render() {
        const { setCreditCardData } = this.props;
        return (
            <CreditCard
                setCreditCardData={setCreditCardData}
                {...this.containerFunctions}
                {...this.containerProps()}
                {...this.props}
            />
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreditCardContainer);
