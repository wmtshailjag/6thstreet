/* eslint-disable fp/no-let */
/* eslint-disable no-magic-numbers */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App/App";

class Price extends PureComponent {
  static propTypes = {
    basePrice: PropTypes.number.isRequired,
    specialPrice: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    fixedPrice: PropTypes.bool,
  };

  static defaultProps = {
    fixedPrice: false,
  };

  state = {
    isArabic: isArabic(),
  };

  haveDiscount() {
    const { basePrice, specialPrice } = this.props;

    return (
      specialPrice !== "undefined" && specialPrice && basePrice !== specialPrice
    );
  }

  renderDiscountSpecialPrice(onSale, specialPrice) {
    const { country, showDiscountPercentage } = this.props;
    const currency = getCurrency();
    return (
      <span
        block="Price"
        elem="Discount"
        mods={{ discount: this.haveDiscount() }}
      >
        {
          onSale
            ?
            <>
              {currency}
              <span block="Price-Discount" elem="space"></span>
              &nbsp;
              {specialPrice}
            </>
            :
            country && showDiscountPercentage
              ?
              <>
                {`${__("On Sale")} ${this.discountPercentage()} Off`}
              </>
              :
              null
        }
      </span>
    );
  }

  renderBasePrice() {
    const { basePrice, fixedPrice } = this.props;

    return (
      <span>
        {this.renderCurrency()}
        &nbsp;
        {fixedPrice ? (1 * basePrice).toFixed(3) : basePrice}
      </span>
    );
  }

  renderSpecialPrice() {
    const { specialPrice, fixedPrice } = this.props;
    const { isArabic } = this.state;

    return (
      <span
        block="Price"
        elem="Special"
        mods={{ discount: this.haveDiscount() }}
      >
        {this.renderCurrency()}
        &nbsp;
        {fixedPrice ? (1 * specialPrice).toFixed(3) : specialPrice}
        {!isArabic && <>&nbsp;</>}
      </span>
    );
  }

  discountPercentage() {
    const { basePrice, specialPrice, renderSpecialPrice, cart, country, showDiscountPercentage } = this.props;

    if (!showDiscountPercentage ) {
      return null
    }

    let discountPercentage = Math.round(100 * (1 - specialPrice / basePrice));
    if (discountPercentage === 0) {
      discountPercentage = 1;
    }
    if (!renderSpecialPrice && !cart) {
      return (
        <span
          block="SearchProduct"
          elem="Discount"
          mods={{ discount: this.haveDiscount() }}
        >
          (-{discountPercentage}%)<span> </span>
        </span>
      );
    } else {
      return `-${discountPercentage}%`;
    }
  }

  renderPrice() {
    const { basePrice, specialPrice, renderSpecialPrice } =
      this.props;
    const { isArabic } = this.state;

    const currency = getCurrency();

    if (!parseFloat(basePrice)) {
      return null;
    }

    if (basePrice === specialPrice || !specialPrice) {
      return this.renderBasePrice();
    }
    return (
      <>
        <span block="Price" elem="Wrapper">
          {renderSpecialPrice && this.renderSpecialPrice()}
          {isArabic && <>&nbsp;</>}

          <del block="Price" elem="Del">
            {this.renderBasePrice()}
          </del>
        </span>
        {!renderSpecialPrice ? (
          <span block="SearchProduct" elem="PriceWrapper">
            {this.discountPercentage(basePrice, specialPrice)}
            {this.renderDiscountSpecialPrice(true, specialPrice)}
          </span>
        ) : (
          this.renderDiscountSpecialPrice(false)
        )}
      </>
    );
  }

  renderCurrency() {
    const { currency } = this.props;
    return (
      <span block="Price" elem="Currency">
        {currency}
      </span>
    );
  }

  render() {
    const { isArabic } = this.state;
    return (
      <div
        block={`Price ${this.haveDiscount() ? "discount" : ""}`}
        mix={{ block: "Price", mods: { isArabic } }}
      >
        {this.renderPrice()}
      </div>
    );
  }
}

export default Price;