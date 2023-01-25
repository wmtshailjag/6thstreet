/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import CheckoutPayment from "Component/CheckoutPayment";
import { PAYMENTS_DATA } from "Component/CheckoutPayment/CheckoutPayment.config";
import CreditCard from "Component/CreditCard";
import Slider from "Component/Slider";
import TabbyMiniPopup from "Component/TabbyMiniPopup";
import { TABBY_TOOLTIP_INSTALLMENTS } from "Component/TabbyMiniPopup/TabbyMiniPopup.config";
import PropTypes from "prop-types";
import SourceCheckoutPayments from "SourceComponent/CheckoutPayments/CheckoutPayments.component";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import { getCountryFromUrl } from "Util/Url/Url";
import {
  CARD,
  CASH_ON_DELIVERY,
  CHECKOUT_APPLE_PAY,
  CHECKOUT_QPAY,
  FREE,
  TABBY_ISTALLMENTS,
  TABBY_PAYMENT_CODES,
  KNET_PAY,
} from "./CheckoutPayments.config";
import "./CheckoutPayments.extended.style";
import Applepay from "./icons/apple-pay@3x.png";

export class CheckoutPayments extends SourceCheckoutPayments {
  static propTypes = {
    ...SourceCheckoutPayments.propTypes,
    selectedPaymentCode: PropTypes.string,
    processApplePay: PropTypes.bool,
    placeOrder: PropTypes.func,
    isClickAndCollect: PropTypes.string.isRequired,
  };

  static defaultProps = {
    ...SourceCheckoutPayments.defaultProps,
    selectedPaymentCode: "",
    processApplePay: true,
    placeOrder: () => { },
  };

  paymentRenderMap = {
    ...SourceCheckoutPayments.paymentRenderMap,
    [CARD]: this.renderCreditCard.bind(this),
    [CASH_ON_DELIVERY]: this.renderCashOnDelivery.bind(this),
    [TABBY_ISTALLMENTS]: this.renderTabbyPaymentMethods.bind(this),
    [CHECKOUT_APPLE_PAY]: this.renderApplePayMethods.bind(this),
    [FREE]: this.renderFree.bind(this),
    [CHECKOUT_QPAY]: this.renderQPay.bind(this),
    [KNET_PAY]: this.renderKnetPay.bind(this),
  };

  state = {
    activeSliderImage: 0,
    tabbyPaymentMethods: [],
    tabbyIsRendered: false,
    tooltipContent: null,
    isArabic: isArabic(),
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  componentDidMount() {
    const { selectedPaymentCode, totals: { total, currency_code } } = this.props;
    if (selectedPaymentCode === TABBY_ISTALLMENTS) {
      this.addTabbyCard(total, currency_code);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      selectedPaymentCode,
      totals: { total, currency_code },
    } = this.props;
    if (selectedPaymentCode === TABBY_ISTALLMENTS || prevProps?.totals?.total !== total) {
      this.addTabbyCard(total, currency_code);
    }
  }

  addTabbyCard = (total, currency_code) => {
    const { isArabic } = this.state;
    new window.TabbyCard({
      selector: '#tabbyCard',
      currency: currency_code.toString(),
      price: total,
      installmentsCount: 4,
      lang: isArabic ? "ar" : "en",
      size: 'wide',
    });
  }

  handleChange = (activeImage) => {
    this.setState({ activeSliderImage: activeImage });
  };

  renderPayment = (method) => {
    const {
      selectPaymentMethod,
      selectedPaymentCode,
      setCashOnDeliveryFee,
      isTabbyInstallmentAvailable,
      isClickAndCollect,
      totals: { items=[] },
      totals
    } = this.props;
    const { m_code } = method;
    
    const hasClickAndCollect = items?.some(
      ({ extension_attributes }) => extension_attributes?.click_to_collect_store
    );

    if (
      m_code === "msp_cashondelivery" &&
      (isClickAndCollect || hasClickAndCollect)
    ) {
      return null;
    }

    const isSelected = selectedPaymentCode === m_code;
    const { tabbyPaymentMethods = [] } = this.state;
    const isTabbySelected = TABBY_PAYMENT_CODES.includes(selectedPaymentCode);
    if (
      TABBY_PAYMENT_CODES.includes(m_code) &&
      tabbyPaymentMethods.length > 0
    ) {
      if (!isTabbyInstallmentAvailable) {
        return null;
      }
      return (
        <CheckoutPayment
          key={m_code}
          isSelected={isTabbySelected}
          method={method}
          onClick={selectPaymentMethod}
          setCashOnDeliveryFee={setCashOnDeliveryFee}
          totals={totals}
        />
      );
    }

    return (
      <CheckoutPayment
        key={m_code}
        isSelected={isSelected}
        method={method}
        onClick={selectPaymentMethod}
        setCashOnDeliveryFee={setCashOnDeliveryFee}
        totals={totals}
      />
    );
  };

  getSelectedMethodData = () => {
    const { paymentMethods, selectedPaymentCode } = this.props;
    const selectedMethod = paymentMethods.find(
      (method) => method.m_code === selectedPaymentCode
    );

    return selectedMethod;
  };

  renderLimit() {
    const { totals: { total, currency_code } } = this.props;
    if(currency_code === "AED"){
      return (
        <>
          <b> {__("AED 2700")}, </b> 
        </>
      );
    }else if(currency_code === "SAR"){
      return (
        <>
          <b> {__("SAR 2700")}, </b> 
        </>
      );
    }else if(currency_code === "QAR"){
      return (
        <>
          <b> {__("QAR 2700")}, </b> 
        </>
      );
    }else if(currency_code === "KWD"){
      return (
        <>
          <b> {__("KWD 250")}, </b> 
        </>
      );
    }else if(currency_code === "OMR"){
      return (
        <>
          <b> {__("OMR 250")}, </b> 
        </>
      );
    }else if(currency_code === "BHD"){
      return (
        <>
          <b> {__("BHD 250")}, </b> 
        </>
      );
    }
  }

  renderKnetPay() {

    const {
      options: { method_description, method_title },
    } = this.getSelectedMethodData();

    return (
      <div block="CheckoutPayments" elem="SelectedInfo">
        <h2 block="CheckoutPayments" elem="MethodTitle">
          {method_title}
        </h2>
        <p block="CheckoutPayments" elem="MethodDiscription">
          {method_description}
        </p>
      </div>
    );
  }

  renderCashOnDelivery() {
    const { isClickAndCollect, totals: { total, currency_code }, setOrderButtonDisabled } = this.props;

    if (isClickAndCollect) {
      return null;
    }

    const {
      options: { method_description, method_title },
    } = this.getSelectedMethodData();

    if(
      currency_code === "AED" && total > 2700 || 
      currency_code === "SAR" && total > 2700 ||
      currency_code === "KWD" && total > 250 ||
      currency_code === "OMR" && total > 250 ||
      currency_code === "BHD" && total > 250 ||
      currency_code === "QAR" && total > 2700
      ){
        return (
          <div block="CheckoutPayments" elem="SelectedInfo">
            <h2 block="CheckoutPayments" elem="MethodTitle">
              {method_title}
            </h2>
            <p block="CheckoutPayments" elem="MethodDiscription">
              {getCountryFromUrl() === "QA" 
                ? __("Cash on Receiving is not available for the order above")
                :__("Cash on Delivery is not available for the order above")
              }
              <span>{this.renderLimit()}</span>
              {__("please choose another payment option.")}

            </p>
          </div>
        );
    }

    return (
      <div block="CheckoutPayments" elem="SelectedInfo">
        <h2 block="CheckoutPayments" elem="MethodTitle">
          {method_title}
        </h2>
        <p block="CheckoutPayments" elem="MethodDiscription">
          {method_description}
        </p>
      </div>
    );
  }

  renderFree() {
    return (
      <div block="CheckoutPayments" elem="SelectedInfo">
        <h2 block="CheckoutPayments" elem="MethodTitle">
          {__("Free")}
        </h2>
        <p block="CheckoutPayments" elem="MethodDiscription">
          {__("No Payment Information Required")}
        </p>
      </div>
    );
  }

  renderTabbyPaymentMethods() {
    const { tabbyPaymentMethods = [] } = this.state;
    return (
      <div block="CheckoutPayments" elem="TabbyPayments">
        <div block="CheckoutPayments" elem="TabbyPaymentsHeader">
          <h2>{__("Tabby")}</h2>
        </div>
        <div block="CheckoutPayments" elem="TabbyPaymentsContent">
          {tabbyPaymentMethods.map((method) =>
            this.renderTabbyPaymentMethod(method)
          )}
        </div>
      </div>
    );
  }

  renderQPay() {
    const {
      options: { method_description, method_title },
    } = this.getSelectedMethodData();
    return (
      <div block="CheckoutPayments" elem="SelectedInfo">
        <h2 block="CheckoutPayments" elem="MethodTitle">
          {method_title}
        </h2>
        <p block="CheckoutPayments" elem="MethodDiscription">
          {method_description}
        </p>
      </div>
    );
  }

  renderApplePayMethods() {
    const { isClickAndCollect } = this.props;
    if (isClickAndCollect) {
      return null;
    }

    const {
      options: { method_description, method_title },
    } = this.getSelectedMethodData();

    return (
      <div block="CheckoutPayments" elem="SelectedInfo">
        <h2 block="CheckoutPayments" elem="MethodTitle">
          {method_title}
        </h2>
        <p block="CheckoutPayments" elem="MethodDiscription">
          {method_description}
        </p>
        <div block="CheckoutPayments" elem="MethodImage">
          <img src={Applepay} alt="Apple pay" />
        </div>
      </div>
    );
  }

  renderTabbyPaymentMethod(method) {
    const { title, m_code } = method;
    const {
      selectPaymentMethod,
      selectedPaymentCode,
      isTabbyInstallmentAvailable,
      setCashOnDeliveryFee,
    } = this.props;
    const { img } = PAYMENTS_DATA[m_code];
    const { isArabic, isMobile } = this.state;

    const isSelected = m_code === selectedPaymentCode;

    if (m_code === TABBY_ISTALLMENTS && !isTabbyInstallmentAvailable) {
      return null;
    }
    const check = isMobile ? true : false;

    return (
      <div
        block="CheckoutPayments"
        elem="TabbyPayment"
        key={m_code}
        mods={{ check }}
      >
        <div
          block="CheckoutPayments"
          elem="TabbyPaymentSelect"
          mods={{ check }}
        >
          <CheckoutPayment
            key={m_code}
            isSelected={isSelected}
            method={method}
            onClick={selectPaymentMethod}
            setCashOnDeliveryFee={setCashOnDeliveryFee}
          />
          {/* <img src={isArabic ? tabbyAr : img} alt={m_code} /> */}
          <img src={img} alt={m_code} />
        </div>
        <div block="CheckoutPayments" elem="TabbyPaymentContent">
          <div
            block="CheckoutPayments"
            elem="TabbyPaymentContentTitle"
            mods={{ isArabic }}
          >
            {/* <button onClick={this.openTabbyInstallmentsTooltip}>
              <img src={info} alt="info" />
            </button> */}
            <button type="button" data-tabby-info="installments">
              ⓘ
            </button>
          </div>
          <div id="tabbyCard"></div>
        </div>
      </div>
    );
  }

  renderHeading() {
    return (
      <h2 block="CheckoutPayments" elem="Heading">
        {__("Payment type")}
      </h2>
    );
  }

  renderSelectedPayment() {
    const { selectedPaymentCode, setLimitDisabled, setLimitEnabled, totals: { total, currency_code }, } = this.props;
    
    if(selectedPaymentCode === "msp_cashondelivery" ){
      if(
        currency_code === "AED" && total > 2700 || 
        currency_code === "SAR" && total > 2700 ||
        currency_code === "KWD" && total > 250 ||
        currency_code === "OMR" && total > 250 ||
        currency_code === "BHD" && total > 250 ||
        currency_code === "QAR" && total > 2700
        ){
          setLimitEnabled();
        }else{
          setLimitDisabled();
        }
    }else{
      setLimitDisabled();
    }

    const render = this.paymentRenderMap[selectedPaymentCode];
    if (!render) {
      return null;
    }

    return render();
  }

  renderCreditCard() {
    const {
      paymentMethods,
      setCreditCardData,
      setOrderButtonDisabled,
      setOrderButtonEnabled,
      applyPromotionSavedCard,
      removePromotionSavedCard,
      isSignedIn,
    } = this.props;
    const cardData = paymentMethods.find(({ m_code }) => m_code === CARD);

    return (
      <CreditCard
        cardData={cardData}
        isSignedIn={isSignedIn}
        setCreditCardData={setCreditCardData}
        setOrderButtonDisabled={setOrderButtonDisabled}
        setOrderButtonEnabled={setOrderButtonEnabled}
        applyPromotionSavedCard={applyPromotionSavedCard}
        removePromotionSavedCard={removePromotionSavedCard}
      />
    );
  }

  renderPayments() {
    const {
      paymentMethods = [],
      totals: { total },
    } = this.props;
    const { tabbyPaymentMethods = [] } = this.state;

    if (total === 0) {
      return this.renderPayment({ m_code: FREE });
    }

    const hasTabby = paymentMethods.some(({ code }) =>
      TABBY_PAYMENT_CODES.includes(code)
    );

    if (hasTabby && tabbyPaymentMethods.length === 0) {
      const tabbyPaymentMethods = paymentMethods.reduce((acc, method) => {
        const { code } = method;

        if (TABBY_PAYMENT_CODES.includes(code)) {
          acc.push(method);
        }

        return acc;
      }, []);

      this.setState({ tabbyPaymentMethods });
    }
    return paymentMethods.map(this.renderPayment);
  }

  renderContent() {
    const { hasError, activeSliderImage } = this.state;

    if (hasError) {
      return (
        <p>
          {__(
            "The error occurred during initializing payment methods. Please try again later!"
          )}
        </p>
      );
    }

    return (
      <>
        {this.renderHeading()}
        <ul block="CheckoutPayments" elem="Methods">
          <Slider
            activeImage={activeSliderImage}
            onActiveImageChange={this.handleChange}
          >
            {this.renderPayments()}
          </Slider>
        </ul>
        {this.renderSelectedPayment()}
        {/* {this.renderPayPal()} */}
      </>
    );
  }

  openTabbyInstallmentsTooltip = (e) => {
    e.preventDefault();
    this.setState({ tooltipContent: TABBY_TOOLTIP_INSTALLMENTS });
  };

  closeTabbyPopup = (e) => {
    e.preventDefault();
    this.setState({ tooltipContent: null });
  };

  renderTabbyPopup = () => {
    const { tooltipContent } = this.state;

    if (tooltipContent === TABBY_TOOLTIP_INSTALLMENTS) {
      return (
        <TabbyMiniPopup
          content={TABBY_TOOLTIP_INSTALLMENTS}
          closeTabbyPopup={this.closeTabbyPopup}
        />
      );
    }

    return null;
  };

  render() {
    return (
      <div block="CheckoutPayments" dir={this.state.isArabic ? "rtl" : "ltr"}>
        {this.renderContent()}
        {this.renderTabbyPopup()}
      </div>
    );
  }
}

export default CheckoutPayments;
