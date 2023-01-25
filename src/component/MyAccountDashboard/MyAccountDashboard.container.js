// import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import MyAccountDashboard from './MyAccountDashboard.component';

export const mapStateToProps = (_state) => ({
});

export const mapDispatchToProps = (_dispatch) => ({
    // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class MyAccountDashboardContainer extends PureComponent {
    static propTypes = {
    };

    containerFunctions = {
        // getData: this.getData.bind(this)
    };

    containerProps = () => ({});

    render() {
        return (
            <MyAccountDashboard
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountDashboardContainer);
