import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { CartItemType } from 'Type/MiniCart';

import SuccessCheckoutItem from './SuccessCheckoutItem.component';

export const CartDispatcher = import(
    'Store/Cart/Cart.dispatcher'
);

export const mapDispatchToProps = (dispatch) => ({
    addProduct: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.addProductToCart(dispatch, options)
    ),
    updateProductInCart: (
        item_id, quantity, color, optionValue, discount, brand_name, thumbnail_url, url, row_total, currency
    ) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateProductInCart(
            dispatch,
            item_id,
            quantity,
            color,
            optionValue,
            discount,
            brand_name,
            thumbnail_url,
            url,
            row_total,
            currency
        )
    )
});

export class SuccessCheckoutItemContainer extends PureComponent {
    static propTypes = {
        item: CartItemType.isRequired,
        currency_code: PropTypes.string.isRequired,
        brand_name: PropTypes.string.isRequired,
        updateProductInCart: PropTypes.func.isRequired,
        closePopup: PropTypes.func.isRequired
    };

    state = { isLoading: false };

    handlers = [];

    setStateNotLoading = this.setStateNotLoading.bind(this);

    containerFunctions = {
        getCurrentProduct: this.getCurrentProduct.bind(this)
    };

    componentWillUnmount() {
        if (this.handlers.length) {
            [].forEach.call(this.handlers, (cancelablePromise) => cancelablePromise.cancel());
        }
    }

    /**
     * @returns {Product}
     */
    getCurrentProduct() {
        const { item: { product } } = this.props;
        return product;
    }

    setStateNotLoading() {
        this.setState({ isLoading: false });
    }

    containerProps = () => ({
        thumbnail: this._getProductThumbnail()
    });

    /**
     * Get link to product page
     * @param url_key Url to product
     * @return {{pathname: String, state Object}} Pathname and product state
     */

    _getProductThumbnail() {
        const product = this.getCurrentProduct();
        const { thumbnail: { url: thumbnail } = {} } = product;
        return thumbnail || '';
    }

    render() {
        return (
            <SuccessCheckoutItem
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(null, mapDispatchToProps)(SuccessCheckoutItemContainer);
