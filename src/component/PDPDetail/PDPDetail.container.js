// import PropTypes from 'prop-types';
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import PDPDetail from "./PDPDetail.component";

export const mapStateToProps = (_state) => ({
  // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (_dispatch) => ({
  // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class PDPDetailContainer extends PureComponent {
  static propTypes = {
    brandDeascription: PropTypes.string,
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
  };

  containerFunctions = {
    // getData: this.getData.bind(this)
  };

  containerProps = () => {
    // isDisabled: this._getIsDisabled()
    const { brandDescription, brandImg, brandName } = this.props;
    return {
      brandDescription,
      brandImg,
      brandName,
    };
  };

  render() {
    return (
      <PDPDetail {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PDPDetailContainer);
