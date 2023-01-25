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

import { connect } from "react-redux";

import AppConfigDispatcher from "Store/AppConfig/AppConfig.dispatcher";

import MyAccountDeliveryAddressForm from "./MyAccountDeliveryAddressForm.component";

export const mapStateToProps = (state) => ({
  countries: state.ConfigReducer.countries,
  default_country: state.ConfigReducer.default_country,
  isLoading: state.MyAccountReducer.isAddressLoading,
  addressCityData: state.MyAccountReducer.addressCityData,
});

export default connect(
  mapStateToProps,
  null
)(MyAccountDeliveryAddressForm);
