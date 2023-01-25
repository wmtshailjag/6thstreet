import Image from "Component/Image";
import Link from "Component/Link";
import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App/App";
import Event, { EVENT_GTM_WISHLIST_PRODUCT_CLICK } from "Util/Event";

class WishlistSliderItem extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.childRef = React.createRef();
    this.state = {
      isArabic: isArabic(),
    };
  }

  discountPercentage(basePrice, specialPrice, haveDiscount) {
    let discountPercentage = Math.round(100 * (1 - specialPrice / basePrice));
    if (discountPercentage === 0) {
      discountPercentage = 1;
    }

    return (
      <span
        block="VueProductSlider"
        elem="Discount"
        mods={{ discount: haveDiscount }}
      >
        -{discountPercentage}%<span> </span>
      </span>
    );
  }

  renderSpecialPrice(specialPrice, haveDiscount) {
    const currency = getCurrency();
    return (
      <span
        block="VueProductSlider"
        elem="SpecialPrice"
        mods={{ discount: haveDiscount }}
      >
        {currency}
        <span> </span>
        {specialPrice}
      </span>
    );
  }

  renderPrice(price) {
    if (price && price.length > 0) {
      const priceObj = price[0],
        currency = getCurrency();
      const basePrice = priceObj[currency]["6s_base_price"];
      const specialPrice = priceObj[currency]["6s_special_price"];
      const haveDiscount =
        specialPrice !== "undefined" &&
        specialPrice &&
        basePrice !== specialPrice;

      if (basePrice === specialPrice || !specialPrice) {
        return (
          <div block="VueProductSlider" elem="SpecialPriceCon">
            <span block="VueProductSlider" elem="PriceWrapper">
              <span
                id="price"
                style={{ color: "#000000" }}
              >{`${currency} ${basePrice}`}</span>
            </span>
          </div>
        );
      }

      return (
        <div block="VueProductSlider" elem="SpecialPriceCon">
          <del block="VueProductSlider" elem="Del">
            <span id="price">{`${currency} ${basePrice}`}</span>
          </del>
          <span block="VueProductSlider" elem="PriceWrapper">
            {this.discountPercentage(basePrice, specialPrice, haveDiscount)}
            {this.renderSpecialPrice(specialPrice, haveDiscount)}
          </span>
        </div>
      );
    }
    return null;
  }

  handleWishlistProductClick = (product) => {
    Event.dispatch(EVENT_GTM_WISHLIST_PRODUCT_CLICK, product);
  };

  render() {
    const {
      data: { thumbnail_url, name, brand_name, price, sku, url = "" },
      data,
    } = this.props;
    const { isArabic } = this.state;
    return (
      <div
        block="VueProductSlider"
        elem="VueProductContainer"
        data-sku={sku}
        mods={{ isArabic }}
        ref={this.childRef}
      >
        <Link
          to={url.split("?_ga")[0]}
          data-banner-type="vueSlider"
          block="VueProductSlider-Link"
          onClick={() => this.handleWishlistProductClick(data)}
        >
          <Image lazyLoad={true}
            block="VueProductSlider"
            elem="VueProductImage"
            src={thumbnail_url}
            alt={name}
          />
        </Link>
        <h6 id="brandName">{brand_name}</h6>
        <span id="productName">{name}</span>
        {this.renderPrice(price)}
      </div>
    );
  }
}

export default WishlistSliderItem;
