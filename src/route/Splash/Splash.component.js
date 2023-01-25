import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Router from 'Component/Router';
import SharedTransition from 'Component/SharedTransition';

import './Splash.style';

class Splash extends PureComponent {
    static propTypes = {
        isReady: PropTypes.bool.isRequired
    };

    renderSplash() {
        return 'splash';
    }

    renderWizard() {
        return (
            <>
                <Router />
                <SharedTransition />
            </>
        );
    }

    render() {
        const { isReady } = this.props;

        if (isReady) {
            return this.renderWizard();
        }

        return this.renderSplash();
    }
}

export default Splash;
