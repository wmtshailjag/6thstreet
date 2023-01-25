/* eslint-disable react/no-unused-state */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { customerType } from "Type/Account";
import CreditCardDispatcher from "Store/CreditCard/CreditCard.dispatcher";
import WalletsAndPayments from "./WalletsAndPayments.component";

export const mapStateToProps = (state) => ({
  customer: state.MyAccountReducer.customer,
  savedCards: state.CreditCardReducer.savedCards,
});

export const mapDispatchToProps = (dispatch) => ({
  getSavedCards: () => CreditCardDispatcher.getSavedCards(dispatch),
});

export class WalletsAndPaymentsContainer extends PureComponent {
  static propTypes = {
    customer: customerType.isRequired,
    savedCards: PropTypes.isRequired,
  };

  componentDidMount() {
    const { customer, getSavedCards } = this.props;
        if (customer && customer.id) {
            getSavedCards();
        }
  }

  render() {
    return (
      <WalletsAndPayments
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletsAndPaymentsContainer);
