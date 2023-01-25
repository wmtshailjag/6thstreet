/* eslint-disable radix */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-magic-numbers */
import ChangePhonePopup from "Component/ChangePhonePopUp";
import { MINI_CARDS } from "Component/CreditCard/CreditCard.config";
import Field from "Component/Field";
import Form from "Component/Form";
import Link from "Component/Link";
import MyAccountOverlay from "Component/MyAccountOverlay";
import { getFinalPrice } from "Component/Price/Price.config";
import SuccessCheckoutItem from "Component/SuccessCheckoutItem";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { TotalsType } from "Type/MiniCart";
import MyAccountOrderViewItem from "Component/MyAccountOrderViewItem";
import { getDiscountFromTotals, isArabic, getCurrency } from "Util/App";
import { EMAIL_LINK, TEL_LINK, WHATSAPP_LINK } from "./CheckoutSuccess.config";
import "./CheckoutSuccess.style";
import Apple from "./icons/apple.png";
import Call from "./icons/call.svg";
import Cash from "./icons/cash.png";
import Confirm from "./icons/confirm.png";
import Mail from "./icons/mail.svg";
import SuccessCircle from "./icons/success-circle.png";
import TabbyAR from "./icons/tabby-ar.png";
import Tabby from "../../style/icons/tabby.png";
import Whatsapp from "./icons/whatsapp.svg";
import Image from "Component/Image";
import Event, {
  EVENT_GTM_PURCHASE,
  EVENT_MOE_CONTINUE_SHOPPING,
  EVENT_PHONE,
  EVENT_MAIL,
  EVENT_MOE_CHAT,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class CheckoutSuccess extends PureComponent {
  static propTypes = {
    initialTotals: TotalsType.isRequired,
    shippingAddress: PropTypes.object.isRequired,
    billingAddress: PropTypes.object.isRequired,
    paymentMethod: PropTypes.object.isRequired,
    creditCardData: PropTypes.object.isRequired,
    orderID: PropTypes.number.isRequired,
    incrementID: PropTypes.number.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerificationCodeSent: PropTypes.bool.isRequired,
    requestCustomerData: PropTypes.func.isRequired,
    customer: PropTypes.isRequired,
    onVerifySuccess: PropTypes.func.isRequired,
    onResendCode: PropTypes.func.isRequired,
    isPhoneVerified: PropTypes.bool.isRequired,
    changePhone: PropTypes.func.isRequired,
    isChangePhonePopupOpen: PropTypes.bool.isRequired,
    toggleChangePhonePopup: PropTypes.func.isRequired,
    phone: PropTypes.string.isRequired,
    cashOnDeliveryFee: PropTypes.number.isRequired,
    selectedCard: PropTypes.object.isRequired,
  };

  state = {
    paymentTitle: "",
    isArabic: isArabic(),
    isPhoneVerification: true,
    delay: 1000,
    successHidden: false,
    wasLoaded: false,
  };

  componentDidMount() {
    const { delay } = this.state;
    this.timer = setInterval(this.tick, delay);
  }

  componentDidUpdate(prevState) {
    const { delay } = this.state;
    if (prevState !== delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, delay);
    }
  }

  componentWillUnmount() {
    const { setCheckoutDetails } = this.props;
    setCheckoutDetails(false);
  }
  tick = () => {
    const { wasLoaded, successHidden } = this.state;
    if (!successHidden) {
      this.setState({ successHidden: true });
    }
    if (!wasLoaded && successHidden) {
      this.setState({ wasLoaded: true });
    }
  };

  renderSuccessMessage = (email) => {
    const { isArabic } = this.state;

    return (
      <div block="SuccessMessage" mods={{ isArabic }}>
        <div block="SuccessMessage" elem="Icon" mods={{ isArabic }}>
          <img src={SuccessCircle} alt="success circle" />
        </div>
        <div block="SuccessMessage" elem="Text">
          <div block="SuccessMessage-Text" elem="Title">
            {__("Order Placed")}
          </div>
          <div block="SuccessMessage-Text" elem="Message">
            {__("Order confirmation has been sent to")}
          </div>
          <div block="SuccessMessage-Text" elem="Email">
            {email}
          </div>
        </div>
      </div>
    );
  };

  renderPhoneVerified() {
    const { isPhoneVerified } = this.props;
    const { isArabic } = this.state;

    if (!isPhoneVerified) {
      return null;
    }

    return (
      <div block="PhoneVerified" mods={{ isArabic }}>
        <div block="PhoneVerified" elem="Content" mods={{ isArabic }}>
          <div block="PhoneVerified" elem="Image">
            <img src={Confirm} alt="Verified" />
          </div>
          <div block="PhoneVerified" elem="Text">
            {__("Phone Verified")}
          </div>
        </div>
      </div>
    );
  }

  renderTrackOrder() {
    const {
      isSignedIn,
      orderID,
      onVerifySuccess,
      onResendCode,
      isPhoneVerified,
      toggleChangePhonePopup,
      phone,
      isVerificationCodeSent,
    } = this.props;
    const { isArabic, isPhoneVerification } = this.state;
    const countryCode = phone ? phone.slice(0, "4") : null;
    const phoneNumber = phone ? phone.slice("4") : null;

    if (!isPhoneVerified && isVerificationCodeSent && isSignedIn) {
      return (
        <div
          mix={{ block: "TrackOrder", mods: { isArabic, isPhoneVerification } }}
        >
          <div block="TrackOrder" elem="Text">
            <div block="TrackOrder-Text" elem="Title">
              {__("Please Verify your Number")}
            </div>
            <div block="TrackOrder-Text" elem="Message">
              {__("Verification code has been sent to")}
            </div>
            <div block="TrackOrder-Text" elem="Phone">
              <button onClick={toggleChangePhonePopup}>
                {`${countryCode} ${phoneNumber}`}
              </button>
            </div>
          </div>
          <Form onSubmitSuccess={onVerifySuccess}>
            <div block="TrackOrder" elem="Code" mods={{ isArabic }}>
              <Field
                maxlength="5"
                type="text"
                placeholder="_____"
                name="otp"
                id="otp"
              />
            </div>
            <button block="primary" type="submit">
              {__("Verify phone number")}
            </button>
          </Form>
          <div block="TrackOrder" elem="ResendCode">
            <button onClick={onResendCode}>
              {__("Resend Verification Code")}
            </button>
          </div>
        </div>
      );
    }

    if (!isPhoneVerified && !isVerificationCodeSent && isSignedIn) {
      return (
        <div mix={{ block: "TrackOrder", mods: { isArabic, isSignedIn } }}>
          <Link to={`/sales/order/view/order_id/${orderID}/`}>
            <button block="primary">{__("track your order")}</button>
          </Link>
        </div>
      );
    }

    if (isPhoneVerified && isSignedIn) {
      return (
        <div mix={{ block: "TrackOrder", mods: { isArabic, isSignedIn } }}>
          <Link to={`/sales/order/view/order_id/${orderID}/`}>
            <button block="primary">{__("track your order")}</button>
          </Link>
        </div>
      );
    }

    return (
      <div mix={{ block: "TrackOrder", mods: { isArabic } }}>
        <div block="TrackOrder" elem="Text">
          <span block="TrackOrder" elem="Text-Title">
            {__("track your order")}
          </span>
          <span block="TrackOrder" elem="Text-SubTitle">
            {__("sign in to access your account and track your order")}
          </span>
        </div>
        <button block="secondary" onClick={this.showMyAccountPopup}>
          {__("sign in")}
        </button>
      </div>
    );
  }

  showMyAccountPopup = () => {
    this.setState({ showPopup: true });
  };

  renderChangePhonePopUp = () => {
    const {
      changePhone,
      shippingAddress,
      toggleChangePhonePopup,
      isChangePhonePopupOpen,
    } = this.props;

    return (
      <ChangePhonePopup
        isChangePhonePopupOpen={isChangePhonePopupOpen}
        closeChangePhonePopup={toggleChangePhonePopup}
        changePhone={changePhone}
        countryId={shippingAddress.country_id}
      />
    );
  };

  renderMyAccountPopup() {
    const { showPopup } = this.state;
    const {
      billingAddress: { guest_email: email },
    } = this.props;

    if (!showPopup) {
      return null;
    }

    return (
      <MyAccountOverlay
        closePopup={this.closePopup}
        onSignIn={this.onSignIn}
        email={email}
        isPopup
      />
    );
  }

  onSignIn = () => {
    const { requestCustomerData } = this.props;

    // requestCustomerData();
    this.closePopup();
  };

  closePopup = () => {
    this.setState({ showPopup: false });
  };

  renderItem = (item) => {
    const {
      order: { base_currency_code: currency },
      eddResponse,
      intlEddResponse,
      isFailed,
      edd_info,
      paymentMethod
    } = this.props;

    return (
      <MyAccountOrderViewItem
        key={item.item_id}
        item={item}
        isFailed={isFailed}
        compRef={"checkout"}
        edd_info={edd_info}
        paymentMethod={paymentMethod}
        eddResponse={eddResponse}
        intlEddResponse={intlEddResponse}
        currency={currency}
        displayDiscountPercentage={true}
      />
    );
  };

  renderTotalsItems() {
    const { paymentMethod } = this.props;
    if (
      paymentMethod?.code === "checkout_qpay" ||
      paymentMethod?.code === "tabby_installments"
    ) {
      const {
        order: { status, unship = [], base_currency_code: currency },
        incrementID,
      } = this.props;

      return (
        <div block="TotalItems">
          <div block="TotalItems" elem="OrderId">
            {`${__("Order")} #${incrementID} ${__("Details")}`}
          </div>
          <ul block="TotalItems" elem="Items">
            {unship
              .reduce((acc, { items }) => [...acc, ...items], [])
              .filter(
                ({ qty_canceled, qty_ordered }) => +qty_canceled < +qty_ordered
              )
              .map(this.renderItem)}
          </ul>
        </div>
      );
    } else if (paymentMethod?.code === "checkout_knet") {
      
      const {
        order: { unship = [], base_currency_code: currency },
        incrementID,
      } = this.props;

      return (
        <div block="TotalItems">
          <div block="TotalItems" elem="OrderId">
            {`${__("Order")} #${incrementID} ${__("Details")}`}
          </div>
          <ul block="TotalItems" elem="Items">
            {unship
              .reduce((acc, { items }) => [...acc, ...items], [])
              .filter(
                ({ qty_canceled, qty_ordered }) => +qty_canceled < +qty_ordered
              )
              .map(this.renderItem)}
          </ul>
        </div>
      );
    
    } else {
      const {
        initialTotals: { items = [], quote_currency_code },
        incrementID,
        isFailed,
      } = this.props;

      if (!items || items.length < 1) {
        return <p>{__("There are no products in totals.")}</p>;
      }

      return (
        <div block="TotalItems">
          <div block="TotalItems" elem="OrderId">
            {`${__("Order")} #${incrementID} ${__("Details")}`}
          </div>
          <ul block="TotalItems" elem="Items">
            {items.map((item) => (
              <SuccessCheckoutItem
                key={item.item_id}
                item={item}
                currency_code={quote_currency_code}
                isEditing
                isFailed={isFailed}
                isLikeTable
              />
            ))}
          </ul>
        </div>
      );
    }
  }

  renderTotalPrice() {
    const { paymentMethod } = this.props;
    let fullPrice;
    if (
      paymentMethod?.code === "checkout_qpay" ||
      paymentMethod?.code === "tabby_installments"
    ) {
      const {
        order: { grand_total = 0, currency_code = getCurrency() },
      } = this.props;
      fullPrice = `${currency_code} ${grand_total}`;
    } else {
      const {
        initialTotals: { total, quote_currency_code },
      } = this.props;
      const finalPrice = getFinalPrice(total, quote_currency_code);
      fullPrice = `${quote_currency_code} ${finalPrice}`;
    }

    return (
      <div block="Totals">
        <div block="Totals" elem="TotalTitles">
          <span block="Title">{__("Total Amount")}</span>
          <span block="SubTitle">{__("(Taxes included)")}</span>
        </div>
        <div block="Totals" elem="TotalPrice">
          <div>{fullPrice}</div>
        </div>
      </div>
    );
  }

  renderPriceLine(price, name) {
    if (!price) {
      return null;
    }

    const {
      initialTotals: { quote_currency_code },
    } = this.props;
    const finalPrice = getFinalPrice(price, quote_currency_code);

    const fullPrice = `${quote_currency_code} ${finalPrice}`;

    return (
      <div block="Totals">
        <div block="Totals" elem="Title">
          <span>{name}</span>
        </div>
        <div block="Totals" elem="Price">
          <div>{fullPrice}</div>
        </div>
      </div>
    );
  }

  renderTotals = () => {
    const { isArabic } = this.state;
    const {
      cashOnDeliveryFee,
      initialTotals: { coupon_code: couponCode, discount, total_segments = [] },
    } = this.props;

    return (
      <div block="PriceTotals" mods={{ isArabic }}>
        {this.renderPriceLine(
          getDiscountFromTotals(total_segments, "subtotal"),
          __("Subtotal")
        )}
        {this.renderPriceLine(
          getDiscountFromTotals(total_segments, "shipping"),
          __("Shipping")
        )}
        {this.renderPriceLine(
          cashOnDeliveryFee ??
            getDiscountFromTotals(total_segments, "msp_cashondelivery"),
          getCountryFromUrl() === "QA"
            ? __("Cash on Receiving Fee")
            : __("Cash on Delivery Fee")
        )}
        {this.renderPriceLine(
          getDiscountFromTotals(total_segments, "customerbalance"),
          __("Store Credit")
        )}
        {this.renderPriceLine(
          getDiscountFromTotals(total_segments, "clubapparel"),
          __("Club Apparel Redemption")
        )}
        {couponCode || (discount && discount != 0)
          ? this.renderPriceLine(discount, __("Discount"))
          : null}

        {this.renderTotalPrice()}
      </div>
    );
  };

  renderContact = () => {
    const { isArabic } = this.state;

    return (
      <div block="ContactInfo" mods={{ isArabic }}>
        <div block="ContactInfo" elem="Links">
          <a
            href={`tel:${TEL_LINK}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => this.sendMOEEvents(EVENT_PHONE)}
          >
            <div block="ContactInfo" elem="Link">
              <span>
                <img src={Call} alt="Call" />
              </span>
              <span block="ContactInfo" elem="LinkName">
                {__("Phone")}
              </span>
            </div>
          </a>
          <a
            href={`mailto:${EMAIL_LINK}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => this.sendMOEEvents(EVENT_MAIL)}
          >
            <div block="ContactInfo" elem="LinkMiddle">
              <span>
                <img src={Mail} alt="e-mail" />
              </span>
              <span block="ContactInfo" elem="LinkName">
                {__("Email")}
              </span>
            </div>
          </a>
          <a
            href={`${WHATSAPP_LINK}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => this.sendMOEEvents(EVENT_MOE_CHAT)}
          >
            <div block="ContactInfo" elem="Link">
              <span>
                <img src={Whatsapp} alt="whatsapp" />
              </span>
              <span block="ContactInfo" elem="LinkName">
                {__("Whatsapp")}
              </span>
            </div>
          </a>
        </div>
        <div block="ContactInfo" elem="Timing">
          <span>{__("Customer service is available all days")}</span>
          <span>
            {__("from: ")}
            <span block="ContactInfo" elem="Time">
              {__("9am - 9pm")}
            </span>
          </span>
        </div>
      </div>
    );
  };

  renderClickAndCollectStoreName() {
    const {
      item: { extension_attributes },
    } = this.props;

    const { isArabic } = this.state;
    if (extension_attributes?.click_to_collect_store) {
      return (
        <div block="CartPageItem" elem="ClickAndCollect" mods={{ isArabic }}>
          <div block="CartPageItem-ClickAndCollect" elem="icon">
            <Store />
          </div>
          <div block="CartPageItem-ClickAndCollect" elem="StoreName">
            {extension_attributes?.click_to_collect_store_name}
          </div>
        </div>
      );
    }
    return null;
  }

  renderDeliveringAddress() {
    const {
      shippingAddress: {
        firstname,
        lastname,
        street,
        postcode,
        phone,
        city,
        country_id,
      },
    } = this.props;
    return (
      <div block="Address">
        <div block="Address" elem="Title">
          {__("Delivering to")}
        </div>
        <div block="Address" elem="FullName">
          {`${firstname} ${lastname}`}
        </div>
        <div block="Address" elem="Street">
          {street}, {postcode}
        </div>
        <div block="Address" elem="PostCode">
          {city} - {country_id}
        </div>
      </div>
    );
  }

  renderBillingAddress() {
    const {
      billingAddress: { firstname, lastname, street, postcode, phone },
    } = this.props;

    return (
      <div block="Address">
        <div block="Address" elem="Title">
          {__("Billing Address")}
        </div>
        <div block="Address" elem="FullName">
          {`${firstname} ${lastname}`}
        </div>
        <div block="Address" elem="Street">
          {street}
        </div>
        <div block="Address" elem="PostCode">
          {postcode}
        </div>
        <div block="Address" elem="Phone">
          {phone}
        </div>
      </div>
    );
  }

  renderAddresses = () => (
    <div block="Addresses">{this.renderDeliveringAddress()}</div>
  );

  renderDeliveryOption = () => (
    <div block="DeliveryOptions">
      <div block="DeliveryOptions" elem="Title">
        {__("Delivery Options")}
      </div>
      <div block="DeliveryOptions" elem="Option">
        {__("FREE (Standard Delivery)")}
      </div>
    </div>
  );

  renderKnetStatus = () => {
    const { KnetDetails } = this.props;
    const { status} = KnetDetails;
    if(status === "SUCCESS"){
      return  __("SUCCESS");
    }else if (status === "FAILED"){
      return __("FAILED");
    }
  }

  renderKNETPaymentType = () => {
    const { KnetDetails, paymentMethod } = this.props;
    const { isArabic } = this.state;
     const { amount, bank_reference, currency, date, knet_payment_id, knet_transaction_id, status} = KnetDetails;
    return (
      <>
        <br /><br />
        {paymentMethod?.code === "checkout_knet" && KnetDetails && (
          <>
            {KnetDetails?.knet_payment_id && (
              <>
                {" "}
                <div block="PaymentType" elem="Title">
                  {__("KNET Payment Id")}
                </div>
                {KnetDetails?.knet_payment_id}
                <br /><br />{" "}
              </>
            )}

            {KnetDetails?.knet_transaction_id && (
              <>
                {" "}
                <div block="PaymentType" elem="Title">
                  {__("KNET Transaction Id")}
                </div>
                {KnetDetails?.knet_transaction_id}
                <br /><br />{" "}
              </>
            )}

            {KnetDetails?.amount && (
              <>
                {" "}
                <div block="PaymentType" elem="Title">
                  {__("Amount")}
                </div>
                {currency} {KnetDetails?.amount}
                <br /><br />{" "}
              </>
            )}
            <div block="PaymentType" elem="Title">
              {__("Status")}
            </div>
            {isArabic ? this.renderKnetStatus() : status}
            <br /><br />
            <div block="PaymentType" elem="Title">
              {__("Date")}
            </div>
            {date}
            <br /><br />
          </>
        )}
      </>
    )
  }

  renderPaymentType = () => {
    const { isArabic } = this.state;
    const { QPAY_DETAILS, paymentMethod, KnetDetails } = this.props;
    const { PUN, date, status } = QPAY_DETAILS;
    return (
      <>
        <div block="PaymentType" mods={{ isArabic }}>
          <div block="PaymentType" elem="Title">
            {__("Payment")}
          </div>
          {this.renderPaymentTypeContent()}
          {paymentMethod?.code === "checkout_knet" ? this.renderKNETPaymentType() : null}
          <p></p>
          {paymentMethod?.code === "checkout_qpay" && QPAY_DETAILS && (
            <>
              <div block="PaymentType" elem="Title">
                {__("PUN")}
              </div>
              {PUN}
              <p></p>
              {QPAY_DETAILS?.Payment_ID && (
                <>
                  {" "}
                  <div block="PaymentType" elem="Title">
                    {__("Payment ID")}
                  </div>
                  {QPAY_DETAILS?.Payment_ID}
                  <p></p>{" "}
                </>
              )}
              {QPAY_DETAILS?.amount && (
                <>
                  {" "}
                  <div block="PaymentType" elem="Title">
                    {__("Amount")}
                  </div>
                  {QPAY_DETAILS?.amount}
                  <p></p>{" "}
                </>
              )}
              <div block="PaymentType" elem="Title">
                {__("Status")}
              </div>
              {status}
              <p></p>
              <div block="PaymentType" elem="Title">
                {__("Date")}
              </div>
              {date}
              <p></p>
            </>
          )}
        </div>
      </>
    );
  };

  renderCardLogo() {
    const {
      creditCardData: { number = "" },
    } = this.props;
    const { visa, mastercard, amex } = MINI_CARDS;
    const first = parseInt(number.charAt(0));
    const second = parseInt(number.charAt(1));

    if (first === 4) {
      return <img src={visa} alt="card icon" />;
    }

    if (first === 5) {
      return <img src={mastercard} alt="card icon" />;
    }

    if (first === 3 && (second === 4 || second === 7)) {
      return <img src={amex} alt="card icon" />;
    }

    return null;
  }

  renderMiniCard(miniCard) {
    const img = MINI_CARDS[miniCard];
    if (img) {
      return <img src={img} alt="card icon" />;
    }
    return null;
  }

  renderPaymentTypeContent = () => {
    const {
      creditCardData: { number = "", expMonth, expYear, cvv },
      paymentMethod,
      initialTotals: { total_segments = [] },
      selectedCard,
    } = this.props;
    if (
      number &&
      expMonth &&
      expYear &&
      cvv &&
      !paymentMethod?.code?.match(/cash/)
    ) {
      const displayNumberDigits = 4;
      const slicedNumber = number.slice(number.length - displayNumberDigits);

      return (
        <div block="Details">
          <div block="Details" elem="TypeLogo">
            {this.renderCardLogo()}
          </div>
          <div block="Details" elem="Number">
            <div block="Details" elem="Number-Dots">
              <div />
              <div />
              <div />
              <div />
            </div>
            <div block="Details" elem="Number-Value">
              {slicedNumber}
            </div>
          </div>
        </div>
      );
    } else if (selectedCard && Object.keys(selectedCard).length > 0) {
      //payment done from saved cards
      const {
        details: { scheme, expirationDate, maskedCC },
      } = selectedCard;
      return (
        <div block="Details">
          <div block="Details" elem="TypeLogo">
            {this.renderMiniCard(scheme.toLowerCase())}
          </div>
          <div block="Details" elem="Number">
            <div block="Details" elem="Number-Dots">
              <div />
              <div />
              <div />
              <div />
            </div>
            <div block="Details" elem="Number-Value">
              {maskedCC}
            </div>
          </div>
        </div>
      );
    }

    if (paymentMethod?.code?.match(/tabby_installments/)) {
      this.setState({ paymentTitle: __("Tabby: Pay in installments") });
    } else if (paymentMethod?.code?.match(/apple/)) {
      this.setState({ paymentTitle: __("Apple Pay") });
    } else if (paymentMethod?.code?.match(/cash/)) {
      this.setState({
        paymentTitle:
          getCountryFromUrl() === "QA"
            ? __("Cash on Receiving")
            : __("Cash on Delivery"),
      });
    } else if (paymentMethod?.code?.match(/free/)) {
      if (getDiscountFromTotals(total_segments, "clubapparel")) {
        this.setState({ paymentTitle: __("Club Apparel") });
      } else if (getDiscountFromTotals(total_segments, "customerbalance")) {
        this.setState({ paymentTitle: __("Store Credit") });
      }
    } else if (paymentMethod?.code?.match(/qpay/)) {
      this.setState({ paymentTitle: __("QPAY") });
    }
    else if (paymentMethod?.code?.match(/knet/)) {
      this.setState({ paymentTitle: __("KNET") });
    }

    const { paymentTitle } = this.state;
    return (
      <div block="Details">
        <div block="Details" elem="TypeTitle">
          {__(paymentTitle)}
        </div>
      </div>
    );
  };

  renderPaymentMethodIcon(paymentTitle = "") {
    const { isArabic } = this.state;
    const formatedString = paymentTitle.split(":")[0];

    switch (formatedString) {
      case "Tabby":
        // if (!isArabic) {
        //   return <img src={Tabby} alt={paymentTitle} />;
        // }
        // return <img src={TabbyAR} alt={paymentTitle} />;
        return <img src={Tabby} alt={paymentTitle} />;
      case "Apple":
        return <img src={Apple} alt={paymentTitle} />;
      case "Cash":
        return <img src={Cash} alt={paymentTitle} />;

      default:
        return "";
    }
  }

  sendMOEEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }
  renderButton() {
    const { isArabic } = this.state;

    return (
      <div block="CheckoutSuccess" elem="ButtonWrapper" mods={{ isArabic }}>
        <Link
          block="CheckoutSuccess"
          elem="ContinueButton"
          to="/"
          onClick={() => this.sendMOEEvents(EVENT_MOE_CONTINUE_SHOPPING)}
        >
          <button block="primary">{__("Continue shopping")}</button>
        </Link>
      </div>
    );
  }

  renderSuccess() {
    const { successHidden } = this.state;
    return (
      <div block={`SuccessOverlay ${successHidden ? "hidden" : ""}`} dir="ltr">
        <div block="OrderPlacedTextWrapper">
          <div block="confirmSimbol" />
          <p>{__("Order Placed")}</p>
        </div>
      </div>
    );
  }

  renderPriceLineQPAY(price, name, mods = {}, allowZero = false) {
    if (!price && !allowZero) {
      return null;
    }
    const { isTotal, isStoreCredit, isClubApparel } = mods;
    const formatPrice =
      isStoreCredit || isClubApparel ? parseFloat(-price) : parseFloat(price);

    const {
      order: { order_currency_code: currency_code = getCurrency() },
    } = this.props;
    const finalPrice = getFinalPrice(formatPrice, currency_code);

    return (
      <li block="MyAccountOrderView" elem="SummaryItem" mods={mods}>
        <strong block="MyAccountOrderView" elem="Text">
          {name}
          {isTotal && (
            <>
              {" "}
              <span>{__("(Taxes included)")}</span>
            </>
          )}
        </strong>
        <strong block="MyAccountOrderView" elem="Price">
          {currency_code} {finalPrice}
        </strong>
      </li>
    );
  }

  renderPaymentSummary() {
    const {
      order: {
        subtotal = 0,
        grand_total = 0,
        shipping_amount = 0,
        discount_amount = 0,
        msp_cod_amount = 0,
        tax_amount = 0,
        customer_balance_amount = 0,
        club_apparel_amount = 0,
        currency_code = getCurrency(),
      },
    } = this.props;
    const grandTotal = getFinalPrice(grand_total, currency_code);
    const subTotal = getFinalPrice(subtotal, currency_code);

    return (
      <div block="MyAccountOrderView" elem="OrderTotals">
        <ul>
          <div block="MyAccountOrderView" elem="Subtotals">
            {this.renderPriceLineQPAY(subTotal, __("Subtotal"))}
            {this.renderPriceLineQPAY(shipping_amount, __("Shipping"), {
              divider: true,
            })}
            {customer_balance_amount !== 0
              ? this.renderPriceLineQPAY(
                  customer_balance_amount,
                  __("Store Credit"),
                  { isStoreCredit: true }
                )
              : null}
            {parseFloat(club_apparel_amount) !== 0
              ? this.renderPriceLineQPAY(
                  club_apparel_amount,
                  __("Club Apparel Redemption"),
                  { isClubApparel: true }
                )
              : null}
            {parseFloat(discount_amount) !== 0
              ? this.renderPriceLineQPAY(discount_amount, __("Discount"))
              : null}
            {parseFloat(tax_amount) !== 0
              ? this.renderPriceLineQPAY(tax_amount, __("Tax"))
              : null}
            {parseFloat(msp_cod_amount) !== 0
              ? this.renderPriceLineQPAY(
                  msp_cod_amount,
                  getCountryFromUrl() === "QA"
                    ? __("Cash on Receiving")
                    : __("Cash on Delivery")
                )
              : null}
            {this.renderPriceLineQPAY(
              grandTotal,
              __("Total"),
              { isTotal: true },
              true
            )}
          </div>
        </ul>
      </div>
    );
  }

  renderDetails() {
    const {
      customer,
      billingAddress: { guest_email },
      paymentMethod,
      incrementID,
      initialTotals,
    } = this.props;
    let dispatchedObj = JSON.parse(localStorage.getItem("cartProducts"));
    const pagePathName = new URL(window.location.href).pathname;
    if (pagePathName !== "/checkout/error") {
      if (
        paymentMethod?.code === "checkout_qpay" ||
        paymentMethod?.code === "tabby_installments" ||
        paymentMethod?.code === "checkout_knet"
      ) {
        Event.dispatch(EVENT_GTM_PURCHASE, {
          orderID: incrementID,
          totals: dispatchedObj,
        });
      } else {
        Event.dispatch(EVENT_GTM_PURCHASE, {
          orderID: incrementID,
          totals: initialTotals,
        });
      }
    }
    localStorage.removeItem("cartProducts");
    return (
      <div block="CheckoutSuccess">
        {this.renderChangePhonePopUp()}
        <div block="CheckoutSuccess" elem="Details">
          {this.renderSuccessMessage(
            customer.email ? customer.email : guest_email
          )}
          {this.renderPhoneVerified()}
          {this.renderTrackOrder()}
          {this.renderTotalsItems()}
          {this.renderAddresses()}
          {this.renderPaymentType()}
          {paymentMethod?.code === "checkout_qpay" ||
          paymentMethod?.code === "tabby_installments" ||
          paymentMethod?.code === "checkout_knet"
            ? this.renderPaymentSummary()
            : this.renderTotals()}
          {this.renderContact()}
        </div>
        {this.renderButton()}
        {this.renderMyAccountPopup()}
      </div>
    );
  }

  render() {
    return this.renderDetails();
  }
}

export default CheckoutSuccess;
