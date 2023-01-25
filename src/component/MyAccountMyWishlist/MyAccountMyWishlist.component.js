import Loader from "Component/Loader";
import ProductItem from "Component/ProductItem";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { WishlistItems } from "Util/API/endpoint/Wishlist/Wishlist.type";
import "./MyAccountMyWishlist.style";

class MyAccountMyWishlist extends PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    items: WishlistItems.isRequired,
  };

  renderLoader() {
    const { isLoading } = this.props;

    return <Loader isLoading={isLoading} />;
  }

  renderNoItems() {
    return <p>{__("You have no items in your wish list.")}</p>;
  }

  renderItem = (item, i) => {
    const { product, wishlist_item_id } = item;

    return (
      <div block="MyAccountMyWishlist" elem="Item" key={i}>
        <ProductItem
          key={wishlist_item_id}
          product={product}
          pageType="wishlist"
          wishlist_item_id={wishlist_item_id}
        />
      </div>
    );
  };

  renderItems() {
    const { items = [], isLoading } = this.props;

    if (!items.length && !isLoading) {
      return this.renderNoItems();
    }

    return (
      <div block="MyAccountMyWishlist" elem="Items">
        {items.map(this.renderItem)}
      </div>
    );
  }

  render() {
    return (
      <div block="MyAccountMyWishlist">
        {this.renderLoader()}
        {this.renderItems()}
      </div>
    );
  }
}

export default MyAccountMyWishlist;
