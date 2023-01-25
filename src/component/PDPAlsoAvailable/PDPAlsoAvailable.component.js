import PropTypes from "prop-types";
import { PureComponent } from "react";

import PDPAlsoAvailableProduct from "Component/PDPAlsoAvailableProduct";
import isMobile from "Util/Mobile";

import "./PDPAlsoAvailable.style";

class PDPAlsoAvailable extends PureComponent {
  static propTypes = {
    products: PropTypes.array.isRequired,
    isAlsoAvailable: PropTypes.bool.isRequired,
  };
  state = {
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  renderAvailableProduct = (product) => {
    const { sku } = product;
    const { renderMySignInPopup } = this.props;
    return (
      <PDPAlsoAvailableProduct
        product={product}
        renderMySignInPopup={renderMySignInPopup}
        key={sku}
      />
    );
  };

  renderAvailableProducts() {
    const { products = [] } = this.props;

    return products.map(this.renderAvailableProduct);
  }
  renderSeperator() {
    return <div block="Seperator"></div>;
  }

  render() {
    const { isAlsoAvailable } = this.props;
    const { isMobile } = this.state;
    return (
      <>
        {isMobile && this.renderSeperator()}
        <div block="PDPAlsoAvailable" mods={{ isAlsoAvailable }}>
          <h2 block="PDPAlsoAvailable" elem="Title">
            {isMobile ? __("Also available in") : __("Also available in:")}
          </h2>
          <ul block="PDPAlsoAvailable" elem="List">
            {this.renderAvailableProducts()}
          </ul>
        </div>
      </>
    );
  }
}

export default PDPAlsoAvailable;
