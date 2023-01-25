/* eslint-disable no-magic-numbers */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import CartItem from "Component/CartItem";
import CmsBlock from "Component/CmsBlock";
import { CART_OVERLAY } from "Component/Header/Header.config";
import Image from "Component/Image";
import Link from "Component/Link";
import { FIXED_CURRENCIES } from "Component/Price/Price.config";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import Overlay from "SourceComponent/Overlay";
import { TotalsType } from "Type/MiniCart";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import "./CartOverlay.style";
import Delivery from "./icons/delivery-truck.png";

export class CartOverlay extends PureComponent {
  static propTypes = {
    totals: TotalsType.isRequired,
    onVisible: PropTypes.func,
    handleCheckoutClick: PropTypes.func.isRequired,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    closePopup: PropTypes.func.isRequired,
    handleViewBagClick: PropTypes.func.isRequired,
    isHidden: PropTypes.bool,
    isCheckoutAvailable: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isHidden: false,
    onVisible: () => { },
  };

  state = {
    isArabic: isArabic(),
    isPopup: false,
  };

  componentDidMount() {
    const { showOverlay } = this.props;
    if (!isMobile.any()) {
      showOverlay(CART_OVERLAY);
    }
  }

  renderPriceLine(price) {
    const {
      totals: { quote_currency_code },
    } = this.props;
    const decimals = FIXED_CURRENCIES.includes(quote_currency_code) ? 3 : 2;

    return `${quote_currency_code} ${parseFloat(price).toFixed(decimals)}`;
  }

  renderCartItems() {
    const {
      totals: { items = [], quote_currency_code },
      closePopup,
    } = this.props;

    if (!items || items.length < 1) {
      return this.renderNoCartItems();
    }

    return (
      <ul block="CartOverlay" elem="Items" aria-label="List of items in cart">
        {items.map((item) => (
          <CartItem
            key={item.item_id}
            item={item}
            currency_code={quote_currency_code}
            brand_name={item.brand_name}
            isEditing
            closePopup={closePopup}
          />
        ))}
      </ul>
    );
  }

  renderNoCartItems() {
    return (
      <p block="CartOverlay" elem="Empty">
        {__("You have no items in your shopping cart.")}
      </p>
    );
  }

  renderTotals() {
    const {
      totals: { items = [], subtotal },
    } = this.props;
    const { isArabic } = this.state;

    if (!items || items.length < 1) {
      return null;
    }

    return (
      <dl block="CartOverlay" elem="Total" mods={{ isArabic }}>
        <dt>
          {__("Subtotal ")}
          <span>{__("(Taxes Included) ")}</span>
        </dt>
        <dd>{this.renderPriceLine(subtotal)}</dd>
      </dl>
    );
  }

  renderDiscount() {
    const {
      totals: { coupon_code, discount, discount_amount },
    } = this.props;
    const finalDiscount = discount_amount || discount || 0;

    if (!coupon_code && !finalDiscount && finalDiscount === 0) {
      return null;
    }

    return (
      <dl block="CartOverlay" elem="Discount">
        <dt>
          {coupon_code ? __("Coupon ") : __("Discount")}
          <strong block="CartOverlay" elem="DiscountCoupon">
            {coupon_code ? coupon_code.toUpperCase() : ""}
          </strong>
        </dt>
        <dd>{`-${this.renderPriceLine(Math.abs(finalDiscount))}`}</dd>
      </dl>
    );
  }

  renderShipping() {
    const {
      totals: { shipping_fee },
    } = this.props;

    if (!shipping_fee || shipping_fee === 0) {
      return null;
    }

    return (
      <dl block="CartOverlay" elem="Discount">
        <dt>{__("Shipping fee")}</dt>
        <dd>{this.renderPriceLine(shipping_fee)}</dd>
      </dl>
    );
  }

  renderActions() {
    const {
      totals: { items = [] },
      handleCheckoutClick,
      handleViewBagClick,
      isCheckoutAvailable,
    } = this.props;

    if (!items || items.length < 1) {
      return null;
    }

    const isDisabled = !isCheckoutAvailable;

    return (
      <div block="CartOverlay" elem="Actions">
        <Link
          block="CartOverlay"
          elem="CartButton"
          to={{
            pathname: "/cart",
            state: {
              prevPath: window.location.href,
            },
          }}
          onClick={handleViewBagClick}
        >
          {__("View bag")}
        </Link>
        <button
          block="CartOverlay"
          elem="CheckoutButton"
          mods={{ isDisabled }}
          onClick={handleCheckoutClick}
        >
          {__("Checkout")}
        </button>
      </div>
    );
  }

  renderPromoContent() {
    const { cart_content: { cart_cms } = {} } = window.contentConfiguration;
    const {
      totals: { currency_code, avail_free_shipping_amount },
    } = this.props;
    const { isArabic } = this.state;

    if (cart_cms) {
      return <CmsBlock identifier={cart_cms} />;
    }

    return (
      <div block="CartOverlay" elem="PromoBlock">
        <figcaption block="CartOverlay" elem="PromoText" mods={{ isArabic }}>
          <Image lazyLoad={true} src={Delivery} alt="Delivery icon" />
          {__("Add ")}
          <span block="CartOverlay" elem="Currency">
            {`${currency_code} ${avail_free_shipping_amount.toFixed(3)} `}
          </span>
          {__("more to your cart for ")}
          <span block="CartOverlay" elem="FreeDelivery">
            {__("Free delivery")}
          </span>
        </figcaption>
      </div>
    );
  }

  renderFreeShippingContent() {
    return (
      <div block="CartOverlay" elem="PromoFreeShipping">
        <span>{__("Free delivery*. More info ")}</span>
        <Link to="/shipping-policy">{__("here.")}</Link>
      </div>
    );
  }

  renderPromo() {
    const {
      totals: { avail_free_shipping_amount },
    } = this.props;

    if (!avail_free_shipping_amount && avail_free_shipping_amount !== 0) {
      return null;
    }
    return (
      <div block="CartOverlay" elem="Promo">
        {avail_free_shipping_amount === 0
          ? this.renderFreeShippingContent()
          : this.renderPromoContent()}
      </div>
    );
  }

  onCloseClick = () => {
    this.setState({ isPopup: true });
  };

  renderItemSuffix() {
    const {
      totals: { items = [] },
    } = this.props;

    const itemQuantityArray = items.map((item) => item.qty);
    const totalQuantity = itemQuantityArray.reduce(
      (qty, nextQty) => qty + nextQty,
      0
    );

    return totalQuantity === 1 ? __(" item") : __(" items");
  }

  renderItemCount() {
    const {
      hideActiveOverlay,
      closePopup,
      totals: { items = [] },
    } = this.props;

    const itemQuantityArray = items.map((item) => item.qty);
    const totalQuantity = itemQuantityArray.reduce(
      (qty, nextQty) => qty + nextQty,
      0
    );

    const svg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path
          d="M23.954 21.03l-9.184-9.095 9.092-9.174-1.832-1.807-9.09 9.179-9.176-9.088-1.81
                  1.81 9.186 9.105-9.095 9.184 1.81 1.81 9.112-9.192 9.18 9.1z"
        />
      </svg>
    );

    return (
      <div block="CartOverlay" elem="ItemCount">
        <div>
          {__("My Basket")}
          <div>
            {/* {totalQuantity}
            {this.renderItemSuffix()} */}
          </div>
        </div>
        <button onClick={hideActiveOverlay && closePopup}>{svg}</button>
      </div>
    );
  }

  render() {
    const { onVisible, isHidden, hideActiveOverlay, closePopup } = this.props;
    const { isArabic, isPopup } = this.state;

    return (
      <>
        <button
          block="HeaderCart"
          elem="PopUp"
          mods={{ isHidden }}
          onClick={hideActiveOverlay && closePopup}
        >
          closes popup
        </button>
        <Overlay
          id={CART_OVERLAY}
          onVisible={onVisible}
          mix={{ block: "CartOverlay", mods: { isArabic, isPopup } }}
        >
          {this.renderItemCount()}
          {this.renderCartItems()}
          {this.renderTotals()}
          {this.renderShipping()}
          {this.renderDiscount()}
          {this.renderActions()}
          {this.renderPromo()}
        </Overlay>
      </>
    );
  }
}

export default CartOverlay;
