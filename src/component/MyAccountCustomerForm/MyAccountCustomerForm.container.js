import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { PHONE_CODES } from 'Component/MyAccountAddressForm/MyAccountAddressForm.config';
import MyAccountDispatcher from 'Store/MyAccount/MyAccount.dispatcher';
import { showNotification } from 'Store/Notification/Notification.action';
import { customerType } from 'Type/Account';
import { EVENT_MOE_UPDATE_PROFILE } from "Util/Event";
import { getCountryFromUrl,getLanguageFromUrl } from 'Util/Url';

import MyAccountCustomerForm from './MyAccountCustomerForm.component';

export const mapStateToProps = (state) => ({
    customer: state.MyAccountReducer.customer,
    country: state.AppState.country
});

export const mapDispatchToProps = (dispatch) => ({
    updateCustomer: (customer) => MyAccountDispatcher.updateCustomerData(dispatch, customer),
    showSuccessNotification: (message) => dispatch(showNotification('success', message)),
    showErrorNotification: (error) => dispatch(showNotification('error', error[0].message))
});

export class MyAccountCustomerFormContainer extends PureComponent {
    static propTypes = {
        customer: customerType.isRequired,
        updateCustomer: PropTypes.func.isRequired,
        showErrorNotification: PropTypes.func.isRequired,
        showSuccessNotification: PropTypes.func.isRequired,
        country: PropTypes.string.isRequired
    };

    containerFunctions = {
        onSave: this.saveCustomer.bind(this),
        showPasswordFrom: this.togglePasswordForm.bind(this, true),
        hidePasswordFrom: this.togglePasswordForm.bind(this, false),
        setGender: this.setGender.bind(this),
        handleCountryChange: this.handleCountryChange.bind(this)
    };

    constructor(props) {
        super(props);
        const { customer: { gender } } = props;

        this.state = {
            isShowPassword: false,
            isLoading: false,
            countryCode: getCountryFromUrl(),
            gender,
            phoneCountryCode: ''
        };
    }

    togglePasswordForm(isShowPassword) {
        this.setState({ isShowPassword });
    }

    setGender(gender) {
        this.setState({ gender });
    }

    handleCountryChange(phoneCountryCode) {
        this.setState({ phoneCountryCode });
    }

    containerProps = () => {
        const { customer, country } = this.props;

        const {
            isShowPassword,
            isLoading
        } = this.state;

        return {
            isShowPassword,
            customer,
            isLoading,
            country
        };
    };

    async saveCustomer(customer) {
        this.setState({ isLoading: true });

        const {
            updateCustomer,
            showErrorNotification,
            showSuccessNotification,
            customer: oldCustomerData
        } = this.props;
        const { countryCode, gender, phoneCountryCode = PHONE_CODES[countryCode] } = this.state;
        const { phone } = customer;
        const elmnts = document.getElementsByClassName('MyAccount-Heading');
        const GetGender = gender == "1" ? "Male" : gender == "2" ? "Female" : "Prefer Not To Say" 
        try {
            updateCustomer({
                ...oldCustomerData,
                ...customer,
                gender,
                phone: phoneCountryCode + phone
            });
            Moengage.track_event(EVENT_MOE_UPDATE_PROFILE, {
                country: getCountryFromUrl().toUpperCase(),
                language: getLanguageFromUrl().toUpperCase(),
                gender: GetGender || "",
                app6thstreet_platform: "Web",
              });
            showSuccessNotification(__('Your information was successfully updated!'));

        } catch (e) {
            showErrorNotification(e);
        }

        this.setState({ isLoading: false });

        if (elmnts && elmnts.length > 0) {
            elmnts[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    render() {
        return (
            <MyAccountCustomerForm
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountCustomerFormContainer);
