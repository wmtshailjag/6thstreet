import Image from "Component/Image";
import Link from "Component/Link";
import Price from "Component/Price";
import WishlistIcon from "Component/WishlistIcon";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { isArabic, truncate } from "Util/App";
import Event, { EVENT_GTM_PRODUCT_CLICK } from "Util/Event";
import isMobile from "Util/Mobile";
import "./PDPMixAndMatchProduct.style";

class PDPMixAndMatchProduct extends PureComponent {
  static propTypes = {
    product: PropTypes.object.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    selectedSizeCode: PropTypes.string.isRequired,
    selectedSizeType: PropTypes.string.isRequired,
    onSizeSelect: PropTypes.func.isRequired,
    addToCart: PropTypes.func.isRequired,
    routeChangeToCart: PropTypes.func.isRequired,
    togglePDPMixAndMatchProductSizePopup: PropTypes.func.isRequired,
  };

  checkStateForButtonDisabling() {
    const {
      isLoading,
      addedToCart,
      product: { stock_qty, highlighted_attributes },
      product = {},
      basePrice,
    } = this.props;
    if (
      isLoading ||
      addedToCart ||
      stock_qty === 0 ||
      highlighted_attributes === null ||
      !parseFloat(basePrice) ||
      (Object.keys(product).length === 0 && product.constructor === Object)
    ) {
      return true;
    }

    return false;
  }

  handleClick() {
    Event.dispatch(EVENT_GTM_PRODUCT_CLICK, product);
  }

  renderWishlistIcon() {
    const {
      product: { sku },
      product,
      renderMySignInPopup,
    } = this.props;
    return (
      <WishlistIcon
        sku={sku}
        mods={{ isArabic: isArabic() }}
        data={product}
        renderMySignInPopup={renderMySignInPopup}
        pageType="pdp"
      />
    );
  }

  renderImage() {
    const {
      product: { thumbnail_url, url ,  name },
    } = this.props;

    return (
      <Link to={url} onClick={this.handleClick}>
        <div block="OverlayIcons" mods={{ isArabic: isArabic() }}>
          {this.renderWishlistIcon()}
        </div>
        <Image lazyLoad={true} src={thumbnail_url} alt={ name ? name : "OverlayIconImage" } />
      </Link>
    );
  }

  renderName() {
    const {
      product: { brand_name, name, url },
    } = this.props;

    return (
      <Link
        block="PDPMixAndMatchProduct-SummaryAndAddToCartContainer"
        elem="NameContainer"
        to={url}
        onClick={this.handleClick}
      >
        <h3>{brand_name}</h3>
        <h6>{isMobile.any() ? name : truncate(name, 20)}</h6>
      </Link>
    );
  }

  renderColor() {
    const {
      product: { color },
    } = this.props;

    return (
      <div
        block="PDPMixAndMatchProduct-SummaryAndAddToCartContainer"
        elem="ColorContainer"
      >
        <h3>
          <span>{__("Color: ")}</span>
          {color}
        </h3>
      </div>
    );
  }

  renderSizeSelect() {
    const {
      product: { simple_products },
      selectedSizeCode,
      selectedSizeType,
      onSizeSelect,
      sizeObject,
      togglePDPMixAndMatchProductSizePopup,
    } = this.props;

    const handleClick = (e) => {
      e.preventDefault();
      togglePDPMixAndMatchProductSizePopup();
    };

    if (
      sizeObject.sizeTypes !== undefined &&
      sizeObject.sizeTypes.length !== 0
    ) {
      const label = simple_products[selectedSizeCode].size[selectedSizeType];
      return (
        <div block="PDPMixAndMatchAddToCart" elem="SizeSelector">
          <h3>{__("Size: ")}</h3>
          <button
            key="SizeSelect"
            block="PDPMixAndMatchAddToCart-SizeSelector"
            elem="SizeSelectElement"
            onClick={handleClick}
          >
            {label}
          </button>
        </div>
      );
    }

    return null;
  }

  renderPrice() {
    const {
      product: { price },
    } = this.props;

    return <Price price={price} renderSpecialPrice={true} />;
  }

  renderAddToCartButton() {
    const {
      addToCart,
      isLoading,
      addedToCart,
      product: { stock_qty, highlighted_attributes, simple_products = {} },
      product = {},
    } = this.props;

    const disabled = this.checkStateForButtonDisabling();

    return (
      <>
        <button
          onClick={addToCart}
          block="PDPMixAndMatchAddToCart"
          elem="AddToCartButton"
          mods={{ isLoading }}
          mix={{
            block: "PDPMixAndMatchAddToCart",
            elem: "AddToCartButton",
            mods: { addedToCart },
          }}
          disabled={disabled}
        >
          <span>{__("Add to bag")}</span>
          <span>{__("Adding...")}</span>
          <span>{__("Added to bag")}</span>
        </button>
      </>
    );
  }

  renderAddToCart() {
    return (
      <div block="PDPMixAndMatchAddToCart">
        {this.renderSizeSelect()}
        {this.renderAddToCartButton()}
      </div>
    );
  }

  render() {
    return (
      <>
        <li block="PDPMixAndMatchProduct">
          <div
            block="PDPMixAndMatchProduct"
            elem="ImageContainer"
            mods={{ isArabic: isArabic() }}
          >
            {this.renderImage()}
          </div>
          <div
            block="PDPMixAndMatchProduct"
            elem="SummaryAndAddToCartContainer"
          >
            {this.renderName()}
            {this.renderPrice()}
            {this.renderColor()}
            {this.renderAddToCart()}
          </div>
        </li>
      </>
    );
  }
}

export default PDPMixAndMatchProduct;
