import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { Config } from "Util/API/endpoint/Config/Config.type";

import InlineCustomerSupport from "./InlineCustomerSupport.component";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  country: state.AppState.country,
  language: state.AppState.language,
});

export const mapDispatchToProps = (_dispatch) => ({
  // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class InlineCustomerSupportContainer extends PureComponent {
  static propTypes = {
    config: Config.isRequired,
    country: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
  };

  containerFunctions = {
    // getData: this.getData.bind(this)
  };

  containerProps = () => {
    const {
      config: { support_email: email },
      location,
    } = this.props;

    const {
      isEmailSupported,
      isPhoneSupported,
      contactLabel,
      isContactEmail,
      openHoursLabel,
      phone,
    } = this.getCountryConfigs();

    return {
      location,
      email,
      isEmailSupported,
      isPhoneSupported,
      contactLabel,
      isContactEmail,
      openHoursLabel,
      phone: phone.indexOf("00") === 0 ? phone.replace("00", "+") : phone,
    };
  };

  getCountryConfigs() {
    const {
      config: { countries },
      country,
      language,
    } = this.props;

    const {
      contact_information: { email: isEmailSupported, phone: isPhoneSupported },
      contact_using: { text: { [language]: contactLabel } = {} } = {},
      opening_hours: { [language]: openHoursLabel },
      toll_free: phone,
    } = countries[country];

    return {
      isEmailSupported,
      isPhoneSupported,
      contactLabel,
      openHoursLabel,
      phone,
    };
  }

  render() {

    return (
      <InlineCustomerSupport
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InlineCustomerSupportContainer);
