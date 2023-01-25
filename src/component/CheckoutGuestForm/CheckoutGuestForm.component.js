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

import FieldForm from "Component/FieldForm/FieldForm.component";
import MyAccountOverlay from "Component/MyAccountOverlay";
import PropTypes from "prop-types";
import { isArabic } from "Util/App";
import "./CheckoutGuestForm.style";
import lock from "./icons/lock.png";
import Image from "Component/Image";
import Event, {
  EVENT_GTM_AUTHENTICATION,
  EVENT_SIGN_IN_CTA_CLICK,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class CheckoutGuestForm extends FieldForm {
  static propTypes = {
    requestCustomerData: PropTypes.func.isRequired,
    formId: PropTypes.string.isRequired,
    handleEmailInput: PropTypes.func.isRequired,
    handleCreateUser: PropTypes.func.isRequired,
    isEmailAdded: PropTypes.bool.isRequired,
  };

  state = {
    showPopup: false,
    isArabic: isArabic(),
  };

  get fieldMap() {
    const { handleEmailInput, handlePasswordInput, formId, isCreateUser } =
      this.props;

    const fields = {
      guest_email: {
        label: __("Email"),
        form: formId,
        placeholder: __("Email"),
        validation: ["notEmpty", "email"],
        onChange: handleEmailInput,
        skipValue: true,
      },
    };

    if (isCreateUser) {
      fields.guest_password = {
        form: formId,
        label: __("Create Password"),
        onChange: handlePasswordInput,
        validation: ["notEmpty", "password"],
        type: "password",
        skipValue: true,
      };
    }

    return fields;
  }

  renderHeading(text) {
    const { isEmailAdded } = this.props;
    return (
      <h2 block="Checkout" elem="Heading" mods={{ isEmailAdded }}>
        {__(text)}
      </h2>
    );
  }

  renderMyAccountPopup() {
    const { showPopup } = this.state;

    if (!showPopup) {
      return null;
    }

    return (
      <MyAccountOverlay
        closePopup={this.closePopup}
        onSignIn={this.onSignIn}
        isPopup
      />
    );
  }

  onSignIn = () => {
    const { requestCustomerData } = this.props;

    requestCustomerData();
    this.closePopup();
  };

  closePopup = () => {
    this.setState({ showPopup: false });
  };

  showMyAccountPopup = () => {
    this.setState({ showPopup: true });
    const eventDetails = {
      name: EVENT_SIGN_IN_CTA_CLICK,
      action: EVENT_SIGN_IN_CTA_CLICK,
      category: "checkout",
    };
    Event.dispatch(EVENT_GTM_AUTHENTICATION, eventDetails);
    Moengage.track_event(EVENT_SIGN_IN_CTA_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  };

  render() {
    const { isEmailAdded } = this.props;
    const { isArabic } = this.state;

    return (
      <div
        block="CheckoutGuestForm"
        mods={{ isEmailAdded }}
        mix={{ block: "FieldForm" }}
      >
        <div
          block="CheckoutGuestForm"
          elem="FieldAndSignIn"
          mods={{ isArabic }}
        >
          <button onClick={this.showMyAccountPopup}>
            {__("Sign In")}
            <Image lazyLoad={true} src={lock} alt="lockImage" />
          </button>
        </div>
        {this.renderMyAccountPopup()}
      </div>
    );
  }
}

export default CheckoutGuestForm;
