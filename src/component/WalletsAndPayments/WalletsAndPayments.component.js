/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/no-unused-prop-types */
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

import { PureComponent } from "react";
import MyAccountWalletPaymentList from "Component/MyAccountWalletPaymentList";
import { customerType } from "Type/Account";
import { withRouter } from "react-router";
import "./WalletsAndPayments.style.scss";


export class WalletAndPayments extends PureComponent {
  static propTypes = {
    customer: customerType.isRequired,
  };

  static defaultProps = {
    payload: {},
  };

  renderSavedCard = (savedCard, index) => {
    const savedCardIndex = index + 1;
    return (
      <MyAccountWalletPaymentList
        title={null}
        showActions
        savedCard={savedCard}
        key={savedCardIndex}
      />
    );
  };

  renderNoSavedCards() {
    return (
      <div>
        <p>{__("You have no saved cards.")}</p>
      </div>
    );
  }

  renderSavedCardsList() {
    const { savedCards } = this.props;
    if (!savedCards.length) {
      return this.renderNoSavedCards();
    }
    return savedCards.map(this.renderSavedCard);
  }

  render() {
    return (
      <div block="MyAccountAddressBook">
        {this.renderSavedCardsList()}
      </div>
    );
  }
}

export default withRouter(WalletAndPayments);
