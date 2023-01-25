import { connect } from 'react-redux';

import AppConfigDispatcher from 'Store/AppConfig/AppConfig.dispatcher';

import MyAccountAddressForm from './MyAccountAddressForm.component';

export const mapStateToProps = (state) => ({
    countries: state.ConfigReducer.countries,
    default_country: state.ConfigReducer.default_country
});

export default connect(mapStateToProps, null)(MyAccountAddressForm);
