import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { Product } from "Util/API/endpoint/Product/Product.type";
import Algolia from "Util/API/provider/Algolia";

import PDPMixAndMatch from "./PDPMixAndMatch.component";

export const mapStateToProps = (state) => ({
  product: state.PDP.product,
});

export class PDPMixAndMatchContainer extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  state = {
    products: [],
    isAlsoAvailable: true,
    firstLoad: true,
  };

  async getAvailableProduct(sku) {
    const product = await new Algolia().getProductBySku({ sku });
    return product;
  }

  getAvailableProducts() {
    const {
      product: { mix_and_match },
    } = this.props;
    const mixAndMatchSKUs = mix_and_match?.split(",") || [];
    mixAndMatchSKUs.map((productID) =>
      this.getAvailableProduct(productID).then((productData) => {
        const { products = [] } = this.state;
        if (productData.nbHits === 1) {
          this.setState({ products: [...products, productData.data] });
        }
      })
    );
  }

  componentDidMount() {
    const { firstLoad, products = [] } = this.state;

    if (firstLoad && !products.length) {
      this.getAvailableProducts();
    }
  }

  render() {
    return (
      <PDPMixAndMatch
        renderMySignInPopup={this.props.renderMySignInPopup}
        {...this.state}
      />
    );
  }
}

export default connect(mapStateToProps, null)(PDPMixAndMatchContainer);
