import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Config } from 'Util/API/endpoint/Config/Config.type';

import FooterCustomerSupport from './FooterCustomerSupport.component';

export const mapStateToProps = (state) => ({
    config: state.AppConfig.config,
    country: state.AppState.country,
    language: state.AppState.language
});

export class FooterCustomerSupportContainer extends PureComponent {
    static propTypes = {
        config: Config.isRequired,
        country: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired
    };

    containerProps = () => {
        const { config: { support_email: email } } = this.props;

        const {
            isEmailSupported,
            isPhoneSupported,
            contactLabel,
            isContactEmail,
            openHoursLabel,
            phone
        } = this.getCountryConfigs();
        // let k = this.getCountryConfigs()

        return {
            email,
            isEmailSupported,
            isPhoneSupported,
            contactLabel,
            isContactEmail,
            openHoursLabel,
            phone: phone.indexOf('00') === 0 ? phone.replace('00', '+') : phone
        };
    };

    getCountryConfigs() {
        const {
            config: { countries },
            country,
            language
        } = this.props;

        const {
            contact_information: {
                email: isEmailSupported,
                phone: isPhoneSupported
            },
            contact_using: {
                text: {
                    [language]: contactLabel
                } = {},
                type: contactType
            } = {},
            opening_hours: {
                [language]: openHoursLabel
            },
            toll_free: phone
        } = countries[country];

        return {
            isEmailSupported,
            isPhoneSupported,
            contactLabel,
            isContactEmail: contactType === 'email',
            openHoursLabel,
            phone
        };
    }

    render() {
        return (
            <FooterCustomerSupport
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps)(FooterCustomerSupportContainer);
