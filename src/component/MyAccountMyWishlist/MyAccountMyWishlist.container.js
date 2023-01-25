import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { WishlistItems } from 'Util/API/endpoint/Wishlist/Wishlist.type';

import MyAccountMyWishlist from './MyAccountMyWishlist.component';

export const mapStateToProps = (state) => ({
    isLoading: state.WishlistReducer.isLoading,
    items: state.WishlistReducer.items
});

export const mapDispatchToProps = (_dispatch) => ({
    // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class MyAccountMyWishlistContainer extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        items: WishlistItems.isRequired
    };

    containerFunctions = {
        // getData: this.getData.bind(this)
    };

    containerProps = () => {
        const { isLoading, items } = this.props;
        return { isLoading, items };
    };

    render() {
        return (
            <MyAccountMyWishlist
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountMyWishlistContainer);
