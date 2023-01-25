import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getCurrency, getDiscountFromTotals } from "Util/App";
import {
  CARD,
  TABBY_ISTALLMENTS,
} from "Component/CheckoutPayments/CheckoutPayments.config";
import {
  ADD_ADDRESS,
  ADDRESS_POPUP_ID,
} from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import {
  CheckoutBillingContainer as SourceCheckoutBillingContainer,
  mapDispatchToProps as sourceMapDispatchToProps,
  mapStateToProps as sourceMapStateToProps,
} from "SourceComponent/CheckoutBilling/CheckoutBilling.container";
import CreditCardDispatcher from "Store/CreditCard/CreditCard.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import { showPopup } from "Store/Popup/Popup.action";
import BrowserDatabase from "Util/BrowserDatabase";
import { FIVE_MINUTES_IN_SECONDS } from "Util/Request/QueryDispatcher";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import { isObject } from "Util/API/helper/Object";
import { getDefaultEddDate } from "Util/Date/index";

import { CHECKOUT_APPLE_PAY } from "Component/CheckoutPayments/CheckoutPayments.config";
import CheckoutComQuery from "Query/CheckoutCom.query";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import { customerType } from "Type/Account";
import { isArabic } from "Util/App";

import { tokenize } from "Util/API/endpoint/ApplePay/ApplePay.enpoint";
import { isSignedIn } from "Util/Auth";
import Logger from "Util/Logger";
import { fetchMutation, fetchQuery } from "Util/Request";
import * as Sentry from "@sentry/react";
import { getCountryFromUrl } from "Util/Url/Url";
export const mapStateToProps = (state) => ({
  ...sourceMapStateToProps(state),
  processingRequest: state.CartReducer.processingRequest,
  processingPaymentSelectRequest:
    state.CartReducer.processingPaymentSelectRequest,
  totals: state.CartReducer.cartTotals,
  cartId: state.CartReducer.cartId,
  savedCards: state.CreditCardReducer.savedCards,
  newCardVisible: state.CreditCardReducer.newCardVisible,
  default_title: state.ConfigReducer.default_title,
  customer: state.MyAccountReducer.customer,
  eddResponse: state.MyAccountReducer.eddResponse,
  edd_info: state.AppConfig.edd_info,
  addressCityData: state.MyAccountReducer.addressCityData,
});

export const mapDispatchToProps = (dispatch) => ({
  ...sourceMapDispatchToProps(dispatch),
  addNewCreditCard: (cardData) =>
    CreditCardDispatcher.addNewCreditCard(dispatch, cardData),
  getCardType: (bin) => CreditCardDispatcher.getCardType(dispatch, bin),
  showSuccessMessage: (message) =>
    dispatch(showNotification("success", message)),
  showPopup: (payload) => dispatch(showPopup(ADDRESS_POPUP_ID, payload)),
  createTabbySession: (code) =>
    CheckoutDispatcher.createTabbySession(dispatch, code),
  getTabbyInstallment: (price) =>
    CheckoutDispatcher.getTabbyInstallment(dispatch, price),
  removeBinPromotion: () => CheckoutDispatcher.removeBinPromotion(dispatch),
  showError: (message) => dispatch(showNotification("error", message)),
});

export class CheckoutBillingContainer extends SourceCheckoutBillingContainer {
  static propTypes = {
    ...SourceCheckoutBillingContainer.propTypes,
    setTabbyWebUrl: PropTypes.func.isRequired,
    setPaymentCode: PropTypes.func.isRequired,
    showPopup: PropTypes.func.isRequired,
    setCheckoutCreditCardData: PropTypes.func.isRequired,
    processingRequest: PropTypes.bool.isRequired,
    processingPaymentSelectRequest: PropTypes.bool,
    isClickAndCollect: PropTypes.string.isRequired,
    merchant_id: PropTypes.string,
    showError: PropTypes.func.isRequired,
    supported_networks: PropTypes.arrayOf(PropTypes.string).isRequired,
    default_title: PropTypes.string,
    customer: customerType,
    placeOrder: PropTypes.func,
  };

  static defaultProps = {
    ...SourceCheckoutBillingContainer.defaultProps,
    processingPaymentSelectRequest: false,
    customer: null,
    default_title: "6th Street",
    merchant_id: process.env.REACT_APP_CHECKOUT_COM_APPLE_MERCHANT_ID,
    placeOrder: () => { },
  };

  containerFunctions = {
    onBillingSuccess: this.onBillingSuccess.bind(this),
    onBillingError: this.onBillingError.bind(this),
    onAddressSelect: this.onAddressSelect.bind(this),
    onSameAsShippingChange: this.onSameAsShippingChange.bind(this),
    onPaymentMethodSelect: this.onPaymentMethodSelect.bind(this),
    showPopup: this.showPopup.bind(this),
    showCreateNewPopup: this.showCreateNewPopup.bind(this),
    setCreditCardData: this.setCreditCardData.bind(this),
    setOrderButtonDisabled: this.setOrderButtonDisabled.bind(this),
    setOrderButtonEnabled: this.setOrderButtonEnabled.bind(this),
    resetBinApply: this.resetBinApply.bind(this),
    setOrderButtonEnableStatus: this.setOrderButtonEnableStatus.bind(this),
    applyPromotionSavedCard: this.applyPromotionSavedCard.bind(this),
    removePromotionSavedCard: this.removePromotionSavedCard.bind(this),
    requestConfig: this.requestConfig.bind(this),
    launchPaymentMethod: this.launchPaymentMethod.bind(this),
    handleApplePayButtonClick: this.handleApplePayButtonClick.bind(this),
  };

  /**
   * Constructor
   * @param props
   * @param context
   */
  constructor(props, context) {
    super(props, context);
    const { paymentMethods, customer } = props;
    const [method] = paymentMethods;
    const { code: paymentMethod } = method || {};
    this.state = {
      isApplePayAvailable: !!window.ApplePaySession,
      applePayDisabled: true,
      isLoading: true,
      merchant_id: null,
      supported_networks: null,
      isSameAsShipping: this.isSameShippingAddress(customer),
      selectedCustomerAddressId: 0,
      prevPaymentMethods: paymentMethods,
      paymentMethod,
      isTabbyInstallmentAvailable: false,
    };
  }

  conatinerProps = () => {
    const { binModal } = this.props;
    const {
      isOrderButtonEnabled,
      isOrderButtonVisible,
      binApplied,
      isTabbyInstallmentAvailable,
    } = this.state;
    return {
      binModal,
      isOrderButtonEnabled,
      isOrderButtonVisible,
      binApplied,
      isTabbyInstallmentAvailable,
    };
  };

  componentDidMount() {
    this.setState({ isOrderButtonVisible: true });
    this.setState({ isOrderButtonEnabled: true });
    this.setState({ binApplied: false });

    const {
      createTabbySession,
      shippingAddress,
      setTabbyWebUrl,
      getTabbyInstallment,
      totals: { total },
    } = this.props;
    // const countryCode = ['AE', 'SA', 'KW'].includes(getCountryFromUrl());
    const getCountryCode = getCountryFromUrl();
    getTabbyInstallment(total)
      .then((response) => {
        if (response?.value) {
          createTabbySession(shippingAddress)
            .then((response) => {
              if (response && response.configuration) {
                const {
                  configuration: {
                    available_products: { installments },
                  },
                  payment: { id },
                } = response;
                if (installments) {
                  if (installments) {
                    setTabbyWebUrl(
                      installments[0].web_url,
                      id,
                      TABBY_ISTALLMENTS
                    );
                    this.setState({ isTabbyInstallmentAvailable: true });
                  }
                }
              }
            }, this._handleError)
            .catch(() => { });
        }
      }, this._handleError)
      .catch(() => {});
  }
  componentDidUpdate(prevProps) {
    const {
      createTabbySession,
      shippingAddress,
      setTabbyWebUrl,
      getTabbyInstallment,
      totals: { total },
    } = this.props;
    if (prevProps?.totals?.total !== total) {
      getTabbyInstallment(total)
        .then((response) => {
          if (response?.value) {
            createTabbySession(shippingAddress)
              .then((response) => {
                if (response && response.configuration) {
                  const {
                    configuration: {
                      available_products: { installments },
                    },
                    payment: { id },
                  } = response;

                  if (installments) {
                    if (installments) {
                      setTabbyWebUrl(
                        installments[0].web_url,
                        id,
                        TABBY_ISTALLMENTS
                      );

                      // this variable actually is used in the component
                      // eslint-disable-next-line quote-props
                      this.setState({ isTabbyInstallmentAvailable: true });
                    }
                  }
                }
              }, this._handleError)
              .catch(() => { });
          } else {
            this.setState({ isTabbyInstallmentAvailable: false });
          }
        }, this._handleError)
        .catch(() => {});
    }
  }
  setOrderButtonDisabled() {
    this.setState({ isOrderButtonEnabled: false });
  }

  setOrderButtonEnabled() {
    this.setState({ isOrderButtonEnabled: true });
  }
  setOrderButtonEnableStatus(isOrderButtonEnabled) {
    this.setState({ isOrderButtonEnabled });
  }

  resetBinApply() {
    this.setState({ binApplied: false });
  }

  onBillingError(fields, invalidFields, error) {
    const { showErrorNotification } = this.props;

    if (error) {
      const { message = __("Something went wrong!") } = error;
      showErrorNotification(message);
    }
  }

  removeBinPromotion = async () => {
    const { updateTotals, removeBinPromotion } = this.props;
    this.resetBinApply();
    await removeBinPromotion();
    await updateTotals();
  };

  setCreditCardData(data) {
    const { number, expMonth, expYear, cvv, saveCard } = data;
    const { binApplied } = this.state;
    const {
      newCardVisible,
      totals: { discount },
    } = this.props;

    if (number) {
      this.setState({ number });
    }

    if (expMonth) {
      this.setState({ expMonth });
    }

    if (expYear) {
      this.setState({ expYear });
    }

    if (cvv) {
      this.setState({ cvv });
    }
    if (binApplied) {
      if (newCardVisible && !number) {
        this.removeBinPromotion();
      }
      this.setState({ binApplied: false });
    }
    if (saveCard !== undefined && saveCard !== null) {
      this.setState({ saveCard });
    }
  }

  showCreateNewPopup() {
    const { showPopup } = this.props;

    showPopup({
      action: ADD_ADDRESS,
      title: __("Add new address"),
      address: {},
    });
  }

  async applyBinPromotion() {
    const { number = "" } = this.state;
    const { getBinPromotion, updateTotals, binModal } = this.props;
    const response = await getBinPromotion(number.substr("0", "6"));
    binModal(response);
    await updateTotals();
    this.setState({ binApplied: true });
    this.setOrderButtonEnabled();
  }

  async applyBinPromotionOnSavedCard() {
    const { getBinPromotion, updateTotals, binModal, savedCards } = this.props;
    let selectedCard = savedCards.find((a) => a.selected === true);
    if (selectedCard && selectedCard.details) {
      //if saved card is selected
      const {
        details: { bin },
      } = selectedCard;
      const response = await getBinPromotion(bin);
      binModal(response);
      await updateTotals();
      this.setState({ binApplied: true });
    }
  }

  async applyPromotionSavedCard() {
    if (this.state.binApplied) {
      //if promotion already applied
      await this.removeBinPromotion();
      await this.applyBinPromotionOnSavedCard();
    } else {
      await this.applyBinPromotionOnSavedCard();
    }
  }

  async removePromotionSavedCard() {
    await this.removeBinPromotion();
    this.resetBinApply();
  }

  async onBillingSuccess(fields, asyncData) {
    const paymentMethod = this._getPaymentData(asyncData);
    const {
      savePaymentInformation,
      savedCards,
      newCardVisible,
      showErrorNotification,
      eddResponse,
      edd_info,
      totals: { items = [] },
    } = this.props;
    const address = this._getAddress(fields);
    const { code } = paymentMethod;
    let finalEdd = null;
    let finalEddString = ""
    let nonCrossBorderItems = items.filter((item) => {
      const {
        full_item_info: { cross_border = 0 },
      } = item;

      if (cross_border === 0) {
        return item;
      }
    });

    if (
      edd_info &&
      edd_info.is_enable &&
      eddResponse &&
      nonCrossBorderItems.length > 0
    ) {
      if (isObject(eddResponse)) {
        Object.values(eddResponse).filter((entry) => {
          if (entry.source === "thankyou" && entry.featute_flag_status === 1) {
            finalEdd = entry.edd_date;
            finalEddString = isArabic() ? entry['edd_message_ar'] : entry['edd_message_en']
          }
        });
      }
    }
    if (code === CARD) {
      if (newCardVisible) {
        //if payment is via new card.
        const {
          addNewCreditCard,
          getCardType,
          showErrorNotification,
          showSuccessMessage,
          setCheckoutCreditCardData,
        } = this.props;

        const {
          number = "",
          expYear,
          expMonth,
          cvv,
          binApplied,
          saveCard,
        } = this.state;
        if (!binApplied) {
          await this.applyBinPromotion();
          return;
        }

        setCheckoutCreditCardData(
          number,
          expMonth,
          expYear,
          cvv,
          saveCard,
          address?.email
        );

        getCardType(number.substr("0", "6")).then((response) => {
          if (response) {
            const { requires_3ds, type } = response;

            BrowserDatabase.setItem(
              type,
              "CREDIT_CART_TYPE",
              FIVE_MINUTES_IN_SECONDS
            );
            BrowserDatabase.setItem(
              requires_3ds,
              "CREDIT_CART_3DS",
              FIVE_MINUTES_IN_SECONDS
            );
          }
        });

        addNewCreditCard({ number, expMonth, expYear, cvv })
          .then((response) => {
            const { id, token } = response;
            if (id || token) {
              BrowserDatabase.setItem(
                id ?? token,
                "CREDIT_CART_TOKEN",
                FIVE_MINUTES_IN_SECONDS
              );
              if (isSignedIn()) {
                showSuccessMessage(__("Credit card successfully added"));
              }

              savePaymentInformation({
                billing_address: address,
                paymentMethod,
                finalEdd,
                finalEddString
              });
            } else if (Array.isArray(response)) {
              const message = response[0];

              if (typeof message === "string") {
                showErrorNotification(this.getCartError(message));
              } else {
                showErrorNotification(__("Something went wrong"));
              }
            } else if (typeof response === "string") {
              showErrorNotification(response);
            }
          }, this._handleError)
          .catch(() => {
            const { showErrorNotification } = this.props;

            showErrorNotification(__("Something went wrong"));
          });
      } else {
        //if payment is via saved card.
        let selectedCard = savedCards.find((a) => a.selected === true);
        if (selectedCard) {
          //if card is selected
          selectedCard["cvv"] = this.state.cvv;
          savePaymentInformation({
            billing_address: address,
            paymentMethod,
            selectedCard,
            finalEdd,
            finalEddString
          });
        } else {
          //if saved card is not selected
          showErrorNotification("Please select an card first.");
        }
      }
    } else if (code === TABBY_ISTALLMENTS) {
      this.createTabbySessionAndSavePaymentInformation(asyncData, fields);
    } else {
      savePaymentInformation({
        billing_address: address,
        paymentMethod,
        finalEdd,
        finalEddString
      });
    }
  }

  createTabbySessionAndSavePaymentInformation(asyncData, fields) {
    const paymentMethod = this._getPaymentData(asyncData);
    const address = this._getAddress(fields);
    const {
      savePaymentInformation,
      createTabbySession,
      shippingAddress,
      setTabbyWebUrl,
      eddResponse,
      edd_info,
      totals: { items = [] },
    } = this.props;
    let finalEdd = null;
    let finalEddString = "";
    let nonCrossBorderItems = items.filter((item) => {
      const {
        full_item_info: { cross_border = 0 },
      } = item;

      if (cross_border === 0) {
        return item;
      }
    });
    if (
      edd_info &&
      edd_info.is_enable &&
      eddResponse &&
      nonCrossBorderItems.length > 0
    ) {
      const { defaultEddDateString } = getDefaultEddDate(
        edd_info.default_message
      );
      if (isObject(eddResponse)) {
        Object.values(eddResponse).filter((entry) => {
          if (entry.source === "thankyou" && entry.featute_flag_status === 1) {
            finalEdd = entry.edd_date;
            finalEddString = isArabic() ? entry['edd_message_ar'] : entry['edd_message_en']
          }
        });
      } else {
        finalEdd = defaultEddDateString;
      }
    }
    createTabbySession(shippingAddress)
      .then((response) => {
        if (response && response.configuration) {
          const {
            configuration: {
              available_products: { installments },
            },
            payment: { id },
          } = response;
          if (installments) {
            if (installments) {
              setTabbyWebUrl(installments[0].web_url, id, TABBY_ISTALLMENTS);
            }
            savePaymentInformation({
              billing_address: address,
              paymentMethod,
              finalEdd,
              finalEddString
            });
          }
        }
      }, this._handleError)
      .catch(() => { });
  }

  getCartError(message) {
    switch (message) {
      case "card_number_invalid":
        return __("Card number is not valid");
      case "card_expiry_month_invalid":
        return __("Card exp month is not valid");
      case "card_expiry_year_invalid":
        return __("Card exp year is not valid");
      case "cvv_invalid":
        return __("Card cvv is not valid");
      default:
        return __("Something went wrong");
    }
  }

  onPaymentMethodSelect(code) {
    const { setPaymentCode } = this.props;
    this.setState({ paymentMethod: code });
    setPaymentCode(code);
  }
  /**
   * Get quest quote id
   * @returns {string}
   * @private
   */
  _getGuestQuoteId = () =>
    isSignedIn() ? "" : CartDispatcher._getGuestQuoteId();

  /**
   * Load configuration
   * @return {Promise<Request>}
   */
  requestConfig() {
    const promise = fetchQuery(CheckoutComQuery.getApplePayConfigQuery());

    promise.then(
      ({
        storeConfig: {
          checkout_com: { apple_pay },
        },
      }) => {
        this.setState({
          isLoading: false,
          ...apple_pay,
        });
      },
      () => this.setState({ isLoading: false })
    );

    return promise;
  }

  /**
   * Launch payment method
   */
  launchPaymentMethod() {
    const { showError } = this.props;
    const { isApplePayAvailable, merchant_id } = this.state;

    if (!isApplePayAvailable) {
      const missingApplePayMessage =
        "Apple Pay is not available for this browser.";

      showError(__(missingApplePayMessage));
      Logger.log(missingApplePayMessage);

      return;
    }

    new Promise((resolve) => {
      resolve(
        window.ApplePaySession.canMakePaymentsWithActiveCard(merchant_id)
      );
    })
      .then((canMakePayments) => {
        if (canMakePayments) {
          this.setState({ applePayDisabled: false });
        } else {
          const missingApplePayMessage =
            "Apple Pay is available but not currently active.";

          showError(__(missingApplePayMessage));
          Logger.log(missingApplePayMessage);
        }
      })
      .catch((error) => {
        showError(__("Something went wrong!"));
        Logger.log(error);
      });
  }

  /**
   * Handle apple pay click
   */
  handleApplePayButtonClick() {
    const { savePaymentInformationApplePay } = this.props;
    const {
      totals: {
        discount,
        subtotal = 0,
        total = 0,
        shipping_fee = 0,
        currency_code = getCurrency(),
        total_segments: totals = [],
        quote_currency_code,
        items,
      },
      default_title,
      shippingAddress: { country_id: countryCode },
      shippingAddress,
    } = this.props;

    const LineItems = this._getLineItems();

    const paymentRequest = {
      countryCode,
      currencyCode: quote_currency_code,
      supportedNetworks: this._getSupportedNetworks(),
      merchantCapabilities: this._getMerchantCapabilities(),
      total: { label: default_title, amount: total },
      lineItems: LineItems,
    };
    savePaymentInformationApplePay({
      billing_address: shippingAddress,
      paymentMethod: { code: "checkout_apple_pay" },
    });
    const applePaySession = new window.ApplePaySession(1, paymentRequest);

    try {
      this._addApplePayEvents(applePaySession);
      applePaySession.begin();
    } catch (error) {
      Sentry.captureException(e, function (sendErr, eventId) {
        // This callback fires once the report has been sent to Sentry
        if (sendErr) {
          console.error("Failed to send captured exception to Sentry");
        } else {
          console.log("Captured exception and send to Sentry successfully");
        }
      });
    }
  }

  /**
   * Add apple pay button events
   * @param applePaySession
   */
  _addApplePayEvents = (applePaySession) => {
    const {
      shippingAddress: { email },
      totals: { total: grand_total },
      customer: { email: customerEmail },
      showError,
      default_title,
      placeOrder,
    } = this.props;
    applePaySession.onvalidatemerchant = (event) => {
      const promise = this._performValidation(event.validationURL);
      promise
        .then((response) => {
          const {
            verifyCheckoutComApplePay: merchantSession,
            verifyCheckoutComApplePay: { statusMessage = "" },
          } = response;
          if (statusMessage) {
            showError(__(statusMessage));
            Logger.log("Cannot validate merchant:", merchantSession);

            return;
          }
          try {
            applePaySession.completeMerchantValidation(merchantSession);
            Logger.log("Completed merchant validation", merchantSession);
          } catch (error) {
            console.error("error on validation complete", error);
          }
        })
        .catch((error) => Logger.log(error));
    };

    applePaySession.onshippingcontactselected = (event) => {
      const status = window.ApplePaySession.STATUS_SUCCESS;
      const newTotal = {
        type: "final",
        label: default_title,
        amount: grand_total,
      };
      try {
        applePaySession.completeShippingContactSelection(
          status,
          [],
          newTotal,
          this._getLineItems()
        );
      } catch (error) {
        Logger.log("error on shipping contact selected", error);
      }
    };

    applePaySession.onshippingmethodselected = () => {
      const status = window.ApplePaySession.STATUS_SUCCESS;

      const newTotal = {
        type: "final",
        label: default_title,
        amount: grand_total,
      };
      try {
        applePaySession.completeShippingMethodSelection(
          status,
          newTotal,
          this._getLineItems()
        );
      } catch (error) {
        Logger.log("error on shipping methiod selected", error);
      }
    };

    applePaySession.onpaymentmethodselected = () => {
      const newTotal = {
        type: "final",
        label: default_title,
        amount: grand_total,
      };
      try {
        applePaySession.completePaymentMethodSelection(
          newTotal,
          this._getLineItems()
        );
      } catch (error) {
        Logger.log("payment method selected error", error);
      }
    };

    applePaySession.onpaymentauthorized = (event) => {
      tokenize({
        type: "applepay",
        token_data: event.payment.token.paymentData,
      })
        .then((response) => {
          if (response && response.token) {
            const data = {
              source: {
                type: "token",
                token: response.token,
              },
              customer: {
                email: customerEmail ?? email,
              },
              "3ds": {
                enabled: false,
              },
              metadata: {
                udf1: null,
              },
            };
            applePaySession.completePayment(
              window.ApplePaySession.STATUS_SUCCESS
            );

            placeOrder(CHECKOUT_APPLE_PAY, data);
          }
        })
        .catch((err) => {
          applePaySession.completePayment(
            window.ApplePaySession.STATUS_FAILURE
          );
        });
    };

    applePaySession.oncancel = () =>
      Logger.log("Apple Pay session was cancelled.");
  };

  /**
   * Get supported networks
   * @return {array}
   */
  _getSupportedNetworks = () => {
    const { supported_networks = "" } = this.state;

    return supported_networks.split(",");
  };

  /**
   * Get merchant capabilities
   * @return {array}
   */
  _getMerchantCapabilities = () => {
    const { merchant_capabilities } = this.state;
    const output = ["supports3DS"];
    const capabilities = merchant_capabilities.split(",");

    return output.concat(capabilities);
  };

  /**
   * Get line items
   * @returns {*[]}
   */
  _getLineItems = () => {
    const {
      totals: {
        discount,
        shipping_fee = 0,
        total_segments: totals = [],
        items = [],
      },
    } = this.props;
    const LineItems = items.map((item) => ({
      label: `${item?.full_item_info?.brand_name} - ${item?.full_item_info?.name}`,
      amount: item?.full_item_info?.price * item?.qty,
    }));
    if (discount) {
      LineItems.push({
        label: __("Discount"),
        amount: discount,
      });
    }

    if (shipping_fee) {
      LineItems.push({
        label: __("Shipping Charges"),
        amount: shipping_fee,
      });
    }

    const storeCredit = getDiscountFromTotals(totals, "customerbalance");

    const clubApparel = getDiscountFromTotals(totals, "clubapparel");

    if (storeCredit) {
      LineItems.push({
        label: __("Store Credit"),
        amount: storeCredit,
      });
    }

    if (clubApparel) {
      LineItems.push({
        label: __("Club Apparel Redemption"),
        amount: clubApparel,
      });
    }
    return LineItems;
  };

  /**
   * Get apple pay validation
   * @param validationUrl
   * @returns {Promise<Request>}
   */
  _performValidation = (validationUrl) => {
    this.setState({ isLoading: true });
    const mutation =
      CheckoutComQuery.getVerifyCheckoutComApplePayQuery(validationUrl);

    return fetchMutation(mutation).finally(() =>
      this.setState({ isLoading: false })
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutBillingContainer);
