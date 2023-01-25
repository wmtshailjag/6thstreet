import Link from "Component/Link";
import WishlistIcon from "Component/WishlistIcon";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import "./PDPAlsoAvailableProduct.style";

class PDPAlsoAvailableProduct extends PureComponent {
  static propTypes = {
    product: PropTypes.object.isRequired,
    setIsLoading: PropTypes.func.isRequired,
  };

  state = {
    date: "",
  };

  componentDidMount() {
    this.getDate();
  }

  getDate = () => {
    const date = new Date().toLocaleString("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    this.setState({ date });
  };

  renderNew() {
    const {
      product: { is_new_in },
    } = this.props;
    const { date } = this.state;
    if (is_new_in) {
      return <div block="ProductLabel">{__("New")}</div>;
    }

    return null;
  }

  renderImage() {
    const {
      product: { thumbnail_url },
    } = this.props;

    return (
      <div
        block="PDPAlsoAvailableProduct-Link"
        elem="Image"
        style={{
          backgroundImage: `url(${thumbnail_url})`,
        }}
      />
    );
  }

  renderColor() {
    const {
      product: { color },
    } = this.props;

    return (
      <h5 block="ProductItem" elem="Title">
        {color}
      </h5>
    );
  }

  alsoAvailableClick = () => {
    const { setIsLoading } = this.props;

    setIsLoading(true);
  };

  renderLink() {
    const {
      product,
      product: { url },
    } = this.props;

    const { pathname } = new URL(url);

    const linkTo = {
      pathname,
      state: { product },
    };

    return (
      <Link
        to={linkTo}
        onClick={this.alsoAvailableClick}
        block="PDPAlsoAvailableProduct"
        elem="Link"
      >
        {this.renderImage()}
        {this.renderColor()}
      </Link>
    );
  }

  render() {
    const {
      product: { sku },
      product,
      renderMySignInPopup,
    } = this.props;

    return (
      <li block="PDPAlsoAvailableProduct">
        <div block="PDPAlsoAvailableProduct" elem="OverlayContainer">
          {this.renderNew()}
          <WishlistIcon
            sku={sku}
            data={product}
            pageType="pdp"
            renderMySignInPopup={renderMySignInPopup}
          />
        </div>
        {this.renderLink()}
      </li>
    );
  }
}

export default PDPAlsoAvailableProduct;
