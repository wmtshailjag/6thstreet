import PropTypes from "prop-types";
import { PureComponent } from "react";

import Algolia from "Util/API/provider/Algolia";

import PDPAlsoAvailable from "./PDPAlsoAvailable.component";

export class PDPAlsoAvailableContainer extends PureComponent {
  static propTypes = {
    productsAvailable: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  state = {
    products: [],
    isAlsoAvailable: true,
    firstLoad: true,
  };

  componentDidMount() {
    const { firstLoad, products = [] } = this.state;

    if (firstLoad && !products.length) {
      this.getAvailableProducts();
    }
  }

  getAvailableProducts() {
    const { productsAvailable = [] } = this.props;

    productsAvailable.map((productID) =>
      this.getAvailableProduct(productID).then((productData) => {
        let { products = [] } = this.state;

        if (productData.nbHits === 1) {
          this.setState({ products: [...products, productData.data] });
          products = this.state?.products || [];
        }

        this.setState({ isAlsoAvailable: products.length === 0 });
      })
    );
  }

  async getAvailableProduct(sku) {
    const product = await new Algolia().getProductBySku({ sku });

    return product;
  }

  render() {
    return (
      <PDPAlsoAvailable
        renderMySignInPopup={this.props.renderMySignInPopup}
        {...this.state}
      />
    );
  }
}

export default PDPAlsoAvailableContainer;
