/* eslint-disable no-magic-numbers */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { PureComponent } from "react";
import PropTypes from "prop-types";
import history from "Util/History";

import CheckoutAddressBook from "Component/CheckoutAddressBook";
import Form from "Component/Form";
import MyAccountAddressPopup from "Component/MyAccountAddressPopup";
import { SHIPPING_STEP } from "Route/Checkout/Checkout.config";
import { customerType } from "Type/Account";
import { isArabic } from "Util/App";
import { isSignedIn } from "Util/Auth";
import isMobile from "Util/Mobile";
import { getCountryFromUrl } from "Util/Url/Url";
import {
  ADDRESS_POPUP_ID,
  ADD_ADDRESS,
} from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import { connect } from "react-redux";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import { showPopup } from "Store/Popup/Popup.action";
import { HistoryType } from "Type/Common";
import "./PickUpAddress.style";

export const mapDispatchToProps = (dispatch) => ({
  showPopup: (payload) => dispatch(showPopup(ADDRESS_POPUP_ID, payload)),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  validateAddress: (address) =>
    CheckoutDispatcher.validateAddress(dispatch, address),
  // eslint-disable-next-line max-len
});

export const mapStateToProps = (state) => ({
  customer: state.MyAccountReducer.customer,
  addresses: state.MyAccountReducer.addresses,
  eddResponse: state.MyAccountReducer.eddResponse,
  edd_info: state.AppConfig.edd_info,
  addressCityData: state.MyAccountReducer.addressCityData,
  totals: state.CartReducer.cartTotals,
});
export class PickUpAddress extends PureComponent {
  static propTypes = {
    customer: customerType.isRequired,
    showCreateNewPopup: PropTypes.func.isRequired,
    history: HistoryType.isRequired,
  };

  state = {
    isArabic: isArabic(),
    formContent: false,
    isSignedIn: isSignedIn(),
    isMobile: isMobile.any() || isMobile.tablet(),
    openFirstPopup: false,
    renderLoading: false,
    isButtondisabled: false,
    selectedAddressId: null,
  };

  componentDidMount() {
    const { isSignedIn } = this.state;
    if (!isSignedIn) {
      history.push("/");
    }
    const {
      location: { state },
    } = history;
    if (state && state.orderDetails) {
      const {
        orderDetails: {
          shipping_address: { customer_address_id },
        },
      } = state;

      this.onAddressSelect(
        customer_address_id
          ? parseInt(customer_address_id)
          : customer_address_id
      );
    }
  }
  renderButtonsPlaceholder() {
    return __("Proceed");
  }

  renderActions() {
    const { selectedAddressId } = this.state;
    return (
      <div block="Checkout" elem="StickyButtonWrapper">
        <button
          type="submit"
          block={"Button"}
          form={SHIPPING_STEP}
          disabled={!selectedAddressId ? true : false}
          mix={{
            block: "CheckoutShipping",
            elem: "Button",
          }}
        >
          {this.renderButtonsPlaceholder()}
        </button>
      </div>
    );
  }

  openForm() {
    const { showPopup } = this.props;

    this.setState({ formContent: true });
    showPopup({
      action: ADD_ADDRESS,
      title: __("Add new address"),
      address: {},
    });
  }

  closeForm = () => {
    const { showPopup } = this.props;
    const { isMobile } = this.state;

    this.setState({ formContent: false });
    if (isMobile) {
      showPopup({});
    }
  };

  renderAddAdress() {
    const { formContent, isArabic } = this.state;
    const { customer } = this.props;
    return (
      <div
        block="MyAccountAddressBook"
        elem="ContentWrapper"
        mods={{ formContent }}
      >
        <button
          block="MyAccountAddressBook"
          elem="backButton"
          mods={{ isArabic }}
          onClick={this.showCards}
        />
        <MyAccountAddressPopup
          formContent={formContent}
          closeForm={this.closeForm}
          openForm={this.openForm}
          showCards={this.showCards}
          customer={customer}
        />
      </div>
    );
  }

  hideCards = () => {
    this.setState({ hideCards: true });
  };

  showCards = () => {
    this.closeForm();
    this.setState({ hideCards: false });
  };

  showCreateNewPopup() {
    const { showPopup } = this.props;

    this.openForm();
    showPopup({
      action: ADD_ADDRESS,
      title: __("Add new address"),
      address: {},
    });
  }

  openNewForm = () => {
    this.openForm();
    this.showCreateNewPopup();
  };

  renderButtonLabel() {
    const { isMobile } = this.state;

    return isMobile ? (
      <>
        <span
          style={{ paddingRight: "10px", fontWeight: "bold", fontSize: "16px" }}
        >
          +
        </span>{" "}
        {__("New address")}
      </>
    ) : (
      __("Add new address")
    );
  }

  notSavedAddress = () => {
    const { addresses } = this.props;

    if (addresses.length === 0) {
      return true;
    }

    return !addresses.find(
      ({ country_code = null }) => country_code === getCountryFromUrl()
    );
  };

  renderOpenPopupButton = () => {
    const { openFirstPopup, formContent, isArabic } = this.state;
    const { addresses } = this.props;

    const isCountryNotAddressAvailable =
      !addresses.some((add) => add.country_code === getCountryFromUrl()) &&
      !isMobile.any();
    const openFormState =
      !openFirstPopup && addresses && isSignedIn() && this.notSavedAddress();

    if (openFormState) {
      this.setState({ openFirstPopup: true });
      this.openNewForm();
    }

    if (isSignedIn() && addresses.length > 0) {
      return (
        <div
          block="MyAccountAddressBook"
          elem="NewAddressWrapper"
          mods={{ formContent, isArabic, isCountryNotAddressAvailable }}
        >
          <button
            block="MyAccountAddressBook"
            elem="NewAddress"
            mix={{
              block: "button primary small",
            }}
            onClick={this.openNewForm}
          >
            {this.renderButtonLabel()}
          </button>
        </div>
      );
    }

    return null;
  };

  renderHeading(text, isDisabled) {
    return (
      <h2 block="Checkout" elem="Heading" mods={{ isDisabled }}>
        {__(text)}
      </h2>
    );
  }

  onAddressSelect = (addressId) => {
    if (addressId) {
      this.setState({ selectedAddressId: addressId });
    }
  };

  renderAddressBook() {
    const { addresses } = this.props;
    const { formContent, selectedAddressId } = this.state;
    return (
      <CheckoutAddressBook
        onAddressSelect={this.onAddressSelect}
        selectedAddressId={selectedAddressId}
        addresses={addresses}
        formContent={formContent}
        PickUpAddress={true}
        closeForm={this.closeForm.bind(this)}
        openForm={this.openForm.bind(this)}
        showCards={this.showCards}
        hideCards={this.hideCards}
      />
    );
  }

  onAddressSelectionSuccess = () => {
    const { selectedAddressId } = this.state;
    const {
      location: {
        state: { orderId, orderDetails },
      },
    } = history;
    history.push(`/my-account/return-item/create/${orderId}`, {
      selectedAddressId,
      orderDetails,
    });
  };

  render() {
    const { formContent } = this.state;
    return (
      <div
        block="ShippingStep"
        mods={{ isSignedIn: isSignedIn(), formContent }}
      >
        {this.renderOpenPopupButton()}
        {isSignedIn() ? this.renderAddAdress() : null}
        <Form
          id={SHIPPING_STEP}
          mix={{ block: "PickUpAddress" }}
          onSubmitSuccess={this.onAddressSelectionSuccess}
        >
          {/* {isSignedIn() ? (
            <>
              <h4 block="PickUpAddress" elem="DeliveryMessage">
                {__("Select Pick Up Address")}
              </h4>
            </>
          ) : null} */}
          {isSignedIn() && this.renderAddressBook()}
          {this.renderActions()}
        </Form>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PickUpAddress);
