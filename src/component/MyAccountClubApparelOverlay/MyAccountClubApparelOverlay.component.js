/* eslint-disable max-len */
import PropTypes from "prop-types";
import { PureComponent } from "react";

import CountryMiniFlag from "Component/CountryMiniFlag";
import Field from "Component/Field";
import Form from "Component/Form";
import {
  COUNTRY_CODES_FOR_PHONE_VALIDATION,
  PHONE_CODES,
} from "Component/MyAccountAddressForm/MyAccountAddressForm.config";
import ClubApparelLogoAR from "Component/MyAccountClubApparel/images/ca-trans-ar-logo.png";
import ClubApparelLogoEN from "Component/MyAccountClubApparel/images/ca-trans-logo.png";
import Loader from "SourceComponent/Loader";
import Popup from "SourceComponent/Popup";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import Image from "Component/Image";

import {
  STATE_LINK,
  STATE_NOT_SUCCESS,
  STATE_SUCCESS,
  STATE_VERIFY,
} from "./MyAccountClubApparelOverlay.config";

import "./MyAccountClubApparelOverlay.style";

class MyAccountClubApparelOverlay extends PureComponent {
  static propTypes = {
    hideActiveOverlay: PropTypes.func.isRequired,
    linkAccount: PropTypes.func.isRequired,
    state: PropTypes.string.isRequired,
    verifyOtp: PropTypes.func.isRequired,
    phone: PropTypes.string.isRequired,
    renderEarn: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    country: PropTypes.string.isRequired,
  };

  state = {
    isArabic: isArabic(),
    isButtonDisabled: true,
    phoneValue: [],
    otpValue: ""
  };

  renderMap = {
    [STATE_LINK]: {
      render: () => this.renderLink(),
    },
    [STATE_VERIFY]: {
      render: () => this.renderVerify(),
    },
    [STATE_SUCCESS]: {
      render: () => this.renderSuccess(),
    },
    [STATE_NOT_SUCCESS]: {
      render: () => this.renderNotSuccess(),
    },
  };

  constructor(props) {
    super(props);

    const { country } = props;

    this.state = {
      selectedCountry: country,      
    };
  }
  componentDidUpdate() {
    const {error}= this.props
    if(error){
      this.setState({otpValue: ""})
    }
  }

  handleVerifyChange = (e = []) => {
    // eslint-disable-next-line no-magic-numbers
    this.setState({ isButtonDisabled: e.length !== 5, otpValue: e});
  };

  renderEarn = () => {
    const { renderEarn } = this.props;

    return (
      <div block="MyAccountClubApparelOverlay" elem="Earn">
        {renderEarn()}
      </div>
    );
  };

  renderCurrentPhoneCode(country_id) {
    return PHONE_CODES[country_id];
  }

  handleSelectChange = (e) => {
    const countries = Object.keys(PHONE_CODES);

    const countiresMapped = countries.reduce((acc, country) => {
      if (e === this.renderCurrentPhoneCode(country)) {
        acc.push(country);
      }

      return acc;
    }, []);

    this.setState({ selectedCountry: countiresMapped[0], phoneValue: [] });
  };

  renderOption = (country) => ({
    id: country,
    label: this.renderCurrentPhoneCode(country),
    value: this.renderCurrentPhoneCode(country),
  });

  renderPhone() {
    const { selectedCountry, isArabic, phoneValue } = this.state;
    const countries = Object.keys(PHONE_CODES);
    const maxlength = COUNTRY_CODES_FOR_PHONE_VALIDATION[selectedCountry]
      ? "9"
      : "8";

    return (
      <div
        block="MyAccountClubApparelOverlay"
        elem="LinkAccountPhone"
        mods={{ isArabic }}
      >
        <Field
          type="select"
          id="countryPhoneCode"
          name="countryPhoneCode"
          onChange={this.handleSelectChange}
          selectOptions={countries.map(this.renderOption)}
          value={PHONE_CODES[selectedCountry]}
        />
        <Field
          mix={{
            block: "MyAccountClubApparelOverlay",
            elem: "LinkAccountPhoneField",
          }}
          validation={["notEmpty"]}
          placeholder={__("Phone Number")}
          maxlength={maxlength}
          pattern="[0-9]*"
          value={phoneValue}
          id="phone"
          name="phone"
        />
        <CountryMiniFlag mods={{ isArabic }} label={selectedCountry} />
      </div>
    );
  }

  renderSuccess() {
    const { hideActiveOverlay } = this.props;
    const { isArabic } = this.state;

    return (
      <div
        block="MyAccountClubApparelOverlay"
        elem="Success"
        mods={{ isArabic }}
      >
        {isMobile.any() || isMobile.tablet() ? (
          <h3>{__("Linking Successful!")}</h3>
        ) : null}
        <p>
          {__(
            "You have successfully linked your 6thstreet.com Account with your "
          )}
          <span>{__("Club Apparel")}</span>
          {__(" Account.")}
        </p>
        <p>{__("Now, start earning Points on every purchase!")}</p>
        <button
          block="MyAccountClubApparelOverlay"
          elem="LinkAccountButton"
          onClick={hideActiveOverlay}
        >
          {__("continue")}
        </button>
      </div>
    );
  }

  renderNotSuccess() {
    const { hideActiveOverlay } = this.props;
    const { isArabic } = this.state;

    return (
      <div
        block="MyAccountClubApparelOverlay"
        elem="NotSuccess"
        mods={{ isArabic }}
      >
        <h3>{__("Linking Unsuccessful!")}</h3>
        <p block="MyAccountClubApparelOverlay" elem="NotSuccessParagraphRed">
          {__("Sorry! We were unable to find a Club Apparel Account with this number.")}
        </p>
        <p block="MyAccountClubApparelOverlay" elem="NotSuccessParagraph">
          {__("If you are not already a Club Apparel member, download the Club Apparel App and Register prior to linking accounts.")}
        </p>
        <button
          block="MyAccountClubApparelOverlay"
          elem="LinkAccountButton"
          onClick={hideActiveOverlay}
        >
          {__("close")}
        </button>
      </div>
    );
  }

  renderLink() {
    const { linkAccount,error,linkedNumber } = this.props;
    
    const number = linkedNumber.replace(/^(.{4})(.*)$/, "$1 $2");

    return (
      <>
        { error && 
          <p block="MyAccountClubApparelOverlay" elem="NotSuccessParagraphRed">
            {__("You have already linked with entered mobile number: ")} <span style={{"display": "inline-block"}}>{number}</span>
          </p>
        }
        <p>{__("Link your Club Apparel account and start earning points.")}</p>     

        <Form onSubmitSuccess={linkAccount}>
          {this.renderPhone()}
          <button
            block="MyAccountClubApparelOverlay"
            elem="LinkAccountButton"
            type="submit"
          >
            {__("Link Account")}
          </button>
        </Form>
      </>
    );
  }

  renderVerify() {
    const { verifyOtp, phone, error } = this.props;
    const { isButtonDisabled, otpValue } = this.state;

    return (
      <div block="MyAccountClubApparelOverlay" elem="Verify">
        {error &&  <p block="MyAccountClubApparelOverlay" elem="NotSuccessParagraphRed">{__(`OTP verification failed`)}</p>}
        <p>
          {__("Enter the verification code we sent to +")}{phone.replace("00", "")}
        </p>        
        <Form onSubmitSuccess={verifyOtp}>
          <Field
            type="text"
            id="otp"
            name="otp"
            placeholder="•••••"
            pattern="[0-9]*"
            onChange={this.handleVerifyChange}
            validation={["notEmpty"]}
            maxlength="5"
            value={otpValue}
          />
          <button
            block="MyAccountClubApparelOverlay"
            elem="VerifyButton"
            type="submit"
            disabled={isButtonDisabled}
          >
            {__("Verify number")}
          </button>
          <button block="MyAccountClubApparelOverlay" elem="VerifyResend">
            {__("Resend Verification Code")}
          </button>
        </Form>
      </div>
    );
  }

  renderOverlay() {
    const { isArabic } = this.state;
    const { state, isLoading } = this.props;
    const { render } = this.renderMap[state];
    const beforeDesktop = isMobile.any() || isMobile.tablet();

    const isMessage = state === STATE_NOT_SUCCESS || state === STATE_SUCCESS;

    return (
      <Popup
        mix={{
          block: "MyAccountClubApparelOverlay",
          mods: { isArabic, isMessage },
        }}
        id="LinkAccount"
        title="Link"
      >
        {isLoading ? <Loader isLoading={isLoading} /> : null}
        {isMessage && beforeDesktop ? null : (
          <div block="MyAccountClubApparelOverlay" elem="LinkAccountBanner">
            <Image lazyLoad={true}
              className="LinkAccountLogo"
              src={isArabic ? ClubApparelLogoAR : ClubApparelLogoEN}
              alt="Logo icon"
            />
          </div>
        )}
        {render()}
      </Popup>
    );
  }

  render() {
    return (
      <div block="MyAccountClubApparelOverlay">{this.renderOverlay()}</div>
    );
  }
}

export default MyAccountClubApparelOverlay;
