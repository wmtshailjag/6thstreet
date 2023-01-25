import ProductItem from "Component/ProductItem";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Products } from "Util/API/endpoint/Product/Product.type";
import { EVENT_PRODUCT_LIST_IMPRESSION } from "Component/GoogleTagManager/events/ProductImpression.event";
import Event from "Util/Event";
import "./PLPPage.style";
import isMobile from "Util/Mobile";

let gtmProdArr = [];
class PLPPage extends PureComponent {
  static propTypes = {
    products: Products.isRequired,
    impressions: Products.isRequired,
  };

  sendProductImpression = (product) => {
    gtmProdArr.push([product]);
    const product_numbers = isMobile.any() ? 4 : 6;
    const pagePathName = new URL(window.location.href).pathname;
    const getPageName =
      pagePathName == "/catalogsearch/result/"
        ? "Search Results"
        : "Category Results";

    if (gtmProdArr.length > product_numbers - 1) {
      let clubbedProducts = gtmProdArr.slice(0, product_numbers);
      gtmProdArr.splice(0, product_numbers);
      let prodImpression = [];
      for (var i = 0; i < clubbedProducts.length; i++) {
        for (var j = 0; j < clubbedProducts[i].length; j++) {
          let categorylistName = { list: getPageName };
          let clubbedData = {
            ...clubbedProducts[i][j][0],
            ...categorylistName,
          };
          prodImpression.push(clubbedData);
        }
      }
      Event.dispatch(EVENT_PRODUCT_LIST_IMPRESSION, prodImpression);
    }
  };

  renderProduct = (product, index, qid) => {
    const { sku } = product;
    const { renderMySignInPopup } = this.props;
    return (
      <ProductItem
        position={index}
        product={product}
        key={sku}
        pageType="plp"
        page="plp"
        renderMySignInPopup={renderMySignInPopup}
        qid={qid}
        lazyLoad={false}
        sendProductImpression={this.sendProductImpression}
      />
    );
  };

  renderProducts() {
    const { products = [], impressions = [] } = this.props;
    impressions.forEach((item, index) => {
      Object.assign(item, {
        product_Position: index + 1,
      });
    });
    var qid = null;
    if (new URLSearchParams(window.location.search).get("qid")) {
      qid = new URLSearchParams(window.location.search).get("qid");
    } else {
      qid = localStorage.getItem("queryID");
    }
    return products.map((i, index) => this.renderProduct(i, index + 1, qid));
  }

  render() {
    return (
      <div block="PLPPage">
        <ul block="ProductItems">{this.renderProducts()}</ul>
      </div>
    );
  }
}

export default withRouter(connect()(PLPPage));
