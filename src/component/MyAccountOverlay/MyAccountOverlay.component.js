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

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import CountrySwitcher from "Component/CountrySwitcher";
import LanguageSwitcher from "Component/LanguageSwitcher";
import Field from "SourceComponent/Field";
import Form from "SourceComponent/Form";
import Loader from "SourceComponent/Loader";
import Overlay from "SourceComponent/Overlay";
import PhoneCountryCodeField from "Component/PhoneCountryCodeField";
import { PHONE_CODES } from "Component/MyAccountAddressFieldForm/MyAccountAddressFieldForm.config";
import { COUNTRY_CODES_FOR_PHONE_VALIDATION } from "Component/MyAccountAddressForm/MyAccountAddressForm.config";
import { Close } from "Component/Icons";
import { ChevronLeft } from "Component/Icons";
import { ThreeDots, Oval } from "react-loader-spinner";

import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import Link from "Component/Link";
import {
  deleteAuthorizationToken,
  deleteMobileAuthorizationToken,
} from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import Image from "Component/Image";
import { CART_ID_CACHE_KEY } from "Store/MyAccount/MyAccount.dispatcher";
import {
  CUSTOMER_ACCOUNT_OVERLAY_KEY,
  STATE_CONFIRM_EMAIL,
  STATE_CREATE_ACCOUNT,
  STATE_FORGOT_PASSWORD,
  STATE_FORGOT_PASSWORD_SUCCESS,
  STATE_LOGGED_IN,
  STATE_SIGN_IN,
  ENABLE_OTP_LOGIN,
  STATE_INITIAL_LINKS,
  SSO_LOGIN_PROVIDERS,
  STATE_VERIFY_NUMBER,
} from "./MyAccountOverlay.config";
import {
  EVENT_FORGOT_PASSWORD_CLICK,
  EVENT_LOGIN_DETAILS_ENTERED,
  EVENT_REGISTERATION_DETAILS_ENTERED,
} from "Util/Event";
import "./MyAccountOverlay.style";

export class MyAccountOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.authRef = React.createRef();
  }
  static propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    isOverlayVisible: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    state: PropTypes.oneOf([
      STATE_SIGN_IN,
      STATE_INITIAL_LINKS,
      STATE_FORGOT_PASSWORD,
      STATE_FORGOT_PASSWORD_SUCCESS,
      STATE_CREATE_ACCOUNT,
      STATE_LOGGED_IN,
      STATE_CONFIRM_EMAIL,
      STATE_VERIFY_NUMBER,
    ]).isRequired,
    onVisible: PropTypes.func.isRequired,
    onSignInSuccess: PropTypes.func.isRequired,
    onSignInAttempt: PropTypes.func.isRequired,
    onCreateAccountAttempt: PropTypes.func.isRequired,
    onCreateAccountSuccess: PropTypes.func.isRequired,
    onForgotPasswordSuccess: PropTypes.func.isRequired,
    onForgotPasswordAttempt: PropTypes.func.isRequired,
    onFormError: PropTypes.func.isRequired,
    handleForgotPassword: PropTypes.func.isRequired,
    handleSignIn: PropTypes.func.isRequired,
    handleCreateAccount: PropTypes.func.isRequired,
    onCreateAccountClick: PropTypes.func.isRequired,
    setRegisterFieldFalse: PropTypes.func,
    isCheckout: PropTypes.bool,
    registerField: PropTypes.bool,
    closePopup: PropTypes.func.isRequired,
    isHidden: PropTypes.bool,
    email: PropTypes.string,
  };

  static defaultProps = {
    isCheckout: false,
    registerField: false,
    setRegisterFieldFalse: null,
    isHidden: false,
    email: "",
  };

  state = {
    isPopup: false,
    gender: 3,
    isChecked: false,
    isArabic: isArabic(),
    isSignInValidated: false,
    isCreateValidated: false,
    isForgotValidated: false,
    isOTP: ENABLE_OTP_LOGIN,
    countryCode: PHONE_CODES[getCountryFromUrl()],
    eventSent: false,
    otpAttempt: 1,
    registerDetailsEntered: false,
  };

  componentDidMount() {
    // gapi.load("auth2", () => {
    //   this.authRef.current = gapi.auth2.init();
    //   this.attachSigninFunction(document.getElementById("g-signin2"));
    // });
  }
  // attachSigninFunction = (element) => {
  //   this.authRef.current.attachClickHandler(
  //     element,
  //     {},
  //     async (googleUser) => {
  //       const { onSignInSuccess, onSignInAttempt } = this.props;
  //       const profile = googleUser?.getBasicProfile();
  //       const social_token = googleUser?.getAuthResponse()?.id_token;
  //       const fullName = profile?.getName()?.split(" ");
  //       const email = profile?.getEmail();
  //       const payload = {
  //         social_token,
  //         firstname: fullName[0],
  //         lastname: fullName[1],
  //         email,
  //         customer_telephone: null,
  //         type: "google",
  //         cart_id: BrowserDatabase.getItem(CART_ID_CACHE_KEY),
  //       };
  //       try {
  //         onSignInAttempt();
  //         onSignInSuccess(payload);
  //       } catch (e) {
  //         console.log("error", e);
  //         deleteAuthorizationToken();
  //         deleteMobileAuthorizationToken();
  //       }
  //     },
  //     function (error) {
  //       console.log(JSON.stringify(error, undefined, 2));
  //     }
  //   );
  // };

  componentDidUpdate() {
    this.validateAndSendEvent();
  }
  renderMap = {
    [STATE_INITIAL_LINKS]: {
      render: () => this.renderInitialLinks(),
    },
    [STATE_SIGN_IN]: {
      render: () => this.renderSignIn(),
      title: __("Welcome Back"),
    },
    [STATE_VERIFY_NUMBER]: {
      render: () => this.renderVerifyNumber(),
    },
    [STATE_FORGOT_PASSWORD]: {
      render: () => this.renderForgotPassword(),
      title: __("FORGOT PASSWORD"),
    },
    [STATE_FORGOT_PASSWORD_SUCCESS]: {
      render: () => this.renderForgotPasswordSuccess(),
    },
    [STATE_CREATE_ACCOUNT]: {
      render: () => this.renderCreateAccount(),
    },
    [STATE_LOGGED_IN]: {
      render: () => {},
    },
    [STATE_CONFIRM_EMAIL]: {
      render: () => this.renderConfirmEmail(),
      title: __("Confirm the email"),
    },
  };

  validateAndSendEvent() {
    const { isCreateValidated, registerDetailsEntered } = this.state;
    const { sendGTMEvents } = this.props;
    if (isCreateValidated && !registerDetailsEntered) {
      sendGTMEvents(EVENT_REGISTERATION_DETAILS_ENTERED);
      this.sendMOEEvents(EVENT_REGISTERATION_DETAILS_ENTERED);
      this.setState({ registerDetailsEntered: true });
    }
  }
  sendMOEEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }

  renderMyAccount() {
    const {
      state,
      handleSignIn,
      handleCreateAccount,
      onCreateAccountClick,
      setRegisterFieldFalse,
      registerField,
    } = this.props;
    const { render, title } = this.renderMap[state];
    const isSignIn = state === STATE_SIGN_IN;
    const isCreateAccount = state === STATE_CREATE_ACCOUNT;
    if (registerField) {
      onCreateAccountClick();
      setRegisterFieldFalse();
    }

    // if (state === STATE_FORGOT_PASSWORD) {
    //     return (
    //         <div
    //             block="MyAccountOverlay"
    //             elem="Action"
    //             mods={ { state } }
    //         >
    //             <p block="MyAccountOverlay" elem="Heading">{ title }</p>
    //             { render() }
    //             { this.renderCloseBtn() }
    //         </div>
    //     );
    // }

    return (
      <div block="MyAccountOverlay" elem="Action" mods={{ state }}>
        <div
          block="MyAccountOverlay"
          elem="Image"
          src="https://static.6media.me/static/version1600859154/frontend/6SNEW/6snew/en_US/images/6street-login-banner.png"
          alt=""
        >
          {isArabic() ? (
            <>
              <span>
                6<sup>TH</sup>
              </span>
              <span>ستريت</span>
            </>
          ) : (
            <>
              <span>6</span>
              TH
              <span>S</span>
              TREET
            </>
          )}
        </div>
        {state !== STATE_VERIFY_NUMBER && (
          <div className="MyAccountOverlayOuter">
            <div className="signInQuote">
              <h5>
                {__("Sign in for a")} <span>{__("personalised")} </span>
                {__("shopping experience")}
              </h5>
            </div>

            <div block="MyAccountOverlay" elem="Buttons">
              <button
                block="signInBtn signBtns Button"
                mods={{ isSignIn }}
                onClick={handleSignIn}
              >
                {isMobile.any() ? __("Login") : __("Sign in")}
              </button>
              <button
                block="signUpBtn signBtns Button"
                mods={{ isCreateAccount }}
                onClick={handleCreateAccount}
              >
                {isMobile.any() ? __("Register") : __("Create account")}
              </button>
            </div>
          </div>
        )}
        <p block="MyAccountOverlay" elem="Heading">
          {title}
        </p>
        {render()}
        {/* {isSignIn
           ? this.renderSocials("SignIn")
           : isCreateAccount
           ? this.renderSocials("Create")
           : null} */}
        {this.renderCloseBtn()}
      </div>
    );
  }

  onCloseClick = () => {
    this.setState({ isPopup: true });
  };

  closePopup(e) {
    const { state, handleSignIn, closePopup } = this.props;
    if (state === STATE_FORGOT_PASSWORD) {
      handleSignIn(e);
    } else if (state === STATE_VERIFY_NUMBER) {
      this.setState({ isCreateValidated: false, isSignInValidated: false });
      handleSignIn(e);
    } else {
      closePopup();
    }
  }
  renderCloseBtn() {
    const { isArabic } = this.state;
    const { state } = this.props;

    return (
      <button
        block="MyAccountOverlay"
        elem="Close"
        mods={{ isArabic }}
        onClick={this.closePopup.bind(this)}
      >
        {state === STATE_VERIFY_NUMBER ? <ChevronLeft /> : <Close />}
      </button>
    );
  }

  renderConfirmEmail() {
    const { state, handleSignIn } = this.props;

    return (
      <article
        aria-labelledby="confirm-email-notice"
        block="MyAccountOverlay"
        elem="Additional"
        mods={{ state }}
      >
        <p id="confirm-email-notice">
          {/* eslint-disable-next-line max-len */}
          {__(
            "The email confirmation link has been sent to your email. Please confirm your account to proceed."
          )}
        </p>
        <button block="Button" onClick={handleSignIn}>
          {__("Got it")}
        </button>
      </article>
    );
  }

  onForgotChange = (invalidFields = []) => {
    this.setState({ isForgotValidated: invalidFields.length === 0 });
  };

  renderForgotPassword() {
    const {
      onForgotPasswordAttempt,
      onForgotPasswordSuccess,
      onFormError,
      isLoading,
    } = this.props;
    const { isForgotValidated } = this.state;
    this.setState({ isSignInValidated: false });
    return (
      <Form
        key="forgot-password"
        onSubmit={onForgotPasswordAttempt}
        onSubmitSuccess={onForgotPasswordSuccess}
        onSubmitError={onFormError}
        parentCallback={this.onForgotChange}
        isValidateOnChange
      >
        <Image
          lazyLoad={true}
          mix={{
            block: "MyAccountOverlay",
            elem: "LockImg",
          }}
          src="https://static.6media.me/static/version1600859154/frontend/6SNEW/6snew/en_US/images/forgot_pass.png"
          alt="forgot_password"
        />

        <p block="MyAccountOverlay" elem="Heading">
          {__("Forgot your Password?")}
        </p>
        <p block="MyAccountOverlay" elem="ForgotPasswordSubheading">
          {__(
            "Please enter your email and we will send you a link to reset your password"
          )}
        </p>
        <Field
          type="email"
          id="email"
          name="email"
          placeholder={`${__("EMAIL")}*`}
          autocomplete="email"
          validation={["notEmpty", "email"]}
        />
        <div
          block="MyAccountOverlay"
          elem="Button"
          mods={{ isMargin: true, isForgotValidated }}
        >
          <button
            block="Button"
            type="submit"
            disabled={!isForgotValidated || isLoading}
            mix={{
              block: "MyAccountOverlay",
              elem: isLoading ? "LoadingButton" : "",
            }}
          >
            {!isLoading ? (
              __("RESET YOUR PASSWORD")
            ) : (
              <ThreeDots color="white" height={6} width={"100%"} />
            )}
          </button>
        </div>
      </Form>
    );
  }

  renderVerifyNumber() {
    const {
      customerRegisterData,
      OTPFieldChange,
      resendOTP,
      customerLoginData,
      isLoading,
      otpError,
    } = this.props;
    const { isArabic } = this.state;
    const isNumber = (evt) => {
      const invalidChars = ["-", "+", "e", "E", "."];
      const abc = evt.target.value;
      if (invalidChars.includes(evt.key)) {
        evt.preventDefault();
        return false;
      }
      if (abc.length > 4) {
        return evt.preventDefault();
      }
    };
    return (
      <div mix={{ block: "VerifyPhone", mods: { isArabic } }}>
        <div block="VerifyPhone" elem="Text">
          <div block="VerifyPhone-Text" elem="Title">
            {__("Please Verify your Number")}
          </div>
          <div block="VerifyPhone-Text" elem="Message">
            {__("Verification code has been sent to")}
          </div>
          <div block="VerifyPhone-Text" elem="Phone">
            <button onClick={() => console.log("change mobile number")}>
              {`${
                customerRegisterData?.contact_no || customerLoginData?.username
              }`}
            </button>
          </div>
        </div>
        {/* <Form onSubmitSuccess={(e) => console.log("hello")}> */}
        <div block="VerifyPhone" elem="Code" mods={{ isArabic }}>
          <input
            type="number"
            placeholder="&#9679; &nbsp; &#9679; &nbsp; &#9679; &nbsp; &#9679; &nbsp; &#9679;"
            name="otp"
            disabled={isLoading}
            id="otp"
            onChange={OTPFieldChange}
            onKeyPress={(e) => isNumber(e)}
          />
        </div>
        {/* </Form> */}
        <div
          block="VerifyPhone"
          elem="ErrMessage"
          mods={{ isValidated: otpError.length !== 0 }}
        >
          {__(otpError)}
        </div>
        <div
          block="VerifyPhone"
          elem="OtpLoader"
          mods={{ isSubmitted: isLoading }}
        >
          <Oval
            color="#333"
            secondaryColor="#333"
            height={38}
            width={"100%"}
            strokeWidth={3}
            strokeWidthSecondary={3}
          />
        </div>
        <div
          block="VerifyPhone"
          elem="ResendCode"
          mods={{ isVerifying: !isLoading }}
        >
          <button onClick={resendOTP}>{__("Resend Verification Code")}</button>
        </div>
      </div>
    );
  }

  renderForgotPasswordSuccess() {
    const { state, handleSignIn } = this.props;
    this.setState({ isForgotValidated: false });
    return (
      <article
        aria-labelledby="forgot-password-success"
        block="MyAccountOverlay"
        elem="Additional"
        mods={{ state }}
      >
        <p id="forgot-password-success">
          {/* eslint-disable-next-line max-len */}
          {__(
            "If there is an account associated with the provided address you will receive an email with a link to reset your password"
          )}
        </p>
        <button block="Button" onClick={handleSignIn}>
          {__("Got it")}
        </button>
      </article>
    );
  }

  handleGenderChange = (e) => {
    this.setState({ gender: e.target.id });
  };

  handleCheckboxChange = () => {
    this.setState(({ isChecked }) => ({ isChecked: !isChecked }));
  };

  onCreateChange = (invalidFields = []) => {
    this.setState({ isCreateValidated: invalidFields.length === 0 });
  };

  renderCreateAccount() {
    const {
      onCreateAccountAttempt,
      onCreateAccountSuccess,
      isLoading,
      OtpErrorClear,
    } = this.props;

    const { gender, isChecked, isArabic, isCreateValidated, countryCode } =
      this.state;
    this.setState({ isSignInValidated: false });
    OtpErrorClear();
    const countryLabel = getCountryFromUrl();
    return (
      <Form
        key="create-account"
        onSubmit={onCreateAccountAttempt}
        onSubmitSuccess={(fields) =>
          onCreateAccountSuccess(fields, countryCode)
        }
        onSubmitError={onCreateAccountAttempt}
        isValidateOnChange
        parentCallback={this.onCreateChange}
      >
        <fieldset block="MyAccountOverlay" elem="PhoneNumber">
          <div block="UserIdentifierFieldsContainerCreate">
            <PhoneCountryCodeField
              label={countryLabel}
              onSelect={(value) =>
                this.setState({
                  countryCode: value,
                })
              }
            />
            <Field
              type="phone"
              placeholder={__("PHONE NUMBER*")}
              id="phone"
              name="phone"
              autocomplete="phone"
              maxLength={this.getUserIdentifierCreateMaxLength()}
              validation={[
                "notEmpty",
                this.getValidationForUserIdentifierCreate(),
              ]}
            />
          </div>
        </fieldset>
        <fieldset block="MyAccountOverlay" elem="FullName">
          <Field
            type="text"
            placeholder={`${__("TYPE YOUR FULL NAME")}*`}
            id="fullname"
            name="fullname"
            autocomplete="fullname"
            validation={["notEmpty"]}
          />
        </fieldset>
        <fieldset block="MyAccountOverlay" elem="Gender">
          <div block="MyAccountOverlay" elem="Radio" mods={{ isArabic }}>
            <Field
              type="radio"
              id="1"
              label={__("Male")}
              name="gender"
              value={gender}
              onClick={this.handleGenderChange}
              defaultChecked={gender}
            />
            <Field
              type="radio"
              id="2"
              label={__("Female")}
              name="gender"
              value={gender}
              onClick={this.handleGenderChange}
              defaultChecked={gender}
            />
            <Field
              type="radio"
              id="3"
              label={__("Prefer not to say")}
              name="gender"
              value={gender}
              onClick={this.handleGenderChange}
              defaultChecked={gender}
            />
          </div>
        </fieldset>
        <fieldset block="MyAccountOverlay" elem="Legend">
          <Field
            type="text"
            placeholder={`${__("EMAIL")}*`}
            id="email"
            name="email"
            autocomplete="email"
            validation={["notEmpty", "email"]}
          />
          <Field
            type="password"
            placeholder={`${__("PASSWORD")}*`}
            id="password"
            name="password"
            autocomplete="new-password"
            validation={[
              "notEmpty",
              "password",
              "containNumber",
              "containCapitalize",
            ]}
          />
        </fieldset>
        <div
          block="MyAccountOverlay"
          elem="Button"
          mods={{ isCreateAccountButton: true, isCreateValidated }}
        >
          <button
            block="Button"
            type="submit"
            disabled={!isCreateValidated || isLoading}
            mix={{
              block: "MyAccountOverlay",
              elem: isLoading ? "LoadingButton" : "",
            }}
          >
            {!isLoading ? (
              __("Create Account")
            ) : (
              <ThreeDots color="white" height={6} width={"100%"} />
            )}
          </button>
        </div>
      </Form>
    );
  }

  onSignInChange = (invalidFields = []) => {
    this.setState({ isSignInValidated: invalidFields.length === 0 });
  };

  setUserIdentifierType(value) {
    if (!ENABLE_OTP_LOGIN) {
      return;
    }

    const regex = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;

    if (!!!value.length) {
      this.setState({
        isOTP: true,
      });
      return;
    }

    if (regex.test(value)) {
      this.setState({
        isOTP: false,
      });
    } else {
      this.setState({
        isOTP: true,
      });
    }
  }

  getValidationForUserIdentifierCreate() {
    const { countryCode } = this.state;
    const customerCountry = Object.keys(PHONE_CODES).find(
      (key) => PHONE_CODES[key] === countryCode
    );

    return COUNTRY_CODES_FOR_PHONE_VALIDATION[customerCountry]
      ? "telephoneAE"
      : "telephone";
  }

  getValidationForUserIdentifier() {
    const { isOTP, eventSent, isSignInValidated } = this.state;
    const { sendGTMEvents } = this.props;
    if (!ENABLE_OTP_LOGIN || !isOTP) {
      if (!eventSent && isSignInValidated) {
        sendGTMEvents(EVENT_LOGIN_DETAILS_ENTERED, "Email");
        this.sendMOEEvents(EVENT_LOGIN_DETAILS_ENTERED);
        this.setState({ eventSent: true });
      }
      return "email";
    }

    const { countryCode } = this.state;
    const customerCountry = Object.keys(PHONE_CODES).find(
      (key) => PHONE_CODES[key] === countryCode
    );
    if (!eventSent && isSignInValidated) {
      sendGTMEvents(EVENT_LOGIN_DETAILS_ENTERED, "Mobile");
      this.sendMOEEvents(EVENT_LOGIN_DETAILS_ENTERED);
      this.setState({ eventSent: true });
    }
    return COUNTRY_CODES_FOR_PHONE_VALIDATION[customerCountry]
      ? "telephoneAE"
      : "telephone";
  }

  getValidationForPassword() {
    const { isOTP } = this.state;
    if (!ENABLE_OTP_LOGIN || !isOTP) {
      return ["noempty", "password"];
    }

    return [];
  }

  getUserIdentifierMaxLength() {
    const { countryCode, isOTP } = this.state;
    if (!ENABLE_OTP_LOGIN || !isOTP) {
      return null;
    }
    const customerCountry = Object.keys(PHONE_CODES).find(
      (key) => PHONE_CODES[key] === countryCode
    );

    return COUNTRY_CODES_FOR_PHONE_VALIDATION[customerCountry] ? "9" : "8";
  }

  getUserIdentifierCreateMaxLength() {
    const { countryCode } = this.state;

    const customerCountry = Object.keys(PHONE_CODES).find(
      (key) => PHONE_CODES[key] === countryCode
    );
    return COUNTRY_CODES_FOR_PHONE_VALIDATION[customerCountry] ? "9" : "8";
  }

  // facebook login dialog
  // facebookLogin = () => {
  //   const { onSignInSuccess, onSignInAttempt } = this.props;
  //   window.FB.login(
  //     function (response) {
  //       if (response.authResponse) {
  //         const authToken = response.authResponse.accessToken;
  //         window.FB.api(
  //           "/me?fields=first_name,last_name,email",
  //           function (response) {
  //             const social_token = authToken;
  //             const payload = {
  //               social_token,
  //               firstname: response.first_name,
  //               lastname: response.last_name,
  //               email: response.email,
  //               customer_telephone: null,
  //               type: "facebook",
  //               cart_id: BrowserDatabase.getItem(CART_ID_CACHE_KEY),
  //             };
  //             try {
  //               onSignInAttempt();
  //               onSignInSuccess(payload);
  //             } catch (e) {
  //               console.log("error", e);
  //               deleteAuthorizationToken();
  //               deleteMobileAuthorizationToken();
  //             }
  //           }
  //         );
  //       } else {
  //         console.log("User cancelled login or did not fully authorize.");
  //       }
  //     },
  //     {
  //       scope: "email",
  //       return_scopes: true,
  //     }
  //   );
  // };

  //Social logins rendering
  // renderSocials(renderer) {
  //   // change mods after api integration
  //   return (
  //     <div
  //       block="MyAccountOverlay"
  //       elem="SSO"
  //       mods={{ disabled: !!!SSO_LOGIN_PROVIDERS?.length }}
  //     >
  //       <div block="MyAccountOverlay-SSO" elem="title">
  //         {renderer === "SignIn"
  //           ? __("OR SIGN IN WITH")
  //           : __("OR REGISTER IN WITH")}
  //       </div>
  //       <div block="MyAccountOverlay-SSO" elem="Buttons">
  //         <button
  //           block="MyAccountOverlay-SSO-Buttons"
  //           elem="Facebook"
  //           mods={{ disabled: !!!SSO_LOGIN_PROVIDERS?.includes("Facebook") }}
  //           onClick={this.facebookLogin}
  //         >
  //           {__("FACEBOOK")}
  //         </button>
  //         <button
  //           id="g-signin2"
  //           block="MyAccountOverlay-SSO-Buttons"
  //           elem="Google"
  //           mods={{ disabled: !!!SSO_LOGIN_PROVIDERS?.includes("Google") }}
  //         >
  //           {__("GOOGLE")}
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  renderInitialLinks() {
    return (
      <ul className="logInScreenLinks">
        <li block="MyAccountTabListItem">
          <Link className="return_policy" to="/return-information">
            {__("Return Policy")}
          </Link>
        </li>
        <li block="MyAccountTabListItem">
          <Link className="free_delivery" to="/shipping-policy">
            {__("Free delivery")}
          </Link>
        </li>
        <li block="MyAccountTabListItem">
          <Link className="faq" to="/faq">
            {__("FAQs")}
          </Link>
        </li>
      </ul>
    );
  }
  renderSignIn() {
    const {
      email,
      onSignInAttempt,
      onSignInSuccess,
      onSignInOption,
      isLoading,
      onFormError,
      handleForgotPassword,
      sendGTMEvents,
    } = this.props;

    const { isArabic, isSignInValidated, isOTP, countryCode } = this.state;
    this.setState({ isCreateValidated: false, isForgotValidated: false });
    const countryLabel = getCountryFromUrl();
    return (
      <Form
        key="sign-in"
        onSubmit={onSignInAttempt}
        onSubmitSuccess={(fields) => onSignInOption(isOTP, fields, countryCode)}
        onSubmitError={onFormError}
        isValidateOnChange
        parentCallback={this.onSignInChange}
      >
        <fieldset block="MyAccountOverlay" elem="Legend">
          <div
            block="UserIdentifierFieldsContainer"
            mods={{
              isOTP: isOTP && ENABLE_OTP_LOGIN,
            }}
          >
            {isOTP && ENABLE_OTP_LOGIN && (
              <PhoneCountryCodeField
                label={countryLabel}
                onSelect={(value) =>
                  this.setState({
                    countryCode: value,
                  })
                }
              />
            )}
            <Field
              type={ENABLE_OTP_LOGIN && isOTP ? "text" : "email"}
              placeholder={`${
                ENABLE_OTP_LOGIN ? __("EMAIL OR PHONE") : __("EMAIL ADDRESS")
              }*`}
              id="email"
              name="email"
              value={!ENABLE_OTP_LOGIN && !isOTP ? email : null}
              autocomplete={ENABLE_OTP_LOGIN && isOTP ? "off" : "on"}
              // autocomplete="email"
              maxLength={this.getUserIdentifierMaxLength()}
              validation={["notEmpty", this.getValidationForUserIdentifier()]}
              onChange={this.setUserIdentifierType.bind(this)}
            />
          </div>
          {(!isOTP || !ENABLE_OTP_LOGIN) && (
            <>
              <Field
                type="password"
                placeholder={`${__("PASSWORD")}*`}
                id="password"
                name="password"
                autocomplete="current-password"
                validation={this.getValidationForPassword()}
                mix={{
                  block: "Password",
                  mods: {
                    isOTP,
                  },
                }}
              />
            </>
          )}
        </fieldset>
        <button
          type="button"
          block="MyAccountOverlay"
          elem="Button"
          mods={{ likeLink: true }}
          mix={{
            block: "MyAccountOverlay",
            elem: "Button",
            mods: { isArabic },
          }}
          onClick={(e) => {
            handleForgotPassword(e);
            this.sendMOEEvents(EVENT_FORGOT_PASSWORD_CLICK);
            sendGTMEvents(EVENT_FORGOT_PASSWORD_CLICK);
          }}
        >
          {__("Forgot password?")}
        </button>
        <div
          block="MyAccountOverlay"
          elem="Button"
          mods={{ isSignIn: true, isSignInValidated }}
        >
          <button
            block="Button"
            disabled={!isSignInValidated || isLoading}
            mix={{
              block: "MyAccountOverlay",
              elem: isLoading ? "LoadingButton" : "",
            }}
          >
            {!isLoading ? (
              __("Sign in")
            ) : (
              <ThreeDots color="white" height={6} width={"100%"} />
            )}
          </button>
        </div>
      </Form>
    );
  }

  renderChangeStore() {
    if (isMobile.any()) {
      return (
        <div block="MyAccountOverlay" elem="StoreSwitcher">
          <LanguageSwitcher />
          <CountrySwitcher />
        </div>
      );
    }

    return null;
  }

  render() {
    const { isLoading, onVisible, state, isCheckout, isHidden } = this.props;
    const { isPopup, isArabic } = this.state;
    return (
      <div block="HeaderAccount" elem="PopUp" mods={{ isHidden }}>
        <Overlay
          id={CUSTOMER_ACCOUNT_OVERLAY_KEY}
          mix={{
            block: "MyAccountOverlay",
            mods: { isPopup, isArabic },
          }}
          onVisible={onVisible}
          isStatic={!isCheckout && !!isMobile.any()}
        >
          {this.renderMyAccount()}
        </Overlay>
      </div>
    );
  }
}

export default withRouter(MyAccountOverlay);
