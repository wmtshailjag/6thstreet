/* eslint-disable react/prop-types */
import { CUSTOMER_ACCOUNT_PAGE } from "Component/Header/Header.config";
import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { MY_ACCOUNT_URL } from "Route/MyAccount/MyAccount.config";
import MyAccountContainer, {
  tabMap,
} from "Route/MyAccount/MyAccount.container";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import CheckoutDispatcher from "Store/Checkout/Checkout.dispatcher";
import ClubApparelDispatcher from "Store/ClubApparel/ClubApparel.dispatcher";
import { updateMeta } from "Store/Meta/Meta.action";
import MyAccountDispatcher from "Store/MyAccount/MyAccount.dispatcher";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { showNotification } from "Store/Notification/Notification.action";
import { toggleOverlayByKey } from "Store/Overlay/Overlay.action";
import { customerType } from "Type/Account";
import { TotalsType } from "Type/MiniCart";
import Algolia from "Util/API/provider/Algolia";
import { getUUID, getUUIDToken } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import { ADD_TO_CART_ALGOLIA, VUE_BUY } from "Util/Event";
import history from "Util/History";
import isMobile from "Util/Mobile";
import CheckoutSuccess from "./CheckoutSuccess.component";

export const BreadcrumbsDispatcher = import(
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
  headerState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
  guest_checkout: state.ConfigReducer.guest_checkout,
  customer: state.MyAccountReducer.customer,
  totals: state.CartReducer.cartTotals,
  isSignedIn: state.MyAccountReducer.isSignedIn,
  config: state.AppConfig.config,
  eddResponse: state.MyAccountReducer.eddResponse,
  intlEddResponse:state.MyAccountReducer.intlEddResponse,
  edd_info: state.AppConfig.edd_info,
});

export const mapDispatchToProps = (dispatch) => ({
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  updateBreadcrumbs: (breadcrumbs) =>
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    ),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  updateMeta: (meta) => dispatch(updateMeta(meta)),
  getMember: (id) => ClubApparelDispatcher.getMember(dispatch, id),
  sendVerificationCode: (phone) =>
    CheckoutDispatcher.sendVerificationCode(dispatch, phone),
  verifyUserPhone: (code) => CheckoutDispatcher.verifyUserPhone(dispatch, code),
  updateCustomer: (customer) =>
    MyAccountDispatcher.updateCustomerData(dispatch, customer),
  requestCustomerData: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.requestCustomerData(dispatch)
    ),
  setCheckoutDetails: (checkoutDetails) =>
    CartDispatcher.setCheckoutStep(dispatch, checkoutDetails),
});

export class CheckoutSuccessContainer extends PureComponent {
  static propTypes = {
    orderID: PropTypes.number.isRequired,
    incrementID: PropTypes.number.isRequired,
    updateBreadcrumbs: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    showOverlay: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    updateMeta: PropTypes.func.isRequired,
    shippingAddress: PropTypes.object.isRequired,
    totals: TotalsType.isRequired,
    tabMap: PropTypes.isRequired,
    customer: customerType,
    getMember: PropTypes.func.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    requestCustomerData: PropTypes.func.isRequired,
  };

  static defaultProps = {
    customer: null,
  };

  state = {
    isEditing: false,
    clubApparelMember: null,
    phone: null,
    isPhoneVerified: false,
    isChangePhonePopupOpen: false,
    isMobileVerification: false,
  };

  containerFunctions = {
    onSignIn: this.onSignIn.bind(this),
    changeActiveTab: this.changeActiveTab.bind(this),
    onVerifySuccess: this.onVerifySuccess.bind(this),
    onResendCode: this.onResendCode.bind(this),
    changePhone: this.changePhone.bind(this),
    toggleChangePhonePopup: this.toggleChangePhonePopup.bind(this),
  };

  constructor(props) {
    super(props);

    const { updateMeta, totals } = this.props;

    this.state = {
      initialTotals: totals,
      isEditing: false,
      clubApparelMember: null,
      phone: null,
      isPhoneVerified: false,
      isChangePhonePopupOpen: false,
      isMobileVerification: false,
      ...MyAccountContainer.navigateToSelectedTab(this.props),
    };

    /*
        if (!isSignedIn) {
            toggleOverlayByKey(CUSTOMER_ACCOUNT);
        }
        */

    updateMeta({ title: __("My account") });

    this.onSignIn();
  }

  static getDerivedStateFromProps(props, state) {
    return MyAccountContainer.navigateToSelectedTab(props, state);
  }

  componentDidMount() {
    const {
      updateMeta,
      customer: { phone },
      customer,
      shippingAddress: { phone: guestPhone },
      isSignedIn,
      totals,
      setCheckoutDetails,
      orderID,
    } = this.props;
    setCheckoutDetails(true);

    var data = localStorage.getItem("customer");
    let userData = JSON.parse(data);
    let userToken;
    if (userData?.data?.id) {
      userToken = userData.data.id;
    }
    const customerData = BrowserDatabase.getItem("customer");
    const userID = customerData && customerData.id ? customerData.id : null;
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    totals?.items?.map((item) => {
      var queryID = item?.full_item_info?.search_query_id
        ? item?.full_item_info?.search_query_id
        : null;
      if (queryID) {
        new Algolia().logAlgoliaAnalytics(
          "conversion",
          ADD_TO_CART_ALGOLIA,
          [],
          {
            objectIDs: [item?.full_item_info?.parent_id.toString()],
            queryID: queryID,
            userToken: userToken ? `user-${userToken}` : getUUIDToken(),
          }
        );
      }
      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_BUY,
        params: {
          event: VUE_BUY,
          order_id: orderID,
          pageType: "checkout_payment",
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          sourceProdID: item?.full_item_info?.config_sku,
          sourceCatgID: item?.full_item_info?.category,
          prodQty: item?.full_item_info?.qty,
          prodPrice: item?.full_item_info?.price,
          uuid: getUUID(),
          referrer: window.location.href,
          url: window.location.href,
          userID: userID,
        },
      });
    });

    if (isSignedIn) {
      this.setPhone(phone);
    } else {
      this.setPhone(guestPhone);
    }

    const testCustomerVerified = "0";

    if (
      !(isSignedIn && customer.isVerified === testCustomerVerified) &&
      isMobile.any()
    ) {
      this.setState({ isMobileVerification: true });
    }
  }

  containerProps = () => {
    const {
      clubApparelMember,
      isPhoneVerified,
      isChangePhonePopupOpen,
      phone,
      isMobileVerification,
    } = this.state;
    const { isFailed } = this.props;
    return {
      clubApparelMember,
      isPhoneVerified,
      isChangePhonePopupOpen,
      phone,
      isFailed,
      isMobileVerification,
    };
  };

  toggleChangePhonePopup() {
    const { isChangePhonePopupOpen } = this.state;
    this.setState({ isChangePhonePopupOpen: !isChangePhonePopupOpen });
  }

  changePhone(fields) {
    const {
      isSignedIn,
      updateCustomer,
      customer: oldCustomerData,
    } = this.props;
    const { newPhone, countryPhoneCode } = fields;

    if (isSignedIn) {
      updateCustomer({
        ...oldCustomerData,
        phone: countryPhoneCode + newPhone,
      }).then((response) => {
        if (!response.error) {
          this.onResendCode();
          this.toggleChangePhonePopup();
          this.setPhone(newPhone, countryPhoneCode);
        } else {
          showNotification("error", __("Please enter valid phone number"));
        }
      }, this._handleError);
    } else {
      this.setPhone(newPhone, countryPhoneCode);
      this.onResendCode();
      this.toggleChangePhonePopup();
    }
  }

  setPhone(phone, phonecode = "") {
    this.setState({ phone: phonecode + phone });
  }

  onVerifySuccess(fields) {
    const { verifyUserPhone, isSignedIn, orderID, showNotification } =
      this.props;

    const { phone } = this.state;
    if (phone) {
      const countryCodeLastChar = 4;
      const countryCode = phone.slice(1, countryCodeLastChar);
      const mobile = phone.slice(countryCodeLastChar);
      const { otp } = fields;
      if (isSignedIn) {
        verifyUserPhone({ mobile, country_code: countryCode, otp }).then(
          (response) => {
            if (response.success) {
              this.setState({ isPhoneVerified: true });
              showNotification(
                "success",
                __("Phone was successfully verified")
              );
              this.setState({ isMobileVerification: false });
            } else {
              showNotification(
                "error",
                __("Wrong Verification Code. Please re-enter")
              );
            }
          },
          this._handleError
        );
      } else {
        verifyUserPhone({
          mobile,
          country_code: countryCode,
          otp,
          order_id: orderID,
        }).then((response) => {
          if (response.success) {
            this.setState({ isPhoneVerified: true });
            this.setState({ isMobileVerification: false });
          } else {
            showNotification(
              "error",
              __("Verification failed. Please enter valid verification code")
            );
          }
        }, this._handleError);
      }
    }
  }

  onResendCode() {
    const { sendVerificationCode, showNotification } = this.props;
    const { phone = "" } = this.state;
    const countryCodeLastChar = 4;
    const countryCode = phone.slice(1, countryCodeLastChar);
    const mobile = phone.slice(countryCodeLastChar);
    sendVerificationCode({ mobile, countryCode }).then((response) => {
      if (!response.error) {
        showNotification(
          "success",
          __("Verification code was successfully re-sent")
        );
      } else {
        if (response.data) {
          // eslint-disable-next-line max-len
          showNotification(
            "info",
            __(
              "Please wait %s before re-sending the request",
              response.data.timeout
            )
          );
        }
        showNotification("error", response.error);
      }
    }, this._handleError);
  }

  changeActiveTab(activeTab) {
    const {
      [activeTab]: { url },
    } = tabMap;
    history.push(`${MY_ACCOUNT_URL}${url}`);
  }

  _updateBreadcrumbs() {
    const { updateBreadcrumbs } = this.props;

    updateBreadcrumbs([
      { url: "", name: __("Account") },
      { name: __("Home"), url: "/" },
    ]);
  }

  onSignIn() {
    const { changeHeaderState, history } = this.props;

    changeHeaderState({
      title: "My account",
      name: CUSTOMER_ACCOUNT_PAGE,
      onBackClick: () => history.push("/"),
    });
  }

  render() {
    return (
      <CheckoutSuccess
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
        {...this.containerProps()}
        tabMap={tabMap}
      />
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutSuccessContainer);
