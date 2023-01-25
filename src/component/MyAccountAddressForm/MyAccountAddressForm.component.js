import PropTypes from 'prop-types';

import CountryMiniFlag from 'Component/CountryMiniFlag';
import {
    MyAccountAddressForm as SourceMyAccountAddressForm
} from 'SourceComponent/MyAccountAddressForm/MyAccountAddressForm.component';
import { addressType } from 'Type/Account';
import { countriesType } from 'Type/Config';
import { isArabic } from 'Util/App';
import isMobile from 'Util/Mobile';

import {
    COUNTRY_CODES_FOR_PHONE_VALIDATION,
    PHONE_CODES
} from './MyAccountAddressForm.config';

export class MyAccountAddressForm extends SourceMyAccountAddressForm {
    static propTypes = {
        address: addressType.isRequired,
        countries: countriesType.isRequired,
        default_country: PropTypes.string,
        onSave: PropTypes.func,
        changeDefaultShipping: PropTypes.func.isRequired
    };

    static defaultProps = {
        default_country: JSON.parse(localStorage.getItem('APP_STATE_CACHE_KEY')).data.country,
        onSave: () => {}
    };

    static getDerivedStateFromProps(props, state) {
        const { shippingAddress: { city, area } } = props;
        const { firstload } = state;

        if (city && area && firstload) {
            return {
                city,
                regionId: area,
                firstload: false
            };
        }

        return null;
    }

    componentDidUpdate() {
        const { shippingAddress: { city, area } } = this.props;

        if (city && area) {
            this.getCitiesBasedOnLanguage();
        }
    }

    constructor(props) {
        super(props);

        const {
            countries,
            default_country,
            address: {
                city = null,
                country_id,
                region: { region_id } = {}
            }
        } = props;
        const countryId = country_id || default_country;
        const country = countries.find(({ id }) => id === countryId);
        const { available_regions: availableRegions } = country || {};
        const regions = availableRegions || [{}];
        const regionId = region_id || regions[0].id;

        this.state = {
            countryId,
            city,
            availableAreas: [],
            area: null,
            regionId,
            cities: [],
            isArabic: isArabic(),
            defaultChecked: false,
            firstload: true
        };
    }

    getCitiesBasedOnLanguage() {
        const { isArabic, cities = [] } = this.state;

        if (isArabic) {
            return cities.map((item) => ({ id: item.city, label: item.city_ar, value: item.city }));
        }

        return cities.map((item) => ({ id: item.city, label: item.city, value: item.city }));
    }

    getRegionsBasedOnLanguage() {
        const { isArabic, cities, city } = this.state;

        const CurrentCity = city;

        if (isArabic) {
            const trueCity = cities.find(({ city }) => CurrentCity === city);

            if (trueCity) {
                const { areas_ar = [], areas } = trueCity;

                // eslint-disable-next-line arrow-body-style
                return areas_ar.map((area_ar, i) => {
                    return { id: areas[i], label: area_ar, value: areas[i] };
                });
            }
        }

        const trueCity = cities.find(({ city }) => CurrentCity === city);

        return trueCity ? trueCity.areas.map((area) => ({ id: area, label: area, value: area })) : null;
    }

    getRegionFields() {
        const {
            city, regionId, cities = []
        } = this.state;

        if (!city || cities.length === 0) {
            return {
                region_string: {
                    validation: ['notEmpty'],
                    placeholder: __('Area'),
                    value: regionId,
                    disabled: true
                }
            };
        }

        return {
            region_id: {
                validation: ['notEmpty'],
                type: 'select',
                selectOptions: this.getRegionsBasedOnLanguage(),
                onChange: (regionId) => this.setState({ regionId }),
                value: regionId,
                placeholder: __('Area')
            }
        };
    }

    async getCitiesAndRegionsData() {
      const { addressCityData } = this.props;
      this.setState({ cities: addressCityData });
    }

    renderCurrentPhoneCode() {
        const { countryId } = this.state;

        return PHONE_CODES[countryId];
    }

    getValidationForTelephone() {
        const { default_country } = this.props;

        return COUNTRY_CODES_FOR_PHONE_VALIDATION[default_country]
            ? 'telephoneAE' : 'telephone';
    }

    getPhoneNumberMaxLength() {
        const { default_country } = this.props;

        return COUNTRY_CODES_FOR_PHONE_VALIDATION[default_country]
            ? '9' : '8';
    }

    renderStreetPlaceholder() {
        return isMobile.any() || isMobile.tablet()
            ? __('Street address')
            : __('Type your address here');
    }

    renderContentType() {
        const { isSignedIn } = this.props;

        return isSignedIn ? 'toggle' : 'hide';
    }

    get fieldMap() {
        const {
            countryId,
            city,
            defaultChecked,
            regionId
        } = this.state;

        const {
            countries = [],
            address,
            shippingAddress,
            shippingAddress: {
                city: shippingCity,
                firstname,
                lastname,
                phone,
                street: shippingStreet = {}
            },
            customer
        } = this.props;

        const { street = [] } = address;
        const isShippingAddress = Object.keys(shippingAddress).length !== 0;
        const shippingPhone =  phone?.slice(4,phone?.length)

        return {
            country_id: {
                type: 'select',
                label: <CountryMiniFlag label={ countryId } />,
                validation: ['notEmpty'],
                value: countryId,
                autocomplete: 'none',
                selectOptions: countries.map(({ id, label }) => ({ id, label, value: id }))
            },
            default_billing: {
                type: 'checkbox',
                value: 'default_billing',
                checked: defaultChecked
            },
            default_shipping: {
                type: 'checkbox',
                value: 'default_shipping',
                checked: defaultChecked
            },
            firstname: {
                placeholder: __('First Name'),
                validation: ['notEmpty'],
                type: 'hidden',
                label: __('Delivering to'),
                value: isShippingAddress ? firstname : customer?.firstname || ''
            },
            lastname: {
                placeholder: __('Last Name'),
                validation: ['notEmpty'],
                type: 'hidden',
                value: isShippingAddress ? lastname : customer?.lastname?.trim() || ''
            },
            phonecode: {
                type: 'text',
                label: <CountryMiniFlag label={ countryId } />,
                validation: ['notEmpty'],
                value: this.renderCurrentPhoneCode(),
                autocomplete: 'none',
                isDisabled: true
            },
            telephone: {
                validation: ['notEmpty', this.getValidationForTelephone()],
                maxLength: this.getPhoneNumberMaxLength(),
                placeholder: __('Phone Number'),
                value: isShippingAddress ? +shippingPhone : ''
            },
            city: {
                validation: ['notEmpty'],
                placeholder: __('City'),
                selectOptions: this.getCitiesBasedOnLanguage(),
                type: 'select',
                value: isShippingAddress ? shippingCity : city,
                onChange: (city) => this.setState({ city, isLoading: true })
            },
            ...this.getRegionFields(),
            postcode: {
                validation: ['notEmpty'],
                value: regionId
            },
            street: {
                value: isShippingAddress ? shippingStreet : street[0],
                validation: ['notEmpty'],
                placeholder: this.renderStreetPlaceholder()
            }
        };
    }
}

export default MyAccountAddressForm;
