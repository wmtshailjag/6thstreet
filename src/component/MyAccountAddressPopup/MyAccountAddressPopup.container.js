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

import MyAccountQuery from "Query/MyAccount.query";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import { goToPreviousNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { showNotification } from "Store/Notification/Notification.action";
import { setAddressLoadingStatus } from "Store/MyAccount/MyAccount.action";
import { hideActiveOverlay } from "Store/Overlay/Overlay.action";
import { addressType } from "Type/Account";
import { capitalize } from "Util/App";
import { fetchMutation } from "Util/Request";

import MyAccountAddressPopup from "./MyAccountAddressPopup.component";
import { ADDRESS_POPUP_ID } from "./MyAccountAddressPopup.config";

export const MyAccountDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/MyAccount/MyAccount.dispatcher"
);

export const mapStateToProps = (state) => ({
  payload: state.PopupReducer.popupPayload[ADDRESS_POPUP_ID] || {},
});

export const mapDispatchToProps = (dispatch) => ({
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
  showErrorNotification: (error) =>
    dispatch(showNotification("error", error[0].message)),
  showSuccessNotification: (message) =>
    dispatch(showNotification("success", message)),
  updateCustomerDetails: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.requestCustomerData(dispatch)
    ),
  goToPreviousHeaderState: () =>
    dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
  // eslint-disable-next-line max-len
  validateAddress: (address) =>
    CheckoutDispatcher.validateAddress(dispatch, address),
  addAddress: (address) => CheckoutDispatcher.addAddress(dispatch, address),
  updateAddress: (address_id, address) =>
    CheckoutDispatcher.updateAddress(dispatch, address_id, address),
  removeAddress: (id) => CheckoutDispatcher.removeAddress(dispatch, id),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  setAddressLoadingStatus: (status) =>
    dispatch(setAddressLoadingStatus(status)),
});

export class MyAccountAddressPopupContainer extends PureComponent {
  static propTypes = {
    showErrorNotification: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    updateCustomerDetails: PropTypes.func.isRequired,
    showCards: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    goToPreviousHeaderState: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired,
    payload: PropTypes.shape({
      address: addressType,
    }),
    validateAddress: PropTypes.func.isRequired,
  };

  static defaultProps = {
    payload: {},
  };

  state = {
    isLoading: false,
  };

  containerFunctions = {
    handleAddress: this.handleAddress.bind(this),
    handleDeleteAddress: this.handleDeleteAddress.bind(this),
  };

  handleAfterAction = () => {
    const {
      hideActiveOverlay,
      updateCustomerDetails,
      showErrorNotification,
      goToPreviousHeaderState,
      closeForm,
      setAddressLoadingStatus
    } = this.props;

    updateCustomerDetails().then(() => {
      this.setState({ isLoading: false }, () => {
        hideActiveOverlay();
        goToPreviousHeaderState();
        closeForm();
        setAddressLoadingStatus(false);
      });
    }, showErrorNotification);
  };

  handleError = (error) => {
    const { showErrorNotification } = this.props;
    showErrorNotification(error);
    this.setState({ isLoading: false });
  };

  validateAddress(address) {
    const {
      country_id,
      region: { region, region_id },
      city,
      telephone = "",
      street,
      phonecode = "",
    } = address;
    const { validateAddress } = this.props;

    return validateAddress({
      area: region ?? region_id,
      city,
      country_code: country_id,
      phone: phonecode + telephone,
      postcode: region ?? region_id,
      region: region ?? region_id,
      street: Array.isArray(street) ? street[0] : street,
    });
  }

  handleValidationError(response) {
    const { showNotification } = this.props;

    const { parameters, message = "" } = response;
    const formattedParams = parameters ? capitalize(parameters[0]) : "Address";

    showNotification(
      "error",
      `${formattedParams} ${__("is not valid")}. ${message}`
    );
  }

  handleAddress(address) {
    const {
      payload: {
        address: { id },
      },
    } = this.props;
    const { showNotification, setAddressLoadingStatus } = this.props;

    const validationResult = this.validateAddress(address);
    setAddressLoadingStatus(true);
    if (!validationResult) {
      showNotification("error", __("Something went wrong."));
    }

    validationResult.then((response) => {
      const { success } = response;

      if (success) {
        const elmnts = document.getElementsByClassName("MyAccount-Heading");

        if (elmnts && elmnts.length > 0) {
          elmnts[0].scrollIntoView({ behavior: "smooth", block: "end" });
        }

        if (id) {
          return this.handleEditAddress(address);
        }

        return this.handleCreateAddress(address);
      }

      return this.handleValidationError(response);
    });
  }

  handleEditAddress(address) {
    const {
      showCards,
      payload: {
        address: { id },
      },
      updateAddress,
    } = this.props;
    const { newAddress } = this.getNewAddressField(address);
    newAddress.id = id;
    const apiResult = updateAddress(id, newAddress);

    if (apiResult) {
      apiResult.then(this.handleAfterAction, this.handleError).then(showCards);
    }
  }

  async handleDeleteAddress() {
    const {
      showCards,
      payload: {
        address: { id, default_billing, default_shipping },
      },
      removeAddress,
    } = this.props;

    if (default_shipping || default_billing) {
      this.setState({ isLoading: true });
      const deleteApiResult = removeAddress(id);
      deleteApiResult
        .then(this.handleAfterAction, this.handleError)
        .then(showCards);
      return;
    }

    this.setState({ isLoading: true });
    const deleteApiResult = removeAddress(id);
    deleteApiResult
      .then(this.handleAfterAction, this.handleError)
      .then(showCards);
  }

  handleCreateAddress(address) {
    const { showCards, addAddress } = this.props;
    const { newAddress } = this.getNewAddressField(address);
    const apiResult = addAddress(newAddress);
    if (apiResult) {
      apiResult.then(this.handleAfterAction, this.handleError).then(showCards);
    }
  }

  getNewAddressField(address) {
    const {
      default_shipping,
      postcode,
      country_id,
      firstname,
      lastname,
      street,
      city,
      telephone,
    } = address;
    const newAddress = {
      firstname: firstname,
      lastname: lastname,
      street: street,
      city: city,
      area: postcode,
      phone: telephone,
      country_code: country_id,
      default_shipping: default_shipping,
    };
    return { newAddress };
  }

  render() {
    return (
      <MyAccountAddressPopup
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
)(MyAccountAddressPopupContainer);
