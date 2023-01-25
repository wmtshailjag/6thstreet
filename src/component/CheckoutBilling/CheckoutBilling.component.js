/* eslint-disable jsx-a11y/control-has-associated-label */
import PropTypes from "prop-types";
import { Collapse } from "react-collapse";
import Popup from "SourceComponent/Popup";
import CheckoutAddressBook from "Component/CheckoutAddressBook";
import CheckoutPayments from "Component/CheckoutPayments";
import CheckoutOrderSummary from "Component/CheckoutOrderSummary";
import {
  CHECKOUT_APPLE_PAY,
  CARD,
} from "Component/CheckoutPayments/CheckoutPayments.config";
import CreditCardTooltip from "Component/CreditCardTooltip";
import Form from "Component/Form";
import MyAccountAddressPopup from "Component/MyAccountAddressPopup";
import { getFinalPrice } from "Component/Price/Price.config";
import { BILLING_STEP } from "Route/Checkout/Checkout.config";
import { CheckoutBilling as SourceCheckoutBilling } from "SourceComponent/CheckoutBilling/CheckoutBilling.component";
import { isArabic } from "Util/App";
import { isSignedIn } from "Util/Auth";
import { ThreeDots } from "react-loader-spinner";
import "./CheckoutBilling.extended.style";
import Applepay from "./icons/apple.png";
import Image from "Component/Image";
import isMobile from "Util/Mobile";

export class CheckoutBilling extends SourceCheckoutBilling {
  static propTypes = {
    ...SourceCheckoutBilling.propTypes,
    setTabbyWebUrl: PropTypes.func.isRequired,
    setCreditCardData: PropTypes.func.isRequired,
    showCreateNewPopup: PropTypes.func.isRequired,
    processingRequest: PropTypes.bool.isRequired,
    processingPaymentSelectRequest: PropTypes.bool,
    processApplePay: PropTypes.bool,
    placeOrder: PropTypes.func,
    isClickAndCollect: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    applePayDisabled: PropTypes.bool,
    launchPaymentMethod: PropTypes.func.isRequired,
    requestConfig: PropTypes.func.isRequired,
    handleApplePayButtonClick: PropTypes.func.isRequired,
    button_style: PropTypes.string,
  };

  static defaultProps = {
    ...SourceCheckoutBilling.defaultProps,
    processApplePay: true,
    processingPaymentSelectRequest: false,
    placeOrder: () => { },
    isLoading: false,
    applePayDisabled: true,
    button_style: "",
  };

  componentDidMount() {
    const { termsAreEnabled, paymentMethod, isApplePayAvailable } = this.props;
    if (!termsAreEnabled) {
      this.setState({ isOrderButtonEnabled: true });
    }
    if (paymentMethod === CHECKOUT_APPLE_PAY && isApplePayAvailable) {
      const { requestConfig, launchPaymentMethod } = this.props;
      requestConfig().then(launchPaymentMethod);
    }
  }
  componentDidUpdate(prevProps) {
    const { paymentMethod } = this.props;
    const { paymentMethod: prevPaymentMethod } = prevProps;
    if (
      prevPaymentMethod !== paymentMethod &&
      paymentMethod === CHECKOUT_APPLE_PAY
    ) {
      const { requestConfig, launchPaymentMethod } = this.props;

      requestConfig().then(launchPaymentMethod);
    }
  }
  state = {
    // isOrderButtonVisible: true,
    // isOrderButtonEnabled: true,
    isTermsAndConditionsAccepted: false,
    isArabic: isArabic(),
    formContent: false,
    isSignedIn: isSignedIn(),
    isDropdownOpen: true,
    dropdownToggleIcon: true,
    isInLimit: true,
  };

  setLimitDisabled() {
    this.setState({isInLimit: true});
  }

  setLimitEnabled() {
    this.setState({isInLimit: false});
  }

  renderPriceLine(price, name, mods) {
    const {
      totals: { currency_code },
    } = this.props;

    return (
      <li block="CheckoutBillingTotal CheckoutOrderSummary" elem="SummaryItem" mods={mods}>
        <strong block="CheckoutOrderSummary" elem="Text">
          {name}
        </strong>
        {price !== undefined ? (
          <strong block="CheckoutOrderSummary" elem="Price">
            {`${currency_code} ${price}`}
          </strong>
        ) : null}
      </li>
    );
  }

  openForm() {
    this.setState({ formContent: true });
  }

  closeForm = () => {
    this.setState({ formContent: false });
  };

  renderAddAdress() {
    const { formContent, isArabic } = this.state;
    const { customer } = this.props;
    return (
      <div block="CheckoutBilling" elem="AddAddressWrapper">
        <div
          block="MyAccountAddressBook"
          elem="ContentWrapper"
          mods={{ formContent }}
        >
          <button
            type="button"
            block="MyAccountAddressBook"
            elem="backButton"
            mods={{ isArabic }}
            onClick={this.showCards}
          />
          <MyAccountAddressPopup
            formContent={formContent}
            closeForm={this.closeForm}
            openForm={this.openForm}
            showCards={this.showCards}
            customer={customer}
          />
        </div>
      </div>
    );
  }

  hideCards = () => {
    this.setState({ hideCards: true });
  };

  showCards = () => {
    this.closeForm();
    this.setState({ hideCards: false });
  };

  openNewForm = () => {
    const { showCreateNewPopup } = this.props;
    this.openForm();
    showCreateNewPopup();
  };

  renderButtonLabel() {
    return isMobile.any() || isMobile.tablet()
      ? __("New address")
      : __("Add new address");
  }

  renderOpenPopupButton = () => {
    const { isSignedIn, formContent, isArabic } = this.state;
    const { addresses } = this.props;

    if (addresses && isSignedIn && addresses.length === 0) {
      return this.openNewForm();
    }

    if (isSignedIn) {
      return (
        <div
          block="MyAccountAddressBook"
          elem="NewAddressWrapper"
          mods={{ formContent, isArabic }}
        >
          <button
            type="button"
            block="MyAccountAddressBook"
            elem="NewAddress"
            onClick={this.openNewForm}
          >
            {this.renderButtonLabel()}
          </button>
        </div>
      );
    }

    return null;
  };

  renderAddressBook() {
    const {
      onAddressSelect,
      isSameAsShipping,
      addresses,
      edd_info,
      addressCityData,
      totals: { is_virtual },
    } = this.props;

    if (
      (isSameAsShipping && !is_virtual) ||
      isMobile.any() ||
      isMobile.tablet()
    ) {
      return null;
    }

    return (
      <>
        {this.renderAddressHeading()}
        <CheckoutAddressBook
          edd_info={edd_info}
          addressCityData={addressCityData}
          addresses={addresses}
          onAddressSelect={onAddressSelect}
          isBilling
        />
      </>
    );
  }

  renderPayments() {
    const setLimitDisabled = this.setLimitDisabled.bind(this);
    const setLimitEnabled = this.setLimitEnabled.bind(this);

    const {
      paymentMethods = [],
      onPaymentMethodSelect,
      setLoading,
      setDetailsStep,
      shippingAddress,
      setTabbyWebUrl,
      setCashOnDeliveryFee,
      setCreditCardData,
      processApplePay,
      placeOrder,
      setOrderButtonEnableStatus,
      setOrderButtonEnabled,
      setOrderButtonDisabled,
      resetBinApply,
      applyPromotionSavedCard,
      removePromotionSavedCard,
      isSignedIn,
      isClickAndCollect,
      savePaymentInformationApplePay,
      isTabbyInstallmentAvailable,
    } = this.props;

    if (!paymentMethods.length) {
      return null;
    }
    return (
      <CheckoutPayments
        savePaymentInformationApplePay={savePaymentInformationApplePay}
        setCashOnDeliveryFee={setCashOnDeliveryFee}
        setLoading={setLoading}
        setDetailsStep={setDetailsStep}
        paymentMethods={paymentMethods}
        onPaymentMethodSelect={onPaymentMethodSelect}
        setOrderButtonVisibility={this.setOrderButtonVisibility}
        billingAddress={shippingAddress}
        setOrderButtonEnableStatus={setOrderButtonEnableStatus}
        // setOrderButtonEnableStatus={setOrderButtonEnabled}
        setTabbyWebUrl={setTabbyWebUrl}
        setCreditCardData={setCreditCardData}
        setOrderButtonDisabled={setOrderButtonDisabled}
        setOrderButtonEnabled={setOrderButtonEnabled}
        resetBinApply={resetBinApply}
        processApplePay={processApplePay}
        placeOrder={placeOrder}
        isSignedIn={isSignedIn}
        applyPromotionSavedCard={applyPromotionSavedCard}
        removePromotionSavedCard={removePromotionSavedCard}
        isClickAndCollect={isClickAndCollect}
        isTabbyInstallmentAvailable={isTabbyInstallmentAvailable}
        setLimitDisabled={setLimitDisabled}
        setLimitEnabled={setLimitEnabled}
      />
    );
  }
  onDropdownClicked = () => {
    this.setState((prevState) => ({
      isDropdownOpen: !prevState.isDropdownOpen,
      dropdownToggleIcon: !prevState.dropdownToggleIcon,
    }));
  };
  renderTotals() {
    const {
      totals,
      totals: { total, currency_code },
      cashOnDeliveryFee,
    } = this.props;
    const grandTotal = getFinalPrice(total, currency_code);
    const { dropdownToggleIcon, isDropdownOpen } = this.state;

    return (
      <div block="Checkout" elem="OrderTotals">
        <div block="Checkout" elem="OrderSummaryTriggerContainer">
          <div
            onClick={this.onDropdownClicked}
            block="Checkout"
            elem="OrderSummaryTrigger"
            type="button"
            mods={{ dropdownToggleIcon }}
          ></div>
        </div>
        <div block="Checkout" elem="OrderSummaryTotalsContainer">
          <Collapse isOpened={isDropdownOpen}>
            <CheckoutOrderSummary
              checkoutStep="BILLING_STEP"
              totals={totals}
              cashOnDeliveryFee={cashOnDeliveryFee}
            />
          </Collapse>
        </div>
        {this.renderPriceLine(grandTotal, __("Total Amount"), {
          isDropdownOpen,
        })}
      </div>
    );
  }

  renderCreditCardTooltipBar() {
    const { paymentMethods } = this.props;

    const {
      options: { promo_message: { collapsed: { text } = {}, expanded } = {} },
    } = paymentMethods[0];

    return (
      expanded !== undefined && (
        <CreditCardTooltip
          collapsedPromoMessage={text}
          expandedPromoMessage={expanded[0].value}
          bankLogos={expanded[1].value}
        />
      )
    );
  }

  // setOrderButtonDisabled = () => {
  //   this.setState({ isOrderButtonEnabled: false });
  // };

  // setOrderButtonEnabled = () => {
  //   this.setState({ isOrderButtonEnabled: true });
  // };

  renderButtonPlaceholder() {
    const { paymentMethod, binApplied, newCardVisible } = this.props;
    const isCardPayment = CARD === paymentMethod;
    let placeholder = __("Place order");
    if (isCardPayment) {
      //if payment is from card.
      if (newCardVisible && !binApplied) {
        //if there is new card to add and bin is not applied
        placeholder = __("Add Credit Card");
      }
    }
    return <>{placeholder}</>;
  }

  renderActions() {
    const { isTermsAndConditionsAccepted, isArabic, isInLimit } = this.state;
    const { isOrderButtonVisible, isOrderButtonEnabled } = this.props;
    const {
      termsAreEnabled,
      processingRequest,
      processingPaymentSelectRequest,
      paymentMethod,
      binApplied,
      applePayDisabled,
      handleApplePayButtonClick,
      button_style,
    } = this.props;

    if (!isOrderButtonVisible) {
      return null;
    }

    // if terms and conditions are enabled, validate for acceptance
    const isDisabled = termsAreEnabled
      ? !isOrderButtonEnabled || !isTermsAndConditionsAccepted
      : !isOrderButtonEnabled;

    const isApplePay = paymentMethod === CHECKOUT_APPLE_PAY;
    const isTabbyPay = paymentMethod === "tabby_installments";
    return (
      <>
        {this.renderCreditCardTooltipBar()}
        <div block="Checkout" elem="StickyButtonWrapper">
          {this.renderTotals()}
          {isApplePay ? (
            <div block="CheckoutComApplePayPayment" elem="Wrapper">
              {/* <Loader isLoading={ isLoading } /> */}
              <button
                type="button"
                block="CheckoutComApplePayPayment"
                elem="Button"
                label="Pay with ApplePay"
                onClick={handleApplePayButtonClick}
                disabled={applePayDisabled}
                mods={{ button_style }}
              >
                <div>{__("Buy with ")}</div>
                <Image
                  lazyLoad={true}
                  block="CheckoutComApplePayPayment"
                  elem="icon"
                  mix={{
                    block: "CheckoutComApplePayPayment",
                    elem: "icon",
                  }}
                  mods={{ button_style, isArabic }}
                  src={Applepay}
                  alt="Apple Pay"
                />
              </button>
            </div>
          ) : (
            <button
              type="submit"
              block="Button"
              disabled={
                isDisabled ||
                processingRequest ||
                processingPaymentSelectRequest ||
                isApplePay ||
                !isInLimit
              }
              mix={{
                block: "CheckoutBilling",
                elem:
                  processingRequest || processingPaymentSelectRequest
                    ? "spinningButton"
                    : isTabbyPay
                      ? "tabbyButton"
                      : "Button",
              }}
            >
              {processingRequest || processingPaymentSelectRequest ? (
                <ThreeDots color="white" height={6} width={"100%"} />
              ) : isTabbyPay ? (
                __("Place tabby order")
              ) : (
                this.renderButtonPlaceholder()
              )}
            </button>
          )}
        </div>
      </>
    );
  }

  renderAddressHeading() {
    return (
      <div block="CheckoutBilling" elem="AddressHeader">
        <h2 block="CheckoutBilling" elem="AddressHeading">
          {__("Billing Address")}
        </h2>
        {this.renderOpenPopupButton()}
      </div>
    );
  }

  renderAddresses() {
    return this.renderAddressBook();
  }

  render() {
    const {
      onBillingSuccess,
      onBillingError,
      isSameAsShipping,
      setOrderButtonDisabled,
      isTabbyInstallmentAvailable
    } = this.props;

    const { formContent } = this.state;

    return formContent ? (
      this.renderAddAdress()
    ) : (
      <Form
        mix={{ block: "CheckoutBilling" }}
        id={BILLING_STEP}
        onSubmitError={onBillingError}
        onSubmitSuccess={onBillingSuccess}
        onSubmit={setOrderButtonDisabled}
      >
        {this.renderAddresses()}
        <div block="CheckoutBilling" elem="Bin"></div>
        {isSameAsShipping || isMobile.any() || isMobile.tablet() ? null : (
          <div block="CheckoutBilling" elem="Line">
            <hr />
          </div>
        )}
        {this.renderPayments()}
        {this.renderTermsAndConditions()}
        {this.renderActions()}
        {this.renderPopup()}
      </Form>
    );
  }
}

export default CheckoutBilling;
