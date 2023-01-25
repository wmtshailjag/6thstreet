import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { customerType } from 'Type/Account';

import LoginBlock from './LoginBlock.component';

const mapStateToProps = (state) => ({
    isSignedIn: state.MyAccountReducer.isSignedIn,
    language: state.AppState.language,
    customer: state.MyAccountReducer.customer
});

export class LoginBlockContainer extends PureComponent {
    static propTypes = {
        isSignedIn: PropTypes.bool,
        language: PropTypes.string.isRequired,
        customer: customerType
    };

    static defaultProps = {
        isSignedIn: false,
        customer: {}
    };

    render() {
        // TODO: test if redux connection works properly
        const { isSignedIn, language, customer } = this.props;

        return (
            <LoginBlock
              isSignedIn={ isSignedIn }
              language={ language }
              customer={ customer }
            />
        );
    }
}

export default connect(mapStateToProps)(LoginBlockContainer);
