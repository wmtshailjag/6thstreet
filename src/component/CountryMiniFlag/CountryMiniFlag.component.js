/* eslint-disable quote-props */
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import {
    AE,
    SA,
    OM,
    QA,
    BH,
    KW
} from './Flags';
import './CountryMiniFlag.style';

class CountryMiniFlag extends PureComponent {
    static propTypes = {
        label: PropTypes.string.isRequired,
        mods: PropTypes.object
    };

    static defaultProps = {
        mods: {}
    };

    renderFlag() {
        const {
            label,
            mods
        } = this.props;

        const flagValues = {
            'AE': AE,
            'SA': SA,
            'QA': QA,
            'OM': OM,
            'BH': BH,
            'KW': KW
        };

        const flagValue = flagValues[label || 'AE'];

        return (
            <div
                block="CountryMiniFlag"
                elem="Container"
                mods={ mods }
                style={ { backgroundImage: `url(${flagValue})` } }
            />
        );
    }

    render() {
        return this.renderFlag();
    }
}

export default CountryMiniFlag;
