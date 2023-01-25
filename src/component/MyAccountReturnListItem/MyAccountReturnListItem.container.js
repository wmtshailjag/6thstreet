// import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Return } from 'Util/API/endpoint/Return/Return.type';

import MyAccountReturnListItem from './MyAccountReturnListItem.component';

export const mapStateToProps = (_state) => ({
    // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (_dispatch) => ({
    // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class MyAccountReturnListItemContainer extends PureComponent {
    static propTypes = {
        return: Return.isRequired
    };

    containerFunctions = {
    };

    containerProps = () => {
        const { return: returnItem } = this.props;

        return {
            linkTo: this.getLinkTo(),
            return: returnItem
        };
    };

    getLinkTo() {
      const {
        return: { return_id, is_exchange_rma },
      } = this.props;
      if (is_exchange_rma) {
        return `/my-account/exchange-item/${return_id}`;
      } else {
        return `/my-account/return-item/${return_id}`;
      }
    }

    render() {
        return (
            <MyAccountReturnListItem
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnListItemContainer);
