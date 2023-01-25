import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import ClubApparelDispatcher, { CLUB_APPAREL } from 'Store/ClubApparel/ClubApparel.dispatcher';
import { ClubApparelMember } from 'Util/API/endpoint/ClubApparel/ClubApparel.type';
import { isDiscountApplied } from 'Util/App';
import BrowserDatabase from 'Util/BrowserDatabase';

import ClubApparel from './ClubApparel.component';

import './ClubApparel.style';

export const mapStateToProps = ({
    ClubApparelReducer: {
        clubApparel,
        isLoading
    },
    Cart: {
        cartTotals
    },
    MyAccountReducer: {
        customer
    }
}) => ({
    clubApparel,
    isLoading,
    cartTotals,
    customer
});

export const mapDispatchToProps = (dispatch) => ({
    toggleClubApparelPoints: (apply, customerId) => ClubApparelDispatcher.toggleClubApparelPoints(
        dispatch,
        apply,
        customerId
    ),
    fetchClubApparelPoints: (id) => ClubApparelDispatcher.getMember(dispatch, id)
});

export class ClubApparelContainer extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        clubApparel: ClubApparelMember.isRequired,
        hideIfZero: PropTypes.bool,
        toggleClubApparelPoints: PropTypes.func.isRequired,
        fetchClubApparelPoints: PropTypes.func.isRequired,
        cartTotals: PropTypes.object.isRequired
    };

    static defaultProps = {
        hideIfZero: false,
        isLoading: false
    };

    state = {
        clubApparelPoints: 0,
        pointsAreApplied: false,
        currency: ''
    };

    static getDerivedStateFromProps(props, state) {
        const {
            clubApparel: { caPointsValue, currency } = {},
            cartTotals
        } = props;
        const {
            clubApparelPoints,
            currency: currentCurrency,
            pointsAreApplied: currentPointsAreApplied
        } = state;
        const newState = {};
        const pointsAreApplied = isDiscountApplied(cartTotals, 'clubapparel');

        if (caPointsValue !== clubApparelPoints) {
            newState.clubApparelPoints = caPointsValue;
        }

        if (currency !== currentCurrency) {
            newState.currency = currency;
        }

        if (pointsAreApplied !== currentPointsAreApplied) {
            newState.pointsAreApplied = pointsAreApplied;
        }

        return Object.keys(newState).length ? newState : null;
    }

    componentDidMount() {
        const { fetchClubApparelPoints, customer: { id } } = this.props;
        fetchClubApparelPoints(id);
    }

    render() {
        const props = {
            ...this.props,
            ...this.state
        };

        return (
            <ClubApparel {...props} />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClubApparelContainer);
