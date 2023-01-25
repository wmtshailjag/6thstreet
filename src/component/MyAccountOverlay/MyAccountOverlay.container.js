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
import { CART_ID_CACHE_KEY } from "Store/MyAccount/MyAccount.dispatcher";

import {
  CUSTOMER_ACCOUNT,
  CUSTOMER_SUB_ACCOUNT,
} from "Component/Header/Header.config";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import {
  changeNavigationState,
  goToPreviousNavigationState,
} from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { showNotification } from "Store/Notification/Notification.action";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import BrowserDatabase from "Util/BrowserDatabase";
import history from "Util/History";
import isMobile from "Util/Mobile";
import MyAccountOverlay from "./MyAccountOverlay.component";
import browserHistory from "Util/History";
import { sendOTP } from "Util/API/endpoint/MyAccount/MyAccount.enpoint";
import {
  CUSTOMER_ACCOUNT_OVERLAY_KEY,
  STATE_CONFIRM_EMAIL,
  STATE_CREATE_ACCOUNT,
  STATE_FORGOT_PASSWORD,
  STATE_FORGOT_PASSWORD_SUCCESS,
  STATE_LOGGED_IN,
  STATE_SIGN_IN,
  STATE_VERIFY_NUMBER,
  STATE_INITIAL_LINKS,
} from "./MyAccountOverlay.config";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import Event, {
  EVENT_LOGIN,
  EVENT_LOGIN_FAILED,
  EVENT_MOE_REGISTER,
  EVENT_GTM_AUTHENTICATION,
  EVENT_SIGN_UP_FAIL,
  EVENT_SIGN_UP,
  EVENT_OTP_VERIFICATION_SUCCESSFUL,
  EVENT_OTP_VERIFICATION_FAILED,
  EVENT_PASSWORD_RESET_LINK_SENT,
  EVENT_LOGIN_TAB_CLICK,
  EVENT_LOGIN_DETAILS_ENTERED,
  EVENT_FORGOT_PASSWORD_CLICK,
  EVENT_REGISTER_TAB_CLICK,
  EVENT_REGISTERATION_DETAILS_ENTERED,
  EVENT_RESEND_VERIFICATION_CODE,
} from "Util/Event";

export const MyAccountDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/MyAccount/MyAccount.dispatcher"
);

export const mapStateToProps = (state) => ({
  isSignedIn: state.MyAccountReducer.isSignedIn,
  customer: state.MyAccountReducer.customer,
  isPasswordForgotSend: state.MyAccountReducer.isPasswordForgotSend,
  isOverlayVisible: state.OverlayReducer.activeOverlay === CUSTOMER_ACCOUNT,
  language: state.AppState.language,
});

export const mapDispatchToProps = (dispatch) => ({
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
  forgotPassword: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.forgotPassword(dispatch, options)
    ),
  createAccountNew: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.createAccountNew(options, dispatch)
    ),
  loginAccount: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.loginAccount(options, dispatch)
    ),
  signIn: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.signIn(options, dispatch)
    ),
  signInOTP: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.signInOTP(options, dispatch)
    ),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  setHeaderState: (headerState) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, headerState)),
  goToPreviousHeaderState: () =>
    dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
  showError: (message) => dispatch(showNotification("error", message)),
});

export class MyAccountOverlayContainer extends PureComponent {
  static propTypes = {
    forgotPassword: PropTypes.func.isRequired,
    signIn: PropTypes.func.isRequired,
    signInOTP: PropTypes.func.isRequired,
    isPasswordForgotSend: PropTypes.bool.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    showNotification: PropTypes.func.isRequired,
    createAccountNew: PropTypes.func.isRequired,
    isPopup: PropTypes.bool.isRequired,
    showOverlay: PropTypes.func.isRequired,
    setHeaderState: PropTypes.func.isRequired,
    onSignIn: PropTypes.func,
    goToPreviousHeaderState: PropTypes.func,
    isCheckout: PropTypes.bool,
    hideActiveOverlay: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
    closePopup: PropTypes.func,
  };

  static defaultProps = {
    isCheckout: false,
    onSignIn: () => {},
    goToPreviousHeaderState: () => {},
    closePopup: () => {},
  };

  containerFunctions = {
    onSignInSuccess: this.onSignInSuccess.bind(this),
    onSignInAttempt: this.onSignInAttempt.bind(this),
    onSignInOption: this.onSignInOption.bind(this),
    onCreateAccountAttempt: this.onCreateAccountAttempt.bind(this),
    OTPFieldChange: this.OTPFieldChange.bind(this),
    resendOTP: this.resendOTP.bind(this),
    onCreateAccountSuccess: this.onCreateAccountSuccess.bind(this),
    onForgotPasswordSuccess: this.onForgotPasswordSuccess.bind(this),
    onForgotPasswordAttempt: this.onForgotPasswordAttempt.bind(this),
    onFormError: this.onFormError.bind(this),
    handleForgotPassword: this.handleForgotPassword.bind(this),
    handleSignIn: this.handleSignIn.bind(this),
    handleCreateAccount: this.handleCreateAccount.bind(this),
    onCreateAccountClick: this.onCreateAccountClick.bind(this),
    onVisible: this.onVisible.bind(this),
    OtpErrorClear: this.OtpErrorClear.bind(this),
    sendGTMEvents: this.sendGTMEvents.bind(this),
  };

  constructor(props) {
    super(props);

    this.state = this.redirectOrGetState(props);
  }

  timer = null;

  static getDerivedStateFromProps(props, state) {
    const { isSignedIn, isPasswordForgotSend, showNotification, isPopup } =
      props;

    const {
      isPasswordForgotSend: currentIsPasswordForgotSend,
      state: myAccountState,
    } = state;

    const {
      location: { pathname, state: { isForgotPassword } = {} },
    } = history;

    const stateToBeUpdated = {};

    if (!isMobile.any()) {
      if (!isPopup && !isSignedIn) {
        if (pathname !== "/forgot-password" && !isForgotPassword) {
          stateToBeUpdated.state = STATE_SIGN_IN;
        }
      } else if (!isPopup && isSignedIn) {
        stateToBeUpdated.state = STATE_LOGGED_IN;
      }
    }

    if (myAccountState !== STATE_LOGGED_IN && isSignedIn) {
      stateToBeUpdated.isLoading = false;
      showNotification("success", __("You are successfully logged in!"));
      stateToBeUpdated.state = STATE_LOGGED_IN;
    }

    if (myAccountState === STATE_LOGGED_IN && !isSignedIn) {
      stateToBeUpdated.state = STATE_SIGN_IN;
      showNotification("success", __("You are successfully logged out!"));
    }

    if (isPasswordForgotSend !== currentIsPasswordForgotSend) {
      stateToBeUpdated.isLoading = false;
      stateToBeUpdated.isPasswordForgotSend = isPasswordForgotSend;
      // eslint-disable-next-line max-len
      showNotification(
        "success",
        __(
          "If there is an account associated with the provided address you will receive an email with a link to reset your password."
        )
      );
      stateToBeUpdated.state = STATE_SIGN_IN;
    }

    return Object.keys(stateToBeUpdated).length ? stateToBeUpdated : null;
  }

  sendMOEEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }

  sendGTMEvents(event, message) {
    const { otpAttempt, customerLoginData, customerRegisterData } = this.state;
    const eventCategory = () => {
      if (
        event == EVENT_LOGIN ||
        event == EVENT_LOGIN_FAILED ||
        event == EVENT_LOGIN_TAB_CLICK ||
        event == EVENT_LOGIN_DETAILS_ENTERED ||
        event == EVENT_FORGOT_PASSWORD_CLICK ||
        event == EVENT_PASSWORD_RESET_LINK_SENT
      ) {
        return "user_login";
      } else if (
        event == EVENT_REGISTER_TAB_CLICK ||
        event == EVENT_REGISTERATION_DETAILS_ENTERED ||
        event == EVENT_SIGN_UP_FAIL ||
        event == EVENT_SIGN_UP
      ) {
        return "sign_up";
      } else if (
        event == EVENT_OTP_VERIFICATION_SUCCESSFUL ||
        event == EVENT_OTP_VERIFICATION_FAILED
      ) {
        if (Object.entries(customerRegisterData)?.length) {
          return "sign_up";
        } else if (Object.entries(customerLoginData)?.length) {
          return "user_login";
        } else {
          return event;
        }
      } else {
        return event;
      }
    };
    const EventDetails = {
      name: event,
      action: event,
      category:
        event == EVENT_RESEND_VERIFICATION_CODE ? message : eventCategory(),
      ...((event == EVENT_LOGIN_DETAILS_ENTERED || event == EVENT_LOGIN) && {
        loginMode: message,
      }),
      ...((event == EVENT_OTP_VERIFICATION_SUCCESSFUL ||
        event == EVENT_LOGIN) && {
        attemptNumber: otpAttempt,
      }),
      ...((event == EVENT_LOGIN_FAILED ||
        event == EVENT_SIGN_UP_FAIL ||
        event == EVENT_OTP_VERIFICATION_FAILED) && {
        failReason: message,
      }),
    };
    Event.dispatch(EVENT_GTM_AUTHENTICATION, EventDetails);
  }

  handleBackBtn = () => {
    const { closePopup, isVuePLP } = this.props;
    const getCurrentState = this.state.state;
    const { location } = browserHistory;
    if (isMobile.any() && !isVuePLP) {
      browserHistory.push(`${location.pathname}${location.search}`);
      window.onpopstate = () => {
        if (getCurrentState == "initialLinks") {
          closePopup();
        } else if (getCurrentState == "createAccount" || "signIn") {
          this.setState({ state: "initialLinks" });
        } else {
          return;
        }
      };
    }
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isSignedIn: prevIsSignedIn } = prevProps;
    const { state: oldMyAccountState } = prevState;
    const { state: newMyAccountState } = this.state;
    const {
      isSignedIn,
      hideActiveOverlay,
      isCheckout,
      goToPreviousHeaderState,
    } = this.props;

    if (oldMyAccountState === newMyAccountState) {
      return;
    }

    if (isSignedIn !== prevIsSignedIn) {
      hideActiveOverlay();
      if (isCheckout) {
        goToPreviousHeaderState();
      }
    }
  }
  redirectOrGetState = (props) => {
    const { showOverlay, setHeaderState, isPasswordForgotSend } = props;

    const {
      location: { pathname, state: { isForgotPassword } = {} },
    } = history;

    const getDeviceState = !isMobile.any()
      ? STATE_SIGN_IN
      : STATE_INITIAL_LINKS;
    const state = {
      state: getDeviceState,
      // eslint-disable-next-line react/no-unused-state
      isPasswordForgotSend,
      isLoading: false,
      customerRegisterData: {},
      customerLoginData: {},
      otpError: "",
      otpAttempt: 1,
    };

    // if customer got here from forgot-password
    if (pathname !== "/forgot-password" && !isForgotPassword) {
      return state;
    }

    state.state = STATE_FORGOT_PASSWORD;

    setHeaderState({
      name: CUSTOMER_SUB_ACCOUNT,
      title: "Forgot password",
      onBackClick: (e) => {
        history.push({ pathname: "/my-account" });
        this.handleSignIn(e);
      },
    });

    if (isMobile.any()) {
      history.push({
        pathname: "/my-account",
        state: { isForgotPassword: true },
      });
      return state;
    }

    showOverlay(CUSTOMER_ACCOUNT_OVERLAY_KEY);

    return state;
  };

  addMOEDetails() {
    this.timer = setTimeout(() => {
      if (BrowserDatabase.getItem("customer")) {
        const customerDetail = BrowserDatabase.getItem("customer");
        if (customerDetail.email && customerDetail.email.length) {
          Moengage.add_email(customerDetail.email);
        }
        if (customerDetail.firstname && customerDetail.firstname.length) {
          Moengage.add_first_name(customerDetail.firstname);
        }
        if (customerDetail.lastname && customerDetail.lastname.length) {
          Moengage.add_last_name(customerDetail.lastname);
        }
        if (customerDetail.phone && customerDetail.phone.length) {
          Moengage.add_mobile(customerDetail.phone);
        }
      }
    }, 5000);
  }
  async onSignInSuccess(fields) {
    const { signIn, showNotification, onSignIn } = this.props;
    const { otpAttempt } = this.state;
    try {
      await signIn(fields);
      onSignIn();
      if (fields?.email) {
        Moengage.add_unique_user_id(fields?.email);
      }
      this.checkForOrder();
      this.sendMOEEvents(EVENT_LOGIN);
      this.sendGTMEvents(EVENT_LOGIN, "Email");
      this.addMOEDetails();
    } catch (e) {
      this.setState({ isLoading: false, otpAttempt: otpAttempt + 1 });
      showNotification("error", e.message);
      this.sendMOEEvents(EVENT_LOGIN_FAILED);
      this.sendGTMEvents(EVENT_LOGIN_FAILED, e.message);
    }
  }

  checkForOrder() {
    const orderId = BrowserDatabase.getItem("ORDER_ID") || null;

    if (orderId) {
      localStorage.removeItem("ORDER_ID");
      history.push(`/my-account/my-orders/${orderId}`);
    }
  }

  onVisible() {
    const { setHeaderState, isCheckout } = this.props;

    if (isMobile.any() && !isCheckout) {
      setHeaderState({ name: CUSTOMER_ACCOUNT, title: __("Sign in") });
    }
  }

  onSignInOption(isOTP, fields, countryCode) {
    if (!isOTP) {
      return this.onSignInSuccess(fields);
    }
    this.sendOTP(countryCode, fields);
  }

  async sendOTP(countryCode, fields) {
    const { email } = fields;
    const phoneNumber = `${countryCode}${email}`;
    const { showError } = this.props;
    const { otpAttempt } = this.state;
    try {
      const { success, error } = await sendOTP({
        phone: phoneNumber,
        flag: "login",
      });
      if (success) {
        this.setState({
          customerLoginData: { username: phoneNumber },
          state: STATE_VERIFY_NUMBER,
        });
      } else {
        this.setState({ otpAttempt: otpAttempt + 1 });
        if (STATE_SIGN_IN) {
          this.sendGTMEvents(EVENT_LOGIN_FAILED, error);
          this.sendMOEEvents(EVENT_LOGIN_FAILED);
        }
        showError(error);
      }
      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false, otpAttempt: otpAttempt + 1 });
      console.error("error while sending OTP", error);
    }
  }

  onSignInAttempt() {
    this.setState({ isLoading: true, otpError: "" });
  }

  async OTPFieldChange(field) {
    this.setState({ otpError: "" });
    const inputValue = field.target.value;
    try {
      const { createAccountNew, loginAccount } = this.props;
      const { customerLoginData, customerRegisterData, otpAttempt } =
        this.state;
      if (
        inputValue?.length === 5 &&
        (Object.entries(customerRegisterData)?.length ||
          Object.entries(customerLoginData)?.length)
      ) {
        this.setState({ isLoading: true });
        let response;
        let payload;
        if (Object.entries(customerRegisterData)?.length) {
          payload = { ...customerRegisterData, otp: inputValue };
          response = await createAccountNew(payload);
        } else {
          payload = {
            ...customerLoginData,
            password: inputValue,
            is_phone: true,
            cart_id: BrowserDatabase.getItem(CART_ID_CACHE_KEY),
          };
          response = await loginAccount(payload);
        }
        const { success, data } = response;
        if (success) {
          const { signInOTP, showNotification } = this.props;
          if (Object.entries(customerLoginData)?.length) {
            this.sendGTMEvents(EVENT_OTP_VERIFICATION_SUCCESSFUL);
            this.sendMOEEvents(EVENT_OTP_VERIFICATION_SUCCESSFUL);
            this.sendMOEEvents(EVENT_LOGIN);
            this.sendGTMEvents(EVENT_LOGIN, "Mobile");
          }
          if (Object.entries(customerRegisterData)?.length) {
            this.sendGTMEvents(EVENT_OTP_VERIFICATION_SUCCESSFUL);
            this.sendMOEEvents(EVENT_OTP_VERIFICATION_SUCCESSFUL);
            this.sendMOEEvents(EVENT_MOE_REGISTER);
            this.sendGTMEvents(EVENT_SIGN_UP);
          }
          try {
            await signInOTP(response);
            if (data?.user?.email) {
              Moengage.add_unique_user_id(data?.user?.email);
            }
            this.checkForOrder();
            this.addMOEDetails();
          } catch (e) {
            this.setState({ isLoading: false });
            showNotification("error", e.message);
          }
          this.setState({
            isLoading: false,
            customerRegisterData: {},
            customerLoginData: {},
          });
        }
        if (typeof response === "string") {
          // showError(response);
          this.setState({
            otpError: response,
            otpAttempt: otpAttempt + 1,
          });
          this.sendGTMEvents(EVENT_OTP_VERIFICATION_FAILED, response);
        }
        this.setState({ isLoading: false });
      }
    } catch (err) {
      const { otpAttempt, customerRegisterData, customerLoginData } =
        this.state;
      this.setState({ isLoading: false, otpAttempt: otpAttempt + 1 });
      this.sendGTMEvents(EVENT_OTP_VERIFICATION_FAILED, err);
      if (Object.entries(customerRegisterData)?.length) {
        this.sendGTMEvents(EVENT_SIGN_UP_FAIL, err);
        this.sendMOEEvents(EVENT_SIGN_UP_FAIL);
      }
      if (Object.entries(customerLoginData)?.length) {
        this.sendGTMEvents(EVENT_LOGIN_FAILED, err);
        this.sendMOEEvents(EVENT_LOGIN_FAILED);
      }
      console.error("Error while creating customer", err);
    }
  }

  onCreateAccountAttempt(_, invalidFields) {
    this.setState({ isLoading: !invalidFields });
  }

  async resendOTP() {
    const { customerLoginData, customerRegisterData } = this.state;
    const { showNotification } = this.props;
    this.setState({ isLoading: true });
    try {
      if (Object.entries(customerRegisterData)?.length) {
        const { contact_no } = customerRegisterData;
        const { success, error } = await sendOTP({
          phone: contact_no,
          flag: "register",
        });
        if (success) {
          showNotification("success", __("OTP sent successfully"));
          this.sendGTMEvents(EVENT_RESEND_VERIFICATION_CODE, "sign_up");
          this.sendMOEEvents(EVENT_RESEND_VERIFICATION_CODE);
        } else if (error) {
          showNotification("error", error);
        }
      } else if (Object.entries(customerLoginData)?.length) {
        const { username } = customerLoginData;
        const { success, error } = await sendOTP({
          phone: username,
          flag: "login",
        });
        if (success) {
          showNotification("success", __("OTP sent successfully"));
          this.sendGTMEvents(EVENT_RESEND_VERIFICATION_CODE, "user_login");
          this.sendMOEEvents(EVENT_RESEND_VERIFICATION_CODE);
        } else if (error) {
          showNotification("error", error);
        }
      }
      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false });
      console.error("error while resend otp", error);
    }
  }

  async onCreateAccountSuccess(fields, countryCode) {
    const { showError } = this.props;
    const { otpAttempt } = this.state;
    const { password, email, fullname, gender, phone } = fields;
    const phoneNumber = `${countryCode}${phone}`;
    const customerData = {
      name: fullname,
      gender,
      email,
      password,
      contact_no: phoneNumber,
    };
    try {
      const { success, error } = await sendOTP({
        phone: phoneNumber,
        flag: "register",
      });
      if (success) {
        this.setState({
          customerRegisterData: customerData,
          state: STATE_VERIFY_NUMBER,
        });
      } else {
        this.setState({ otpAttempt: otpAttempt + 1 });
        this.sendGTMEvents(
          EVENT_SIGN_UP_FAIL,
          "Account with same phone number already exist"
        );
        this.sendMOEEvents(EVENT_SIGN_UP_FAIL);
        showError(error);
      }
      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false, otpAttempt: otpAttempt + 1 });
      this.sendGTMEvents(EVENT_SIGN_UP_FAIL, error);
      this.sendMOEEvents(EVENT_SIGN_UP_FAIL);
      console.error("error while sending OTP", error);
    }
  }

  onForgotPasswordSuccess(fields) {
    const { forgotPassword, showNotification } = this.props;

    forgotPassword(fields).then((res) => {
      if (typeof res === "string") {
        showNotification("error", __(res));
        this.stopLoading();
        return;
      }
      this.sendGTMEvents(EVENT_PASSWORD_RESET_LINK_SENT);
      this.sendMOEEvents(EVENT_PASSWORD_RESET_LINK_SENT);
      this.setState({ state: STATE_FORGOT_PASSWORD_SUCCESS });
      this.stopLoading();
    }, this.stopLoading);
  }

  onForgotPasswordAttempt() {
    this.setState({ isLoading: true });
  }

  onFormError() {
    this.setState({ isLoading: false });
  }

  stopLoading = () => this.setState({ isLoading: false });

  stopLoadingAndHideOverlay = () => {
    const { hideActiveOverlay } = this.props;
    this.stopLoading();
    hideActiveOverlay();
  };

  handleForgotPassword(e) {
    const { setHeaderState } = this.props;
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({ state: STATE_FORGOT_PASSWORD });

    setHeaderState({
      name: CUSTOMER_SUB_ACCOUNT,
      title: __("Forgot password"),
      onBackClick: () => this.handleSignIn(e),
    });
  }

  handleSignIn(e) {
    const { setHeaderState } = this.props;
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({ state: STATE_SIGN_IN });
    this.sendGTMEvents(EVENT_LOGIN_TAB_CLICK);
    this.sendMOEEvents(EVENT_LOGIN_TAB_CLICK);
    setHeaderState({
      name: CUSTOMER_ACCOUNT,
      title: __("Sign in"),
    });
  }

  handleCreateAccount(e) {
    const { setHeaderState } = this.props;
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.setState({ state: STATE_CREATE_ACCOUNT });
    this.sendGTMEvents(EVENT_REGISTER_TAB_CLICK);
    this.sendMOEEvents(EVENT_REGISTER_TAB_CLICK);
    setHeaderState({
      name: CUSTOMER_SUB_ACCOUNT,
      title: __("Create account"),
      onBackClick: () => this.handleSignIn(e),
    });
  }

  onCreateAccountClick() {
    const { setHeaderState } = this.props;
    this.setState({ state: STATE_CREATE_ACCOUNT });

    setHeaderState({
      name: CUSTOMER_SUB_ACCOUNT,
      title: __("Create account"),
    });
  }

  OtpErrorClear() {
    this.setState({ otpError: "" });
  }
  render() {
    this.handleBackBtn();
    const { state } = this.state;
    const { hideActiveOverlay } = this.props;
    if (state === "loggedIn") {
      hideActiveOverlay();

      return null;
    }

    return (
      <MyAccountOverlay
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAccountOverlayContainer);
