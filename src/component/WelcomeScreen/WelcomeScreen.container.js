import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { setCountry, setLanguage, setCountryForWelcome } from 'Store/AppState/AppState.action';
import { setAppConfig } from 'Store/AppConfig/AppConfig.action';
import StoreCreditDispatcher from 'Store/StoreCredit/StoreCredit.dispatcher';
import { getCountriesForSelect, getCountryLocaleForSelect } from 'Util/API/endpoint/Config/Config.format';
import { Config } from 'Util/API/endpoint/Config/Config.type';
import { URLS } from 'Util/Url/Url.config';
import WelcomeScreen from './WelcomeScreen.component';
import isMobile from "Util/Mobile";
import { EVENT_MOE_SET_COUNTRY } from "Util/Event";
import { getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = (state) => ({
    config: state.AppConfig.config,
    language: state.AppState.language,
    country: state.AppState.country
});

export const mapDispatchToProps = (dispatch) => ({
    setCountry: (value) => dispatch(setCountry(value)),
    setAppConfig: (value) => dispatch(setAppConfig(value)),
    setCountryForWelcome: (value) => dispatch(setCountryForWelcome(value)),
    setLanguage: (value) => dispatch(setLanguage(value)),
    updateStoreCredits: () => StoreCreditDispatcher.getStoreCredit(dispatch)
});

class WelcomeScreenContainer extends PureComponent {
    static propTypes = {
        setLanguage: PropTypes.func.isRequired,
        setCountry: PropTypes.func.isRequired,
        updateStoreCredits: PropTypes.func.isRequired,
        checkWizardLang: PropTypes.func,
        config: Config.isRequired,
        language: PropTypes.string.isRequired,
        country: PropTypes.string.isRequired
    };

    static defaultProps = {
        checkWizardLang: () => {}
    };

    containerFunctions = {
        onCountrySelect: this.onCountrySelect.bind(this),
        onLanguageSelect: this.onLanguageSelect.bind(this)
    };

    onCountrySelect(value) {
        Moengage.track_event(EVENT_MOE_SET_COUNTRY, {
            country: value.toUpperCase() || "",
            language: getLanguageFromUrl().toUpperCase(),
            app6thstreet_platform: "Web",
          });
        const { country, language } = this.props;
        if (country) {
            if(window.location.href.includes('en-') || window.location.href.includes('ar-'))
            setTimeout(() => { // Delay is for Moengage call to complete
                window.location.href = location.origin.replace(
                    country.toLowerCase(),
                    value,
                    location.href
                );
            }, 1000);
                
            else{
                this.props.setCountryForWelcome(value)
                this.props.closePopup();
                // this.props.setAppConfig(value)
                let countryList = ['BH']; 
                if(countryList.includes(value) && isMobile.any()){      
                    const locale = `${language}-${value.toLowerCase()}`;      
                    let url = `${URLS[locale]}`
                    window.location.href = url
                }
            }
        } else {
            const locale = `${language}-${value.toLowerCase()}`;
            window.location.href = URLS[locale];
        }
    }

    onLanguageSelect(value) {
        const {
            country,
            language,
            setLanguage,
            checkWizardLang
        } = this.props;
        if (language && country) {
            window.location.href = location.origin.replace(
                language.toLowerCase(),
                value,
                location.href
            );
        } else {
            setLanguage(value);
        }

        checkWizardLang();
    }

    containerProps = () => {
        const { country, config, language } = this.props;

        return {
            countrySelectOptions: getCountriesForSelect(config),
            languageSelectOptions: getCountryLocaleForSelect(config, country),
            country,
            language
        };
    };

    render() {
        return (
            <WelcomeScreen
              { ...this.containerFunctions }
              { ...this.containerProps() }
              { ...this.props }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeScreenContainer);
