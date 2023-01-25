import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { Product } from "Util/API/endpoint/Product/Product.type";
import ProductItem from "./ProductItem.component";
import Wishlist from "Store/Wishlist/Wishlist.dispatcher";

export const mapStateToProps = (_state) => ({
  // wishlistItems: state.WishlistReducer.productsInWishlist
  prevPath: _state.PLP.prevPath,
});

export const mapDispatchToProps = (dispatch) => ({
  // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
  removeFromWishlist: (id) => Wishlist.removeSkuFromWishlist(id, dispatch),
});

export class ProductItemContainer extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
    page: PropTypes.string,
    position: PropTypes.number,
    queryID: PropTypes.string,
    isVueData: PropTypes.bool,
    pageType: PropTypes.string.isRequired,
    removeFromWishlist: PropTypes.func.isRequired,
  };

  static defaultProps = {
    page: "",
  };

  containerProps = () => {
    const {
      product,
      page,
      position,
      qid,
      isVueData = false,
      pageType,
      prevPath = null,
      renderMySignInPopup,
      sendProductImpression,
      removeFromWishlist,
      wishlist_item_id,
    } = this.props;
    return {
      product,
      page,
      position,
      qid,
      isVueData,
      pageType,
      renderMySignInPopup,
      prevPath,
      sendProductImpression,
      removeFromWishlist,
      wishlist_item_id,
    };
  };

  render() {
    return (
      <ProductItem {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductItemContainer);
