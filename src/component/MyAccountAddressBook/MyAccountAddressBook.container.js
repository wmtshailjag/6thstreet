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
import isMobile from "Util/Mobile";
import {
  ADD_ADDRESS,
  ADDRESS_POPUP_ID,
} from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import { showPopup } from "Store/Popup/Popup.action";
import { customerType } from "Type/Account";

import MyAccountAddressBook from "./MyAccountAddressBook.component";

export const mapStateToProps = (state) => ({
  customer: state.MyAccountReducer.customer,
  addresses: state.MyAccountReducer.addresses,
});

export const mapDispatchToProps = (dispatch) => ({
  showPopup: (payload) => dispatch(showPopup(ADDRESS_POPUP_ID, payload)),
});

export class MyAccountAddressBookContainer extends PureComponent {
  static propTypes = {
    customer: customerType.isRequired,
    showPopup: PropTypes.func.isRequired,
  };

  state = {
    formContent: false,
  };

  containerFunctions = {
    getDefaultPostfix: this.getDefaultPostfix.bind(this),
    showCreateNewPopup: this.showCreateNewPopup.bind(this),
    openForm: this.openForm.bind(this),
    closeForm: this.closeForm.bind(this),
  };

  componentDidMount() {
    window.onpopstate = (e) => {
      if (document.body.classList.contains("isNewAddressOpen")) {
        this.closeForm();
        history.forward();
        e.preventDefault();
        document.body.classList.remove("isNewAddressOpen");
      }
    };
  }

  openForm() {
    if (isMobile.any()) {
      document.body.classList.add("isNewAddressOpen");
    }
    this.setState({ formContent: true });
  }

  closeForm() {
    this.setState({ formContent: false });
  }

  getDefaultPostfix(address) {
    const { default_billing, default_shipping } = address;
    if (!default_billing && !default_shipping) {
      return "";
    }
    if (default_billing && default_shipping) {
      return __(" - default shipping, billing address");
    }
    if (default_billing) {
      return __(" - default billing address");
    }

    return __(" - default shipping address");
  }

  showCreateNewPopup() {
    const { showPopup } = this.props;

    this.openForm();
    showPopup({
      action: ADD_ADDRESS,
      title: __("Add new address"),
      address: {},
    });
  }

  render() {
    return (
      <MyAccountAddressBook
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
)(MyAccountAddressBookContainer);
