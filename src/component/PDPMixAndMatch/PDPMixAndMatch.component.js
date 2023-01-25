import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import PDPMixAndMatchProduct from 'Component/PDPMixAndMatchProduct';

import './PDPMixAndMatch.style';

class PDPMixAndMatch extends PureComponent {
    static propTypes = {
        products: PropTypes.array.isRequired,
        isAlsoAvailable: PropTypes.bool.isRequired
    };

    renderAvailableProduct = (product) => {
        const { sku } = product;
        const {renderMySignInPopup} = this.props
        return (
            <PDPMixAndMatchProduct
              product={ product }
              renderMySignInPopup={renderMySignInPopup}
              key={ sku }
            />
        );
    };

    render() {
        const { products = [] } = this.props;
        if(!products || !products.length){
            return null;
        }

        return (
            <div block="PDPMixAndMatch">
                <h2 block="PDPMixAndMatch" elem="title">{__( "Mix & Match" )}</h2>
                <ul block="PDPMixAndMatch" elem="List">
                    { products.map(this.renderAvailableProduct) }
                </ul>
            </div>
        );
    }
}

export default PDPMixAndMatch;
