import {
  CARD,
  CHECKOUT_APPLE_PAY,
  CHECKOUT_QPAY,
  TABBY_ISTALLMENTS,
  KNET_PAY,
} from "Component/CheckoutPayments/CheckoutPayments.config";
import { CC_POPUP_ID } from "Component/CreditCardPopup/CreditCardPopup.config";
import MagentoAPI from "Util/API/provider/MagentoAPI";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { isArabic } from "Util/App";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  AUTHORIZED_STATUS,
  CAPTURED_STATUS,
  DETAILS_STEP,
  SHIPPING_STEP,
} from "Route/Checkout/Checkout.config";
import {
  BILLING_STEP,
  PAYMENT_TOTALS,
} from "SourceRoute/Checkout/Checkout.config";
import {
  CheckoutContainer as SourceCheckoutContainer,
  mapDispatchToProps as sourceMapDispatchToProps,
} from "SourceRoute/Checkout/Checkout.container";
import Checkout from "./Checkout.component";
import { setGender } from "Store/AppState/AppState.action";
import { resetCart } from "Store/Cart/Cart.action";
// eslint-disable-next-line no-unused-vars
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import CreditCardDispatcher from "Store/CreditCard/CreditCard.dispatcher";
import { updateMeta } from "Store/Meta/Meta.action";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import StoreCreditDispatcher from "Store/StoreCredit/StoreCredit.dispatcher";
import BrowserDatabase from "Util/BrowserDatabase";
import { checkProducts } from "Util/Cart/Cart";
import Event, {
  EVENT_GTM_CHECKOUT,
  EVENT_GTM_EDD_TRACK_ON_ORDER,
  EVENT_MOE_ADD_PAYMENT_INFO,
  EVENT_MOE_EDD_TRACK_ON_ORDER,
  EVENT_GTM_CHECKOUT_BILLING,
} from "Util/Event";
import history from "Util/History";
import isMobile from "Util/Mobile";
import { ONE_MONTH_IN_SECONDS } from "Util/Request/QueryDispatcher";
import {
  CART_ID_CACHE_KEY,
  LAST_CART_ID_CACHE_KEY,
} from "../../store/MobileCart/MobileCart.reducer";
import {
  INTL_BRAND,
  DEFAULT_MESSAGE,
  EDD_MESSAGE_ARABIC_TRANSLATION,
  DEFAULT_READY_MESSAGE,
} from "../../util/Common/index";
import { getDefaultEddDate } from "Util/Date/index";

const PAYMENT_ABORTED = "payment_aborted";
const PAYMENT_FAILED = "payment_failed";

export const mapDispatchToProps = (dispatch) => ({
  ...sourceMapDispatchToProps(dispatch),
  estimateShipping: (address) =>
    CheckoutDispatcher.estimateShipping(dispatch, address),
  saveAddressInformation: (address) =>
    CheckoutDispatcher.saveAddressInformation(dispatch, address),
  createOrder: (code, additional_data, eddItems) =>
    CheckoutDispatcher.createOrder(dispatch, code, additional_data, eddItems),
  getBinPromotion: (bin) => CheckoutDispatcher.getBinPromotion(dispatch, bin),
  removeBinPromotion: () => CheckoutDispatcher.removeBinPromotion(dispatch),
  verifyPayment: (paymentId) =>
    CheckoutDispatcher.verifyPayment(dispatch, paymentId),
  updateTabbyPayment: (paymentId, orderId) =>
    CheckoutDispatcher.updateTabbyPayment(dispatch, paymentId, orderId),
  getPaymentMethods: () => CheckoutDispatcher.getPaymentMethods(),
  sendVerificationCode: (phone) =>
    CheckoutDispatcher.sendVerificationCode(dispatch, phone),
  getPaymentAuthorization: (paymentId) =>
    CheckoutDispatcher.getPaymentAuthorization(dispatch, paymentId),
  getPaymentAuthorizationQPay: (paymentId, qpaymethod) =>
    CheckoutDispatcher.getPaymentAuthorization(
      dispatch,
      paymentId,
      (qpaymethod = true)
    ),
  getPaymentAuthorizationKNET: (paymentId, qpaymethod, KNETpay) =>
    CheckoutDispatcher.getPaymentAuthorization(
      dispatch,
      paymentId,
      qpaymethod,
      (KNETpay=true)
    ),

  capturePayment: (paymentId, orderId) =>
    CheckoutDispatcher.capturePayment(dispatch, paymentId, orderId),
  cancelOrder: (orderId, cancelReason) =>
    CheckoutDispatcher.cancelOrder(dispatch, orderId, cancelReason),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
  updateStoreCredit: () => StoreCreditDispatcher.getStoreCredit(dispatch),
  setMeta: (meta) => dispatch(updateMeta(meta)),
  setGender: (gender) => dispatch(setGender(gender)),
  resetCart: () => dispatch(resetCart()),
  getCart: () => CartDispatcher.getCart(dispatch),
  updateTotals: (cartId) => CartDispatcher.getCartTotals(dispatch, cartId),
  saveCreditCard: (cardData) =>
    CreditCardDispatcher.saveCreditCard(dispatch, cardData),
});
export const mapStateToProps = (state) => ({
  totals: state.CartReducer.cartTotals,
  cartItems: state.CartReducer.cartItems,
  processingRequest: state.CartReducer.processingRequest,
  customer: state.MyAccountReducer.customer,
  addresses: state.MyAccountReducer.addresses,
  guest_checkout: state.ConfigReducer.guest_checkout,
  countries: state.ConfigReducer.countries,
  isSignedIn: state.MyAccountReducer.isSignedIn,
  showOverlay: PropTypes.func.isRequired,
  activeOverlay: state.OverlayReducer.activeOverlay,
  hideActiveOverlay: state.OverlayReducer.hideActiveOverlay,
  cartId: state.CartReducer.cartId,
  savedCards: state.CreditCardReducer.savedCards,
  newCardVisible: state.CreditCardReducer.newCardVisible,
  pdpEddAddressSelected: state.MyAccountReducer.pdpEddAddressSelected,
  edd_info: state.AppConfig.edd_info,
  addressCityData: state.MyAccountReducer.addressCityData,
  intlEddResponse: state.MyAccountReducer.intlEddResponse,
});

export class CheckoutContainer extends SourceCheckoutContainer {
  static propTypes = {
    updateStoreCredit: PropTypes.func.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    setMeta: PropTypes.func.isRequired,
    setGender: PropTypes.func.isRequired,
    removeCartItems: PropTypes.func.isRequired,
    cartId: PropTypes.number.isRequired,
    updateTotals: PropTypes.func.isRequired,
    binModal: PropTypes.func.isRequired,
  };

  containerFunctions = {
    setLoading: this.setLoading.bind(this),
    setDetailsStep: this.setDetailsStep.bind(this),
    savePaymentInformation: this.savePaymentInformation.bind(this),
    getBinPromotion: this.getBinPromotion.bind(this),
    saveAddressInformation: this.saveAddressInformation.bind(this),
    onShippingEstimationFieldsChange:
      this.onShippingEstimationFieldsChange.bind(this),
    onEmailChange: this.onEmailChange.bind(this),
    onCreateUserChange: this.onCreateUserChange.bind(this),
    onPasswordChange: this.onPasswordChange.bind(this),
    goBack: this.goBack.bind(this),
    resetCart: this.resetCart.bind(this),
    placeOrder: this.placeOrder.bind(this),
    showOverlay: this.props.showOverlay.bind(this),
    hideActiveOverlay: this.props.hideActiveOverlay.bind(this),
    updateTotals: this.updateTotals.bind(this),
    updateCreditCardData: this.updateCreditCardData.bind(this),
    setBillingStep: this.setBillingStep.bind(this),
    setTabbyURL: this.setTabbyURL.bind(this),
  };

  //   showOverlay() {
  //     return this.props.showOverlay;
  //   }

  //   hideActiveOverlay() {
  //     return this.props.hideActiveOverlay;
  //   }

  constructor(props) {
    super(props);

    const {
      toggleBreadcrumbs,
      totals: { is_virtual },
      totals,
    } = props;

    toggleBreadcrumbs(false);

    this.state = {
      isLoading: false,
      isDeliveryOptionsLoading: false,
      requestsSent: 0,
      paymentMethods: [],
      shippingMethods: [],
      shippingAddress: {},
      checkoutStep: is_virtual ? BILLING_STEP : SHIPPING_STEP,
      orderID: "",
      incrementID: "",
      threeDsUrl: "",
      paymentTotals: BrowserDatabase.getItem(PAYMENT_TOTALS) || {},
      email: "",
      isCreateUser: false,
      isGuestEmailSaved: false,
      isVerificationCodeSent: false,
      lastOrder: {},
      initialTotals: totals,
      processApplePay: true,
      initialGTMSent: false,
      tabbyPaymentId: null,
      tabbyPaymentStatus: "",
      QPayDetails: {},
      isClickAndCollect: "",
      PaymentRedirect: false,
      tabbyURL: "",
      QPayOrderDetails: null,
      KNETOrderDetails: null,
      KnetDetails: {},
    };
  }

  refreshCart = async () => {
    const { updateTotals, cartId, removeBinPromotion } = this.props;
    await removeBinPromotion();
    await updateTotals(cartId);
  };

  getTabbyData = async () => {
    // Need to get payment data from Tabby.
    const {
      showErrorNotification,
      cancelOrder,
      verifyPayment,
      updateTabbyPayment,
    } = this.props;
    try {
      const TABBY_CHECK = JSON.parse(
        localStorage.getItem("TABBY_ORDER_DETAILS")
      );
      const now = new Date();
      if (TABBY_CHECK && now.getTime() < TABBY_CHECK?.expiry) {
        const { order_id, increment_id } = TABBY_CHECK;
        this.setState({ PaymentRedirect: true, isLoading: false });
        const ShippingAddress = JSON.parse(
          localStorage.getItem("Shipping_Address")
        );
        this.setState({ shippingAddress: ShippingAddress });
        const paymentInformation = JSON.parse(
          localStorage.getItem("PAYMENT_INFO")
        );
        const { tabbyPaymentId } = paymentInformation;

        verifyPayment(tabbyPaymentId).then(async (data) => {
          if (data) {
            localStorage.removeItem("Shipping_Address");
            const { data: order } = await MagentoAPI.get(`orders/${order_id}`);
            this.setState({ QPayOrderDetails: order });

            const { status } = data;

            if (status === AUTHORIZED_STATUS || status === CAPTURED_STATUS) {
              BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
              this.setDetailsStep(order_id, increment_id);
              this.setState({ isLoading: false });
              this.resetCart();
            } else {
              cancelOrder(order_id, PAYMENT_FAILED);
              this.setState({ isFailed: true });
              this.setDetailsStep(order_id, increment_id);
              this.resetCart();
            }
          }
          localStorage.removeItem("TABBY_ORDER_DETAILS");
          return;
        });
      } else if (now.getTime() >= TABBY_CHECK?.expiry) {
        localStorage.removeItem("TABBY_ORDER_DETAILS");
      }
    } catch (error) {
      localStorage.getItem("TABBY_ORDER_DETAILS");
      this.setState({ PaymentRedirect: false });
      console.error("error while auth in tabby pay case", error);
    }
  };

  getKNETData = async () => {
    try {
      const KNET_CHECK = JSON.parse(localStorage.getItem("KNET_ORDER_DETAILS"));
      const now = new Date();
      if (KNET_CHECK && now.getTime() < KNET_CHECK?.expiry) {
      }
      if (KNET_CHECK && now.getTime() < KNET_CHECK?.expiry) {
        this.setState({ PaymentRedirect: true });

        const { getPaymentAuthorization, capturePayment, cancelOrder, getPaymentAuthorizationKNET } =
          this.props;

        const ShippingAddress = JSON.parse(
          localStorage.getItem("Shipping_Address")
        );

        this.setState({ shippingAddress: ShippingAddress });

        const { id, order_id, increment_id } = KNET_CHECK;
        const response = await getPaymentAuthorizationKNET(id, false, true);
        if (response) {
          this.setState({ CreditCardPaymentStatus: AUTHORIZED_STATUS });

          localStorage.removeItem("Shipping_Address");

          const { status, id: paymentId = "" } = response;

          localStorage.removeItem("Shipping_Address");


          const { data: order } = await MagentoAPI.get(`orders/${order_id}`);


          this.setState({ KNETOrderDetails: order });

          if (status === "Authorized" || status === "Captured") {
            BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
            this.setDetailsStep(order_id, increment_id);
            this.setState({ isLoading: false });
            this.resetCart();
            try {
              const cResponse = await capturePayment(paymentId, order_id);
              if (cResponse) {
                const { bank_reference, requested_on, amount, currency, knet_payment_id, knet_transaction_id } = cResponse;
                this.setState({
                  KnetDetails: {
                    bank_reference: bank_reference,
                    date: requested_on,
                    status: "SUCCESS",
                    amount: amount,
                    currency: currency,
                    knet_payment_id: knet_payment_id,
                    knet_transaction_id: knet_transaction_id,
                  },
                });
              }
            } catch (error) {
              console.error("capture api response", error);
            }
          }

          if (
            status === "Declined" ||
            status === "Canceled" ||
            status === "Pending"
          ) {
            cancelOrder(order_id, PAYMENT_FAILED);
            this.setState({ isLoading: false, isFailed: true });
            this.setDetailsStep(order_id, increment_id);
            this.resetCart();
            try {
              const cResponse = await capturePayment(paymentId, order_id);
              if (cResponse) {
                const { pun, requested_on, amount, currency, knet_payment_id, knet_transaction_id } = cResponse;
                this.setState({
                  KnetDetails: {
                    PUN: pun,
                    date: requested_on,
                    amount: `${currency} ${amount}`,
                    status: "FAILED",
                    Payment_ID: paymentId,
                    knet_payment_id: knet_payment_id,
                    knet_transaction_id: knet_transaction_id,
                  },
                });
              }
            } catch (error) {
              console.error("capture api response", error);
            }
          }
        }
        localStorage.removeItem("KNET_ORDER_DETAILS");
        return;
      } else if (now.getTime() >= KNET_CHECK?.expiry) {
        localStorage.removeItem("KNET_ORDER_DETAILS");
      }
    } catch (error) {
      localStorage.removeItem("KNET_ORDER_DETAILS");
      console.error("error while auth in Knet case", error);
    }
  };

  getQPayData = async () => {
    try {
      const QPAY_CHECK = JSON.parse(localStorage.getItem("QPAY_ORDER_DETAILS"));
      const now = new Date();
      if (QPAY_CHECK && now.getTime() < QPAY_CHECK?.expiry) {
        this.setState({ PaymentRedirect: true });

        const { getPaymentAuthorizationQPay, capturePayment, cancelOrder } =
          this.props;

        const ShippingAddress = JSON.parse(
          localStorage.getItem("Shipping_Address")
        );

        this.setState({ shippingAddress: ShippingAddress });

        const { id, order_id, increment_id } = QPAY_CHECK;

        const response = await getPaymentAuthorizationQPay(id, true);
        if (response) {
          this.setState({ CreditCardPaymentStatus: AUTHORIZED_STATUS });

          localStorage.removeItem("Shipping_Address");

          const { status, id: paymentId = "" } = response;

          localStorage.removeItem("Shipping_Address");

          const { data: order } = await MagentoAPI.get(`orders/${order_id}`);

          this.setState({ QPayOrderDetails: order });

          if (status === "Authorized" || status === "Captured") {
            BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
            this.setDetailsStep(order_id, increment_id);
            this.setState({ isLoading: false });
            this.resetCart();
            try {
              const cResponse = await capturePayment(paymentId, order_id);
              if (cResponse) {
                const { pun, requested_on, amount, currency } = cResponse;
                this.setState({
                  QPayDetails: {
                    PUN: pun,
                    date: requested_on,
                    status: "SUCCESS",
                  },
                });
              }
            } catch (error) {
              console.error("capture api response", error);
            }
          }

          if (
            status === "Declined" ||
            status === "Canceled" ||
            status === "Pending"
          ) {
            cancelOrder(order_id, PAYMENT_FAILED);
            this.setState({ isLoading: false, isFailed: true });
            this.setDetailsStep(order_id, increment_id);
            this.resetCart();
            try {
              const cResponse = await capturePayment(paymentId, order_id);
              if (cResponse) {
                const { pun, requested_on, amount, currency } = cResponse;
                this.setState({
                  QPayDetails: {
                    PUN: pun,
                    date: requested_on,
                    amount: `${currency} ${amount}`,
                    status: "FAILED",
                    Payment_ID: paymentId,
                  },
                });
              }
            } catch (error) {
              console.error("capture api response", error);
            }
          }
        }
        localStorage.removeItem("QPAY_ORDER_DETAILS");
        return;
      } else if (now.getTime() >= QPAY_CHECK?.expiry) {
        localStorage.removeItem("QPAY_ORDER_DETAILS");
      }
    } catch (error) {
      localStorage.removeItem("QPAY_ORDER_DETAILS");
      console.error("error while auth in qpay case", error);
    }
  };

  async componentDidMount() {
    const { setMeta, cartId, updateTotals, getCouponList } = this.props;
    const { checkoutStep, initialGTMSent } = this.state;
    const QPAY_CHECK = JSON.parse(localStorage.getItem("QPAY_ORDER_DETAILS"));
    const TABBY_CHECK = JSON.parse(localStorage.getItem("TABBY_ORDER_DETAILS"));
    const KNET_CHECK = JSON.parse(localStorage.getItem("KNET_ORDER_DETAILS"));
    if (!QPAY_CHECK && !TABBY_CHECK && !KNET_CHECK) {
      this.refreshCart();
    } else {
      await updateTotals(cartId);
    }
    setMeta({ title: __("Checkout") });
    this.getKNETData();
    this.getQPayData();
    this.getTabbyData();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      history,
      showInfoNotification,
      showErrorNotification,
      guest_checkout = true,
      totals = {},
      totals: { items = [], discount = 0, total, total_segments = [] },
      updateStoreCredit,
      isSignedIn,
    } = this.props;

    const { checkoutStep, initialGTMSent, PaymentRedirect } = this.state;
    const { checkoutStep: prevCheckoutStep } = prevState;
    const { total: { items: prevItems } = {} } = prevProps;
    if (PaymentRedirect) {
      if (checkoutStep !== prevCheckoutStep) {
        updateStoreCredit();
        this.handleCheckoutGTM();
      }
      return true;
    }
    if (prevItems !== items && items.length) {
      let isClickAndCollect = "";
      for (let i = 0; i < items.length; i++) {
        if (!!items[i]?.extension_attributes?.click_to_collect_store) {
          isClickAndCollect =
            items[i]?.extension_attributes?.click_to_collect_store || "";
        } else {
          isClickAndCollect = "";
          break;
        }
      }

      this.setState({ isClickAndCollect: isClickAndCollect });
    }

    if (Object.keys(totals).length !== 0) {
      this.updateInitTotals();
    }

    if (
      checkoutStep === SHIPPING_STEP &&
      !initialGTMSent &&
      Object.keys(totals).length
    ) {
      this.handleCheckoutGTM(true);
    }

    if (checkoutStep !== prevCheckoutStep) {
      updateStoreCredit();
      this.handleCheckoutGTM();
    }

    if (items.length !== 0) {
      const mappedItems = checkProducts(items) || [];

      if (mappedItems.length !== 0) {
        history.push("/cart", { errorState: false });
      }
    }

    if (
      Object.keys(totals).length &&
      !items.length &&
      checkoutStep !== DETAILS_STEP
    ) {
      showInfoNotification(__("Please add at least one product to cart!"));
      history.push("/cart");
      return;
    }

    if (
      Object.keys(totals).length &&
      total === 0 &&
      checkoutStep !== DETAILS_STEP
    ) {
      const totalSum = total_segments.reduce((acc, item) => {
        if (item.code === "msp_cashondelivery") {
          return acc + 0;
        } else {
          return acc + item.value;
        }
      }, 0);

      if (totalSum + discount !== 0) {
        showErrorNotification(__("Your cart is invalid"));
        history.push("/");
      }
    }

    // if guest checkout is disabled and user is not logged in => throw him to homepage
    if (!guest_checkout && !isSignedIn()) {
      history.push("/");
    }
  }

  removeBinPromotion() {
    const { removeBinPromotion } = this.props;
    removeBinPromotion().then(() => {
      this.updateTotals();
    });
  }
  componentWillUnmount() {
    this.removeBinPromotion();
  }

  handleCheckoutGTM(isInitial = false) {
    const { totals } = this.props;
    const { checkoutStep, incrementID, initialTotals } = this.state;
    const tempObj = JSON.stringify(initialTotals);
    if (checkoutStep == BILLING_STEP) {
      localStorage.setItem("cartProducts", tempObj);
    }
    if (checkoutStep !== DETAILS_STEP) {
      Event.dispatch(EVENT_GTM_CHECKOUT, {
        totals,
        step: this.getCheckoutStepNumber(),
      });
      if (this.getCheckoutStepNumber() == "2"){
        Event.dispatch(EVENT_GTM_CHECKOUT_BILLING);
      }
    }
    if (isInitial) {
      this.setState({ initialGTMSent: true });
    }
  }

  /* eslint-disable no-magic-numbers */
  getCheckoutStepNumber() {
    const { checkoutStep } = this.state;

    switch (checkoutStep) {
      case SHIPPING_STEP:
        return 1;
      case BILLING_STEP:
        return 2;
      case DETAILS_STEP:
        return 3;
      default:
        return 0;
    }
  }

  updateInitTotals() {
    const { totals } = this.props;
    this.setState({ initialTotals: totals });
  }
  setTabbyURL(UrlTabby) {
    this.setState({ tabbyURL: UrlTabby });
  }
  saveLastOrder(totals) {
    this.setState({ lastOrder: totals });
  }

  onShippingEstimationFieldsChange(address = {}) {
    const canEstimate = !Object.values(address).some(
      (item) => item === undefined
    );

    if (!canEstimate) {
      return;
    }

    const { estimateShipping } = this.props;
    const Checkout = this;

    /* eslint-disable */
    delete address.region_id;
    if (!address?.region && address?.postcode) {
      address.region = address?.postcode;
    }
    if (!address?.area && address?.postcode) {
      address.area = address?.postcode;
    }
    Checkout.setState({ isLoading: true });
    estimateShipping({
      ...address,
      default_shipping: true,
    }).then((response) => {
      if (typeof response !== "undefined") {
        Checkout.setState({
          shippingMethods: response.data,
          isLoading: false,
        });
      }
      Checkout.setState({ isLoading: false });
    }, this._handleError);
  }

  goBack() {
    const { checkoutStep } = this.state;

    if (checkoutStep === BILLING_STEP) {
      this.setState({
        isLoading: false,
        checkoutStep: SHIPPING_STEP,
      });

      BrowserDatabase.deleteItem(PAYMENT_TOTALS);
    }

    history.goBack();
  }

  async saveAddressInformation(addressInformation) {
    const { saveAddressInformation, showErrorNotification } = this.props;
    const { shipping_address } = addressInformation;

    this.setState({
      isLoading: true,
      shippingAddress: shipping_address,
    });

    saveAddressInformation(addressInformation).then((res) => {
      const data = res.data;
      if(!data){
        showErrorNotification(res);
        setTimeout(() => {
          window.location = "/";
        }, 1500);
      } else {
        const { totals } = data;
  
        BrowserDatabase.setItem(totals, PAYMENT_TOTALS, ONE_MONTH_IN_SECONDS);
  
        this.setState({
          paymentTotals: totals,
        });
  
        this.getPaymentMethods();
      }
    }, this._handleError);
  }

  updateTotals() {
    const { updateTotals, cartId } = this.props;
    updateTotals(cartId);
  }

  getBinPromotion(bin) {
    const { getBinPromotion } = this.props;
    return getBinPromotion(bin);
  }

  updateCreditCardData(creditCardData) {
    this.setState({ creditCardData });
  }

  /*async*/ savePaymentInformation(paymentInformation) {
    this.setState({ isLoading: true });

    /*await*/ this.savePaymentMethodAndPlaceOrder(paymentInformation);
  }

  /*async*/ savePaymentMethodAndPlaceOrder(paymentInformation) {
    console.table(paymentInformation);
    const {
      paymentMethod: { code, additional_data },
      tabbyPaymentId,
      finalEdd,
    } = paymentInformation;

    const {
      savedCards,
      newCardVisible,
      customer: { email: customerEmail },
      cartItems,
      intlEddResponse,
      edd_info,
    } = this.props;
    const {
      shippingAddress: { email },
    } = this.state;
    let data = {};
    let eddItems = [];
    if (edd_info?.is_enable && cartItems) {
      cartItems.map(({ full_item_info }) => {
        const {
          cross_border = 0,
          brand_name = "",
          international_vendor,
          sku,
          extension_attributes,
        } = full_item_info;
        const defaultDay = extension_attributes?.click_to_collect_store
          ? edd_info.ctc_message
          : edd_info.default_message;
        const {
          defaultEddDateString,
          defaultEddDay,
          defaultEddMonth,
          defaultEddDat,
        } = getDefaultEddDate(defaultDay);
        let itemEddMessage = extension_attributes?.click_to_collect_store
          ? DEFAULT_READY_MESSAGE
          : DEFAULT_MESSAGE;
        let customDefaultMess = isArabic()
          ? EDD_MESSAGE_ARABIC_TRANSLATION[itemEddMessage]
          : itemEddMessage;
        const actualEddMess = `${customDefaultMess} ${defaultEddDat} ${defaultEddMonth}, ${defaultEddDay}`;
        const isIntlBrand =
          (INTL_BRAND.includes(brand_name.toString().toLowerCase()) &&
            cross_border === 1) ||
          cross_border === 1;
        const intlEddObj = intlEddResponse["checkout"]?.find(
          ({ vendor }) => vendor.toLowerCase() === brand_name.toString().toLowerCase()
        );
        eddItems.push({
          sku: sku,
          edd_date:
            isIntlBrand &&
            intlEddObj &&
            edd_info &&
            edd_info.has_cross_border_enabled
              ? intlEddObj["edd_date"]
              : isIntlBrand && edd_info && edd_info.has_cross_border_enabled
              ? intlEddResponse["checkout"][0]["edd_date"]
              : isIntlBrand && edd_info && !edd_info.has_cross_border_enabled
              ? null
              : extension_attributes?.click_to_collect_store
              ? defaultEddDateString
              : finalEdd,
          cross_border: cross_border,
          edd_message_en:
            isIntlBrand &&
            intlEddObj &&
            edd_info &&
            edd_info.has_cross_border_enabled
              ? intlEddObj["edd_message_en"]
              : isIntlBrand && edd_info && edd_info.has_cross_border_enabled
              ? intlEddResponse["checkout"][0]["edd_message_en"]
              : isIntlBrand && edd_info && !edd_info.has_cross_border_enabled
              ? null
              : actualEddMess,
          edd_message_ar:
            isIntlBrand &&
            intlEddObj &&
            edd_info &&
            edd_info.has_cross_border_enabled
              ? intlEddObj["edd_message_ar"]
              : isIntlBrand && edd_info && edd_info.has_cross_border_enabled
              ? intlEddResponse["checkout"][0]["edd_message_ar"]
              : isIntlBrand && edd_info && !edd_info.has_cross_border_enabled
              ? null
              : actualEddMess,
          intl_vendors: INTL_BRAND.includes(brand_name.toString().toLowerCase())
            ? international_vendor
            : cross_border === 1
            ? international_vendor
            : null,
        });
      });
    }
    if (code === CARD) {
      data = {
        ...additional_data,
        customer: {
          email: customerEmail ? customerEmail : email,
        },
        "3ds": {
          enabled: newCardVisible
            ? BrowserDatabase.getItem("CREDIT_CART_3DS")
            : true,
        },
        metadata: {
          udf1:
            typeof BrowserDatabase.getItem("CREDIT_CART_TYPE") === "string"
              ? BrowserDatabase.getItem("CREDIT_CART_TYPE")
              : null,
        },
      };
      if (newCardVisible) {
        data["source"] = {
          type: "token",
          token: BrowserDatabase.getItem("CREDIT_CART_TOKEN"),
        };
      } else {
        const {
          selectedCard: { cvv, gateway_token },
        } = paymentInformation;
        data["source"] = {
          cvv,
          type: "id",
          id: gateway_token,
        };
      }
    } else if (code === CHECKOUT_QPAY || code === KNET_PAY) {
      data = {};
    } else {
      data = additional_data;
    }

    if (code === CHECKOUT_APPLE_PAY) {
      this.setState({ processApplePay: true });
    } else if (code === TABBY_ISTALLMENTS || code === CHECKOUT_QPAY || code === KNET_PAY) {
      this.placeOrder(code, data, paymentInformation, finalEdd, eddItems);
    } else {
      this.placeOrder(code, data, null, finalEdd, eddItems);
    }
  }

  async placeOrder(code, data, paymentInformation, finalEdd, eddItems) {
    const { createOrder, showErrorNotification } = this.props;
    const { tabbyURL } = this.state;
    const ONE_YEAR_IN_SECONDS = 31536000;
    const cart_id = BrowserDatabase.getItem(CART_ID_CACHE_KEY);
    BrowserDatabase.setItem(
      cart_id,
      LAST_CART_ID_CACHE_KEY,
      ONE_YEAR_IN_SECONDS // TODO Get info from Backend developers on cart expire time
    );
    this.setState({ isLoading: true });
    try {
      const response = await createOrder(code, data, eddItems);
      if (response && response.data) {
        if (finalEdd) {
          Event.dispatch(EVENT_GTM_EDD_TRACK_ON_ORDER, {
            edd_date: finalEdd,
          });
          Moengage.track_event(EVENT_MOE_EDD_TRACK_ON_ORDER, {
            country: getCountryFromUrl().toUpperCase(),
            language: getLanguageFromUrl().toUpperCase(),
            edd_date: finalEdd,
            app6thstreet_platform: "Web",
          });
        }
        const { data } = response;
        if (typeof data === "object") {
          const {
            order_id,
            http_response_code,
            success,
            response_code,
            increment_id,
            id = "",
            _links: { redirect: { href = "" } = {} } = {},
          } = data;

          if (success || response_code === 200 || http_response_code === 202) {
            localStorage.removeItem("lastCouponCode");
            this.setState({ isLoading: false });
            if (code === CHECKOUT_APPLE_PAY) {
              this.setState({
                order_id,
                increment_id,
              });
              BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
              this.setDetailsStep(order_id, increment_id);
              this.resetCart();
              return true;
            }
            if (code === CARD && href) {
              this.setState({
                threeDsUrl: href,
                order_id,
                increment_id,
                id,
              });
              setTimeout(() => this.processThreeDSWithTimeout(3), 10000);
            } else if (code === TABBY_ISTALLMENTS) {
              const { shippingAddress } = this.state;
              this.setState({
                order_id,
                increment_id,
                id,
              });
              const now = new Date();
              const obj = {
                order_id,
                id,
                increment_id,
                // keep details in localstorage for 10 mins only
                expiry: now.getTime() + 600000,
              };
              localStorage.setItem("ORDER_EDD_ITEMS", JSON.stringify(eddItems));
              localStorage.setItem("TABBY_ORDER_DETAILS", JSON.stringify(obj));
              localStorage.setItem(
                "PAYMENT_INFO",
                JSON.stringify(paymentInformation)
              );
              localStorage.setItem(
                "Shipping_Address",
                JSON.stringify(shippingAddress)
              );
              this.setState({ isLoading: true });
              window.open(`${tabbyURL}`, "_self");

              // this.setState({
              //   isTabbyPopupShown: true,
              //   order_id,
              //   increment_id,
              // });
              // setTimeout(
              //   () => this.processTabbyWithTimeout(3, paymentInformation),
              //   10000
              // );

              //return true;
            } else if (code === CHECKOUT_QPAY) {
              const { shippingAddress } = this.state;
              this.setState({
                order_id,
                increment_id,
                id,
              });
              const now = new Date();
              const obj = {
                order_id,
                id,
                increment_id,
                // keep details in localstorage for 2 mins only
                expiry: now.getTime() + 120000,
              };
              localStorage.setItem("ORDER_EDD_ITEMS", JSON.stringify(eddItems));
              localStorage.setItem("QPAY_ORDER_DETAILS", JSON.stringify(obj));
              localStorage.setItem(
                "PAYMENT_INFO",
                JSON.stringify(paymentInformation)
              );
              localStorage.setItem(
                "Shipping_Address",
                JSON.stringify(shippingAddress)
              );
              window.open(`${href}`, "_self");

              //return true;
            } else if(code === KNET_PAY) {

              const { shippingAddress } = this.state;
              this.setState({
                order_id,
                increment_id,
                id,
              });
              const now = new Date();
              const obj = {
                order_id,
                id,
                increment_id,
                // keep details in localstorage for 2 mins only
                expiry: now.getTime() + 120000,
              };
              localStorage.setItem("KNET_ORDER_DETAILS", JSON.stringify(obj));
              localStorage.setItem(
                "PAYMENT_INFO",
                JSON.stringify(paymentInformation)
              );
              localStorage.setItem(
                "Shipping_Address",
                JSON.stringify(shippingAddress)
              );
              window.open(`${href}`, "_self");

          } else {
              if (code === CARD) {
                const { saveCreditCard, newCardVisible } = this.props;
                const { creditCardData } = this.state;
                if (newCardVisible && creditCardData.saveCard) {
                  saveCreditCard({
                    email: creditCardData.email,
                    paymentId: id,
                  })
                    .then(() => {})
                    .catch(() => {
                      showErrorNotification(
                        __("Something went wrong! Please, try again!")
                      );
                    });
                }
              }
              BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
              this.setDetailsStep(order_id, increment_id);
              this.resetCart();
              return true;
            }
          } else {
            const { error } = data;

            if (error && typeof error === "string") {
              showErrorNotification(__(error));
              this.setState({ isLoading: false });
              if (code === CHECKOUT_APPLE_PAY) {
                return false;
              }
              this.resetCart();
            }
          }
        }

        if (typeof data === "string") {
          showErrorNotification(__(data));
          this.setState({ isLoading: false });
          if (code === CHECKOUT_APPLE_PAY) {
            return false;
          }
          this.resetCart();
        }
      }

      if (response && typeof response === "string") {
        showErrorNotification(__(response));
        this.setState({ isLoading: false });
        if (code === CHECKOUT_APPLE_PAY) {
          return false;
        }
        this.resetCart();
      }
    } catch (e) {
      const { showErrorNotification } = this.props;
      this.setState({ isLoading: false });

      showErrorNotification(__("Something went wrong."));
      this.resetCart();
      // this._handleError(e);
    }
  }

  setDetailsStep(orderID, incrementID) {
    const { setNavigationState, sendVerificationCode, isSignedIn, customer } =
      this.props;
    const { shippingAddress } = this.state;
    if (isSignedIn) {
      if (customer.isVerified !== "0") {
        const { phone = "" } = customer;
        const code = phone.slice(1, 4);
        const mobile = phone.slice(4);

        sendVerificationCode({ mobile, code }).then((response) => {
          if (response.success) {
            this.setState({ isVerificationCodeSent: response.success });
          } else {
            console.log("response.error", response.error);
            showErrorNotification(response.error);
          }
        }, this._handleError);
      }
    } else {
      const { phone = "", phonecode = "" } = shippingAddress;
      sendVerificationCode({ mobile: phone, countryCode: phonecode }).then(
        (response) => {
          this.setState({ isVerificationCodeSent: response.success });
        },
        this._handleError
      );
    }

    BrowserDatabase.deleteItem(PAYMENT_TOTALS);

    this.setState({
      isLoading: false,
      checkoutStep: DETAILS_STEP,
      orderID,
      incrementID,
    });

    setNavigationState({
      name: DETAILS_STEP,
    });
  }

  setBillingStep() {
    this.setState({
      checkoutStep: SHIPPING_STEP,
    });
  }

  getPaymentMethods() {
    const { getPaymentMethods } = this.props;

    getPaymentMethods().then(({ data = [] }) => {
      const availablePaymentMethods = data.reduce((acc, paymentMethod) => {
        const { is_enabled } = paymentMethod;

        if (is_enabled) {
          acc.push(paymentMethod);
        }

        return acc;
      }, []);

      if (data) {
        this.setState({
          isLoading: false,
          paymentMethods: availablePaymentMethods,
          checkoutStep: BILLING_STEP,
        });
      }
    }, this._handleError);
  }

  processThreeDS() {
    const {
      getPaymentAuthorization,
      capturePayment,
      cancelOrder,
      saveCreditCard,
      newCardVisible,
      showOverlay,
      hideActiveOverlay,
    } = this.props;
    const { order_id, increment_id, id = "", creditCardData } = this.state;
    getPaymentAuthorization(id).then((response) => {
      if (response) {
        const { status, id: paymentId = "" } = response;

        if (status === "Authorized") {
          BrowserDatabase.deleteItem(LAST_CART_ID_CACHE_KEY);
          this.setDetailsStep(order_id, increment_id);
          this.resetCart();
          this.setState({ CreditCardPaymentStatus: AUTHORIZED_STATUS });
          capturePayment(paymentId, order_id);
          if (isMobile.any()) {
            showOverlay(CC_POPUP_ID);
          }
          hideActiveOverlay();
          if (newCardVisible && creditCardData.saveCard) {
            saveCreditCard({ email: creditCardData.email, paymentId })
              .then(() => {})
              .catch(() => {
                showErrorNotification(
                  __("Something went wrong! Please, try again!")
                );
              });
          }
        }

        if (status === "Declined") {
          cancelOrder(order_id, PAYMENT_FAILED);
          this.setState({ isLoading: false, isFailed: true });
          hideActiveOverlay();
          this.setDetailsStep(order_id, increment_id);
          this.resetCart();
        }
      }
    });
  }

  processThreeDSWithTimeout(counter) {
    const { CreditCardPaymentStatus, order_id, increment_id } = this.state;
    const {
      showErrorNotification,
      hideActiveOverlay,
      activeOverlay,
      cancelOrder,
    } = this.props;

    // Need to get payment data from CreditCard.
    // Could not get callback of CreditCard another way because CreditCard is iframe in iframe
    if (
      CreditCardPaymentStatus !== AUTHORIZED_STATUS &&
      counter < 100 &&
      activeOverlay === CC_POPUP_ID
    ) {
      setTimeout(() => {
        this.processThreeDS();
        this.processThreeDSWithTimeout(counter + 1);
      }, 5000);
    }

    if (counter === 100) {
      showErrorNotification("Credit Card session timeout");
      hideActiveOverlay();
    }

    if (
      (counter === 100 || activeOverlay !== CC_POPUP_ID) &&
      CreditCardPaymentStatus !== AUTHORIZED_STATUS
    ) {
      cancelOrder(order_id, PAYMENT_ABORTED);
      this.setState({ isLoading: false, isFailed: true });
      this.setDetailsStep(order_id, increment_id);
      this.resetCart();
    }
  }

  resetCart() {
    const { updateStoreCredit, resetCart, getCart } = this.props;

    resetCart();
    getCart();
    updateStoreCredit();
  }

  render() {
    const { isClickAndCollect } = this.state;
    return (
      <Checkout
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
        {...this.containerProps()}
        isClickAndCollect={isClickAndCollect}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);
