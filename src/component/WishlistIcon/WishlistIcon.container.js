import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import Wishlist from "Store/Wishlist/Wishlist.dispatcher";
import { WishlistItems } from "Util/API/endpoint/Wishlist/Wishlist.type";
import WishlistIcon from "./WishlistIcon.component";

export const mapDispatchToProps = (dispatch) => ({
  addToWishlist: (sku) => Wishlist.addSkuToWishlist(dispatch, sku),
  removeFromWishlist: (id) => Wishlist.removeSkuFromWishlist(id, dispatch),
});

export const mapStateToProps = (state) => ({
  items: state.WishlistReducer.items,
});

class WishlistIconContainer extends PureComponent {
  static propTypes = {
    sku: PropTypes.string.isRequired,
    items: WishlistItems.isRequired,
    removeFromWishlist: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    pageType: PropTypes.string.isRequired,
  };

  render() {
    return <WishlistIcon {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WishlistIconContainer);
