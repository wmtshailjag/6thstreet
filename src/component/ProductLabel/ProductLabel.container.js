/**
 * @category  6thstreet
 * @author    Alona Zvereva <alona.zvereva@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */

// import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import ProductLabel from './ProductLabel.component';

export class ProductLabelContainer extends PureComponent {
    render() {
        return (
            <ProductLabel
              { ...this.props }
            />
        );
    }
}

export default ProductLabelContainer;
