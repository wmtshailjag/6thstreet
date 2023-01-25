/* eslint-disable prefer-destructuring */
/* eslint-disable quote-props */
/* eslint-disable @scandipwa/scandipwa-guidelines/create-config-files */
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CountryMiniFlag from 'Component/CountryMiniFlag';
import Field from 'Component/Field';
import StoreSwitcherPopup from 'Component/StoreSwitcherPopup';
import { isArabic } from 'Util/App';
import { SelectOptions } from 'Type/Field';

import './CountrySwitcher.style';

class CountrySwitcher extends PureComponent {
    static propTypes = {
        countrySelectOptions: SelectOptions.isRequired,
        onCountrySelect: PropTypes.func.isRequired,
        country: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            content: '',
            isArabic: isArabic()

        };
    }

    togglePopup = () => {
        if (this.state.content === '') {
            this.openPopup();
        }
        else {
            this.closePopup();
        }
    }

    openPopup = () => {
        const {
            countrySelectOptions,
            country
        } = this.props;

        this.setState({
            content: <StoreSwitcherPopup
                countrySelectOptions={countrySelectOptions}
                country={country}
                closePopup={this.closePopup}
            />
        });
    };

    closePopup = () => {
        this.setState({
            content: ''
        });
    };

    renderCountrySelect() {
        const {
            countrySelectOptions,
            onCountrySelect,
            country
        } = this.props;

        return (
            <Field
                id="language-switcher-country"
                name="country"
                type="select"
                placeholder={__('Choose country')}
                selectOptions={countrySelectOptions}
                value={country}
                onChange={onCountrySelect}
            />
        );
    }

    getCurrentCountry() {
        const {
            country,
            countrySelectOptions
        } = this.props;

        const countryName = countrySelectOptions.filter((obj) => obj.id === country) || [];
        if (countryName.length > 0) {
            return countryName[0];
        }

        return '';
    }

    renderStoreButton() {
        const { isArabic } = this.state;
        const country = this.getCurrentCountry();
        const id = country.id;
        let isOpen = !(this.state.content === '')

        return (
            <button
                block={`CountrySwitcher`}
                elem="CountryBtn"
                mods={{ isOpen, isArabic }}
                /* eslint-disable-next-line */
                onClick={this.togglePopup}
            >
                <CountryMiniFlag label={id} />
                <span>
                    {country.label || 'SELECT COUNTRY'}
                </span>
            </button>
        );
    }

    render() {
        const { content } = this.state;
        return (
            <div block="CountrySwitcher">
                {this.renderStoreButton()}
                {content}
            </div>
        );
    }
}

export default CountrySwitcher;
