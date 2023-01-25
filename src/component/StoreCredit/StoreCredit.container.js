import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import StoreCreditDispatcher, { STORE_CREDIT } from 'Store/StoreCredit/StoreCredit.dispatcher';
import { StoreCreditData } from 'Util/API/endpoint/StoreCredit/StoreCredit.type';
import { isDiscountApplied } from 'Util/App';
import BrowserDatabase from 'Util/BrowserDatabase';

import StoreCredit from './StoreCredit.component';

import './StoreCredit.style';

export const mapStateToProps = ({
    StoreCreditReducer: {
        storeCredit,
        isLoading
    },
    Cart: {
        cartTotals
    }
}) => ({
    storeCredit,
    isLoading,
    cartTotals
});

export const mapDispatchToProps = (dispatch) => ({
    toggleStoreCredit: (apply) => StoreCreditDispatcher.toggleStoreCredit(dispatch, apply),
    fetchStoreCredit: () => StoreCreditDispatcher.getStoreCredit(dispatch)
});

export class StoreCreditContainer extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        storeCredit: StoreCreditData.isRequired,
        canApply: PropTypes.bool,
        hideIfZero: PropTypes.bool,
        toggleStoreCredit: PropTypes.func.isRequired,
        fetchStoreCredit: PropTypes.func.isRequired,
        cartTotals: PropTypes.object.isRequired
    };

    static defaultProps = {
        canApply: false,
        hideIfZero: false,
        isLoading: false
    };

    state = {
        storeCreditBalance: null,
        creditIsApplied: false
    };

    static getDerivedStateFromProps(props, state) {
        const { storeCredit: { current_balance: storeCreditBalance } = {}, cartTotals } = props;
        const { storeCreditBalance: currentStoreCreditBalance, creditIsApplied: currentCreditIsApplied } = state;
        const newState = {};
        const creditIsApplied = isDiscountApplied(cartTotals, 'customerbalance');

        if (storeCreditBalance !== currentStoreCreditBalance) {
            newState.storeCreditBalance = storeCreditBalance;
        }

        if (creditIsApplied !== currentCreditIsApplied) {
            newState.creditIsApplied = creditIsApplied;
        }

        return Object.keys(newState).length ? newState : null;
    }

    componentDidMount() {
        const dbStoreCredit = BrowserDatabase.getItem(STORE_CREDIT) || null;
        const { fetchStoreCredit } = this.props;

        if (!dbStoreCredit) {
            fetchStoreCredit();
        }
    }

    render() {
        const props = {
            ...this.props,
            ...this.state
        };

        return (
            <StoreCredit { ...props } />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreCreditContainer);
