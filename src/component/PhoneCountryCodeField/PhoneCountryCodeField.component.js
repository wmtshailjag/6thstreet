/* eslint-disable quote-props */
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CountryMiniFlag from 'Component/CountryMiniFlag';
import Field from 'Component/Field';
import { PHONE_CODES } from 'Component/MyAccountAddressForm/MyAccountAddressForm.config';
import { isArabic } from 'Util/App';

import './PhoneCountryCodeField.style';

class PhoneCountryCodeField extends PureComponent {
    static propTypes = {
        onSelect: PropTypes.func.isRequired,
        label: PropTypes.string
    };

    static defaultProps = {
        label: ''
    };

    constructor(props) {
        super(props);

        const { label } = props;

        this.state = {
            selectedCountry: label,
            isArabic: isArabic()
        };
    }

    handleSelectChange = (e) => {
        const { onSelect } = this.props;
        const countries = Object.keys(PHONE_CODES);

        const countiresMapped = countries.reduce((acc, country) => {
            if (e === this.renderCurrentPhoneCode(country)) {
                acc.push(country);
            }

            return acc;
        }, []);

        this.setState({ selectedCountry: countiresMapped[0] });
        onSelect(e);
    };

    renderCurrentPhoneCode(country_id) {
        return PHONE_CODES[country_id];
    }

    renderOption = (country) => ({
        id: country,
        label: this.renderCurrentPhoneCode(country),
        value: this.renderCurrentPhoneCode(country)
    });

    renderCountryPhoneCodeField() {
        const {
            selectedCountry,
            isArabic
        } = this.state;

        const value = this.renderCurrentPhoneCode(selectedCountry);

        const countries = Object.keys(PHONE_CODES);

        return (
            <div block="PhoneCountryCodeField" mods={ { isArabic } }>
                <CountryMiniFlag mods={ { isArabic } } label={ selectedCountry } />
                <Field
                  type="select"
                  id="countryPhoneCode"
                  name="countryPhoneCode"
                  onChange={ this.handleSelectChange }
                  selectOptions={ countries.map(this.renderOption) }
                  value={ value || '' }
                />
            </div>
        );
    }

    render() {
        return this.renderCountryPhoneCodeField();
    }
}

export default PhoneCountryCodeField;
