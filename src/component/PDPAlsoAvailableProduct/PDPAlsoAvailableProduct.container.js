import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { setPDPLoading } from 'Store/PDP/PDP.action';

import PDPAlsoAvailableProduct from './PDPAlsoAvailableProduct.component';

export const mapDispatchToProps = (dispatch) => ({
    setIsLoading: (isLoading) => dispatch(setPDPLoading(isLoading))
});

export class PDPAlsoAvailableProductContainer extends PureComponent {
    static propTypes = {
        product: PropTypes.object.isRequired,
        setIsLoading: PropTypes.func.isRequired
    };

    render() {
        return (
            <PDPAlsoAvailableProduct
              { ...this.props }
            />
        );
    }
}

export default connect(null, mapDispatchToProps)(PDPAlsoAvailableProductContainer);
