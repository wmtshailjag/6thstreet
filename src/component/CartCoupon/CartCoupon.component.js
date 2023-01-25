import Field from "Component/Field";
import Loader from "Component/Loader";
import { CartCoupon as SourceCartCoupon } from "SourceComponent/CartCoupon/CartCoupon.component";
import { isArabic } from "Util/App";
import Event, {
  EVENT_REMOVE_COUPON,
  EVENT_APPLY_COUPON_FAILED,
  EVENT_APPLY_COUPON,
  EVENT_GTM_COUPON,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import "./CartCoupon.extended.style";

export class CartCoupon extends SourceCartCoupon {
  handleCouponCodeChange = (enteredCouponCode) => {
    this.setState({
      enteredCouponCode: this.removeCouponSpace(enteredCouponCode),
    });
  };

  removeCouponSpace = (value) => {
    return value.replace(/\s/g, "");
  };

  handleApplyCoupon = () => {
    const { handleApplyCouponToCart } = this.props;
    const { enteredCouponCode } = this.state;
    const formattedCouponValue = this.removeCouponSpace(enteredCouponCode);
    handleApplyCouponToCart(formattedCouponValue);
  };

  sendMOEEvents(event, coupon) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      coupon_code: coupon || "",
      app6thstreet_platform: "Web",
    });
  }

  handleApplyCode = async (e, couponCode) => {
    e.stopPropagation();

    try {
      let apiResponse =
        (await this.props.applyCouponToCart(couponCode)) || null;
      if (apiResponse) {
        this.sendMOEEvents(EVENT_APPLY_COUPON_FAILED, couponCode);
        const eventData = {
          name: EVENT_APPLY_COUPON_FAILED,
          coupon: couponCode,
        };
        Event.dispatch(EVENT_GTM_COUPON, eventData);
      } else {
        this.sendMOEEvents(EVENT_APPLY_COUPON, couponCode);
        const eventData = {
          name: EVENT_APPLY_COUPON,
          coupon: couponCode,
        };
        Event.dispatch(EVENT_GTM_COUPON, eventData);
      }
      if (typeof apiResponse !== "string") {
        this.props.closePopup();
      }
    } catch (error) {
      console.error(error);
    }
  };

  handleRemoveCoupon = () => {
    const { handleRemoveCouponFromCart } = this.props;
    const { couponCode } = this.props;
    localStorage.removeItem("lastCouponCode");
    handleRemoveCouponFromCart();
    this.sendMOEEvents(EVENT_REMOVE_COUPON, couponCode);
    const eventData = { name: EVENT_REMOVE_COUPON, coupon: couponCode };
    Event.dispatch(EVENT_GTM_COUPON, eventData);

    // We need to reset input field. If we do it in applyCouponCode,
    // then it will disappear if code is incorrect. We want to avoid it
    this.setState({
      enteredCouponCode: "",
    });
  };

  handleFormSubmit = (e) => {
    const { couponCode } = this.props;
    e.preventDefault();

    if (couponCode) {
      this.handleRemoveCoupon();
      return;
    }

    const submitButton = document.getElementById("couponCodeButton");
    submitButton.click();
  };

  renderApplyCoupon() {
    const { enteredCouponCode } = this.state;
    const formattedCouponValue = this.removeCouponSpace(enteredCouponCode);
    localStorage.setItem("lastCouponCode", formattedCouponValue);
    return (
      <>
        <Field
          type="text"
          id="couponCode"
          name="couponCode"
          value={formattedCouponValue}
          placeholder={__("Enter a Coupon or Discount Code")}
          onChange={this.handleCouponCodeChange}
          mix={{ block: "CartCoupon", elem: "Input" }}
        />
        <button
          block="CartCoupon"
          elem="Button"
          type="button"
          id="couponCodeButton"
          mix={{ block: "Button" }}
          disabled={!formattedCouponValue}
          onClick={(e) => {
            this.handleApplyCode(e, formattedCouponValue);
          }}
        >
          {__("Add")}
        </button>
      </>
    );
  }

  renderRemoveCoupon() {
    const { couponCode } = this.props;

    return (
      <>
        <p block="CartCoupon" elem="Message">
          <strong>{couponCode.toUpperCase()}</strong>
        </p>
        <button
          block="CartCoupon"
          elem="Button"
          type="button"
          mix={{ block: "Button" }}
          onClick={this.handleRemoveCoupon}
        >
          {__("Remove")}
        </button>
      </>
    );
  }

  render() {
    const { isLoading, couponCode } = this.props;
    return (
      <form
        block="CartCoupon"
        mods={{ active: !!couponCode, isArabic: isArabic() }}
        onSubmit={this.handleFormSubmit}
      >
        <Loader isLoading={isLoading} />
        {couponCode ? this.renderRemoveCoupon() : this.renderApplyCoupon()}
      </form>
    );
  }
}

export default CartCoupon;
