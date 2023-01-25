import { PureComponent } from "react";
import { connect } from "react-redux";
import Recommendations from "./Recommendations.component";

export const mapStateToProps = (_state) => ({
  // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (_dispatch) => ({
  // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class RecommendationsContainer extends PureComponent {
  containerProps = () => {
    const { products, isVueData } = this.props;
    return { products, isVueData };
  };

  render() {
    return (
      <Recommendations
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecommendationsContainer);
