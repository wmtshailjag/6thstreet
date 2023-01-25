import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { setCountry, setLanguage } from 'Store/AppState/AppState.action';
import { getCountriesForSelect } from 'Util/API/endpoint/Config/Config.format';
import { Config } from 'Util/API/endpoint/Config/Config.type';

import StoreSwitcherPopup from './StoreSwitcherPopup.component';

export const mapStateToProps = (state) => ({
    config: state.AppConfig.config,
    language: state.AppState.language,
    country: state.AppState.country
});

export const mapDispatchToProps = (dispatch) => ({
    setCountry: (value) => dispatch(setCountry(value)),
    setLanguage: (value) => dispatch(setLanguage(value))
});

class StoreSwitcherPopupContainer extends PureComponent {
    static propTypes = {
        setLanguage: PropTypes.func.isRequired,
        setCountry: PropTypes.func.isRequired,
        config: Config.isRequired,
        country: PropTypes.string.isRequired
    };

    containerProps = () => {
        const { country, config } = this.props;

        return {
            countrySelectOptions: getCountriesForSelect(config),
            country
        };
    };

    render() {
        return (
            <StoreSwitcherPopup
              { ...this.containerFunctions }
              { ...this.containerProps() }
              { ...this.props }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreSwitcherPopupContainer);
