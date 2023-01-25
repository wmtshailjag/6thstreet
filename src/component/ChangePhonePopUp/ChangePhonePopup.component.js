import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CountryMiniFlag from 'Component/CountryMiniFlag';
import Field from 'Component/Field';
import Form from 'Component/Form';
import {
    COUNTRY_CODES_FOR_PHONE_VALIDATION,
    PHONE_CODES
} from 'Component/MyAccountAddressForm/MyAccountAddressForm.config';
import { isArabic } from 'Util/App';

import './ChangePhonePopup.style.scss';

class ChangePhonePopup extends PureComponent {
    static propTypes = {
        isChangePhonePopupOpen: PropTypes.bool.isRequired,
        closeChangePhonePopup: PropTypes.func.isRequired,
        changePhone: PropTypes.func.isRequired,
        countryId: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        const { countryId } = props;

        this.state = {
            selectedCountry: countryId,
            isArabic: isArabic()
        };
    }

    renderCloseBtn() {
        const { closeChangePhonePopup } = this.props;
        const { isArabic } = this.state;

        const svg = (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 -1 26 26"
            >
                <path
                  d="M23.954 21.03l-9.184-9.095 9.092-9.174-1.832-1.807-9.09 9.179-9.176-9.088-1.81
                  1.81 9.186 9.105-9.095 9.184 1.81 1.81 9.112-9.192 9.18 9.1z"
                />
            </svg>
        );

        return (
            <button
              block="ChangePhonePopup"
              elem="Close"
              mods={ { isArabic } }
              onClick={ closeChangePhonePopup }
            >
                { svg }
            </button>
        );
    }

    renderCurrentPhoneCode(country_id) {
        return PHONE_CODES[country_id];
    }

    handleSelectChange = (e) => {
        const countries = Object.keys(PHONE_CODES);

        const countiresMapped = countries.reduce((acc, country) => {
            if (e === this.renderCurrentPhoneCode(country)) {
                acc.push(country);
            }

            return acc;
        }, []);

        this.setState({ selectedCountry: countiresMapped[0], phoneValue: [] });
    };

    renderOption = (country) => ({
        id: country,
        label: this.renderCurrentPhoneCode(country),
        value: this.renderCurrentPhoneCode(country)
    });

    renderPhone() {
        const { selectedCountry, isArabic, phoneValue } = this.state;
        const countries = Object.keys(PHONE_CODES);
        const maxlength = COUNTRY_CODES_FOR_PHONE_VALIDATION[selectedCountry]
            ? '9' : '8';

        return (
            <div
              block="ChangePhonePopup"
              elem="Phone"
              mods={ { isArabic } }
            >
                <Field
                  type="select"
                  id="countryPhoneCode"
                  name="countryPhoneCode"
                  onChange={ this.handleSelectChange }
                  selectOptions={ countries.map(this.renderOption) }
                  value={ PHONE_CODES[selectedCountry] }
                />
                <Field
                  mix={ {
                      block: 'ChangePhonePopup',
                      elem: 'PhoneField'
                  } }
                  validation={ ['notEmpty'] }
                  placeholder={__("Phone Number")}
                  maxlength={ maxlength }
                  pattern="[0-9]*"
                  value={ phoneValue }
                  id="newPhone"
                  name="newPhone"
                />
                <CountryMiniFlag mods={ { isArabic } } label={ selectedCountry } />
            </div>
        );
    }

    render() {
        const {
            isChangePhonePopupOpen,
            changePhone
        } = this.props;

        return (
            <div
              block="ChangePhonePopup"
              mods={ { isChangePhonePopupOpen } }
            >
                <div
                  block="ChangePhonePopup"
                  elem="Background"
                />
                <div
                  block="ChangePhonePopup"
                  elem="Content"
                >
                    { this.renderCloseBtn() }
                    <div
                      block="ChangePhonePopup"
                      elem="Content-Title"
                    >
                        { __('Input new phone number and send Verification code again') }
                    </div>
                    <Form onSubmitSuccess={ changePhone }>
                        { this.renderPhone() }
                        <button
                          block="primary"
                          type="submit"
                        >
                            { __('Update your Number') }
                        </button>
                    </Form>
                </div>
            </div>
        );
    }
}

export default ChangePhonePopup;
