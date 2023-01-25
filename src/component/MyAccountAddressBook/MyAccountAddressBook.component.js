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

import PropTypes from "prop-types";
import { PureComponent } from "react";

import MyAccountAddressPopup from "Component/MyAccountAddressPopup";
import MyAccountAddressTable from "Component/MyAccountAddressTable";
import { addressType, customerType } from "Type/Account";
import isMobile from "Util/Mobile";
import { withRouter } from "react-router";
import "./MyAccountAddressBook.style";
import { EVENT_MOE_NEW_ADDRESS_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class MyAccountAddressBook extends PureComponent {
  static propTypes = {
    customer: customerType.isRequired,
    formContent: PropTypes.bool.isRequired,
    getDefaultPostfix: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired,
    openForm: PropTypes.func.isRequired,
    showCreateNewPopup: PropTypes.func.isRequired,
    payload: PropTypes.shape({
      address: addressType,
    }),
  };

  static defaultProps = {
    payload: {},
  };

  state = {
    hideCards: false,
  };

  hideCards = () => {
    this.setState({ hideCards: true });
  };

  showCards = () => {
    const { closeForm } = this.props;
    closeForm();
    this.setState({ hideCards: false });
  };

  openNewForm = () => {
    const { showCreateNewPopup, history } = this.props;
    Moengage.track_event(EVENT_MOE_NEW_ADDRESS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: "Address Book",
      app6thstreet_platform: "Web",
    });
    if (isMobile.any()) {
      this.hideCards();
    }
    showCreateNewPopup();
    if (!isMobile.any()) {
      const elmnts =
        document.getElementsByClassName("MyAccountAddressBook-NewAddress") ||
        [];
      if (elmnts && elmnts.length > 0) {
        elmnts[0].scrollIntoView();
      }
    }
  };

  renderPopup() {
    const { formContent, closeForm, openForm, customer } = this.props;

    return (
      <div id="add" block="isNewAddressOpen">
        <MyAccountAddressPopup
          formContent={formContent}
          closeForm={closeForm}
          openForm={openForm}
          showCards={this.showCards}
          customer={customer}
        />
      </div>
    );
  }

  renderAddress = (address, index) => {
    const { getDefaultPostfix, closeForm, openForm } = this.props;
    const addressNumber = index + 1;
    const postfix = getDefaultPostfix(address);

    return (
      <MyAccountAddressTable
        title={__("Address #%s%s", addressNumber, postfix)}
        showActions
        hideCards={this.hideCards}
        address={address}
        key={addressNumber}
        closeForm={closeForm}
        openForm={openForm}
      />
    );
  };

  renderNoAddresses() {
    return (
      <div>
        <p>{__("You have no configured addresses.")}</p>
      </div>
    );
  }

  renderActions() {
    return (
      <button
        block="MyAccountAddressBook"
        elem="NewAddress"
        onClick={this.openNewForm}
      >
        {__("Add new address")}
      </button>
    );
  }

  renderAddressList() {
    const { addresses } = this.props;
    if (!addresses.length) {
      return this.renderNoAddresses();
    }
    const defaultAddress = addresses.filter(
      ({ default_billing }) => default_billing
    );
    const simpleAddresses = addresses.filter(
      ({ default_billing }) => !default_billing
    );
    const sortedAddresses = [...defaultAddress, ...simpleAddresses];

    return sortedAddresses.map(this.renderAddress);
  }

  render() {
    const { hideCards } = this.state;

    if (hideCards) {
      return (
        <div block="MyAccountAddressBook">
          <button
            block="MyAccountAddressBook"
            elem="backBtn"
            onClick={this.showCards}
          />
          {this.renderPopup()}
        </div>
      );
    }

    return (
      <div block="MyAccountAddressBook">
        {this.renderAddressList()}
        {this.renderActions()}
        {this.renderPopup()}
      </div>
    );
  }
}

export default withRouter(MyAccountAddressBook);
