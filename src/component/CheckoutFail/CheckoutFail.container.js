import { connect } from 'react-redux';

import {
    CheckoutSuccessContainer,
    mapDispatchToProps,
    mapStateToProps
} from 'Component/CheckoutSuccess/CheckoutSuccess.container';

import CheckoutFail from './CheckoutFail.component';

export class CheckoutFailContainer extends CheckoutSuccessContainer {
    render() {
        return (
            <CheckoutFail
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutFailContainer);
