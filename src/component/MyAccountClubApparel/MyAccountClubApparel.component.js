/* eslint-disable max-len */
import PropTypes from "prop-types";
import { PureComponent } from "react";

import MyAccountClubApparelOverlay from "Component/MyAccountClubApparelOverlay";
import { ClubApparelMember } from "Util/API/endpoint/ClubApparel/ClubApparel.type";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";

import ClubApparelLogoAR from "./images/ca-trans-ar-logo.png";
import ClubApparelLogoEN from "./images/ca-trans-logo.png";
import Benefits from "./images/club_apparel_benefits@2x.png";
import Redemption from "./images/club_apparel_redemption_value@2x.png";
import TierBenefits from "./images/club_apparel_tier_benefits@2x.png";
import { TIER_DATA } from "./MyAccountClubApparel.config";
import Image from "Component/Image";

import "./MyAccountClubApparel.style";

class MyAccountClubApparel extends PureComponent {
  static propTypes = {
    linkAccount: PropTypes.func,
    verifyOtp: PropTypes.func,
    activeOverlay: PropTypes.string.isRequired,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    clubApparel: ClubApparelMember,
  };

  static defaultProps = {
    clubApparel: {},
    linkAccount: () => {},
    verifyOtp: () => {},
  };

  state = {
    isArabic: isArabic(),
    isEarnExpanded: false,
    isAboutExpanded: false,
    isPopupOpen: false,
  };

  static getDerivedStateFromProps(props) {
    const { activeOverlay } = props;
    document.body.style.overflow =
      activeOverlay === "LinkAccount" ? "hidden" : "visible";

    return { isPopupOpen: activeOverlay === "LinkAccount" };
  }

  handleModalClick = () => {
    const { showOverlay } = this.props;
    showOverlay("LinkAccount");
    this.setState(({ isPopupOpen }) => ({ isPopupOpen: !isPopupOpen }));
  };

  hideOverlay = () => {
    const { hideActiveOverlay } = this.props;
    hideActiveOverlay();
  };

  onAboutClick = () => {
    this.setState(({ isAboutExpanded }) => ({
      isAboutExpanded: !isAboutExpanded,
    }));
  };

  onEarnClick = () => {
    this.setState(({ isEarnExpanded }) => ({
      isEarnExpanded: !isEarnExpanded,
    }));
  };

  getDefaultValues([key, props]) {
    const { type = "text", onChange = () => {}, ...otherProps } = props;

    return {
      ...otherProps,
      key,
      name: key,
      id: key,
      type,
      onChange,
    };
  }

  renderLinkedMember() {
    const {
      clubApparel: {
        caPointsValue,
        currency,
        profileComplete,
        memberDetails: { memberTier, mobileNumber = "" },
      },
    } = this.props;
    const { isArabic } = this.state;
    const { img } = TIER_DATA[memberTier];
    const number = mobileNumber.startsWith("00")
      ? `+${mobileNumber.slice(2).replace(/^(.{3})(.*)$/, "$1 $2")}`
      : mobileNumber.replace(/^(.{3})(.*)$/, "$1 $2");

    return (
      <div block="MyAccountClubApparel" elem="MemberData">
        <div block="MyAccountClubApparel" elem="Reward">
          <div block="MyAccountClubApparel" elem="Points" mods={{ isArabic }}>
            <p>Rewards Worth</p>
            <span block="MyAccountClubApparel" elem="PointsCAP">
              {caPointsValue}
            </span>
            <span block="MyAccountClubApparel" elem="PointsCurrency">
              {currency}
            </span>
          </div>
          <div block="MyAccountClubApparel" elem="Tier" mods={{ isArabic }}>
            <Image lazyLoad={true}
              block="MyAccountClubApparel"
              elem="TierImage"
              src={img}
              alt="Tier"
            />
          </div>
        </div>
        {!profileComplete && 
          <p block="MyAccountClubApparel" elem="Redemption">
            {__("Please complete your profile on ")}
            <span>{__("Club Apparel App")}</span>
            {__(" to UNLOCK redemption.")}
          </p>
        }
        <p
          block="MyAccountClubApparel"
          elem="Number"
          mods={{ isLinkedMember: true }}
        >
          {__("Phone Number: ")}
          <span>{number}</span>
        </p>
        <button
          block="MyAccountClubApparel"
          elem="ChangeButton"
          mods={{ isLinkedMember: true }}
          onClick={this.handleModalClick}
        >
          {__("change to another club apparel account")}
        </button>
      </div>
    );
  }

  renderLinkForm() {
    return (
      <div block="MyAccountClubApparel" elem="LinkForm">
        {this.renderLinkAccount()}
        {this.renderVerifyOtp()}
      </div>
    );
  }

  renderNotLinkedMember() {
    return (
      <div block="MyAccountClubApparel" elem="MemberData">
        <div block="MyAccountClubApparel" elem="Cards">
          <div block="MyAccountClubApparel" elem="Card">
            <Image lazyLoad={true} elem="Card" src={Benefits} alt="Loyalty" />
            <h3>{__("AVAIL LOYALTY BENEFITS ON 6THSTREET")}</h3>
            <p>
              {__(
                "Get access and offers from your favourite international brands."
              )}
            </p>
          </div>
          <div block="MyAccountClubApparel" elem="Card">
            <Image lazyLoad={true} elem="Card" src={TierBenefits} alt="Tiers" />
            <h3>{__("TIERS BENEFIT")}</h3>
            <p>{__("Enjoy a tier-based rewards and benefits")}</p>
          </div>
          <div block="MyAccountClubApparel" elem="Card">
            <Image lazyLoad={true} elem="Card" src={Redemption} alt="Redemption" />
            <h3>{__("REDEMPTION VALUE")}</h3>
            <p block="MyAccountClubApparel" elem="RedemptionParagraph">
              {__("1 Point = ")}
              <strong>{__("1 AED")}</strong>
            </p>
            <p
              block="MyAccountClubApparel"
              elem="Card"
              mods={{ countrySpecific: true }}
            >
              {__("*Country specific")}
            </p>
          </div>
        </div>
        <p block="MyAccountClubApparel" elem="Number">
          {__("Link your Club Apparel account to earn")}
        </p>
        <button
          block="MyAccountClubApparel"
          elem="ChangeButton"
          onClick={this.handleModalClick}
        >
          {__("link your account")}
        </button>
      </div>
    );
  }

  renderAbout() {
    const { isAboutExpanded } = this.state;

    return (
      <div block="MyAccountClubApparel" elem="About" mods={{ isAboutExpanded }}>
        <p>
          {__(
            "Club Apparel is a mobile app - based loyalty program of Apparel Group which comprises of more than 75+ brands and 1750+ stores across GCC. Club Apparel members can now avail Loyalty Benefits on 6thStreet.com."
          )}
        </p>
        <p>
          {__(
            "Club Apparel members can collect and redeem points at any Apparel Group participating stores across GCC including 6thStreet."
          )}
        </p>
        <p>
          {__(
            "For more details, please refer to the FAQs on the Club Apparel Mobile App or view "
          )}
          <a href="http://www.clubapparel.com/terms&amp;conditions.html">
            {__("Club Apparel Terms and Conditions")}
          </a>
        </p>
        <p>
          {__("You can also view the ")}
          <a href="http://www.clubapparel.com/privacy-policy.html">
            {__("Club Apparel Privacy Policy")}
          </a>
          {__(" for any additional information.")}
        </p>
      </div>
    );
  }

  renderEarn = () => {
    const { isEarnExpanded } = this.state;

    return (
      <div block="MyAccountClubApparel" elem="Earn" mods={{ isEarnExpanded }}>
        <p>
          {__(
            "To be rewarded for 6thStreet purchases, you must have a 6thStreet account and you must be a Club Apparel Member. You need to link your Club Apparel account to your 6thStreet account. If you are not a Club Apparel member, you can download the Club Apparel App and Register from "
          )}
          <a href="http://www.clubapparel.com/ca-rewards/rewards.html">
            {__("here.")}
          </a>
        </p>
        <p>
          {__(
            "Once the linking is completed, you can collect Club Apparel Points on your purchases on 6thStreet. Club Apparel points collected from the Stores can be used on 6thStreet and vice versa."
          )}
        </p>
        <p>
          {__(
            "Club Apparel Points are valid for one year from the date of purchase and a member can redeem the points at any time before the expiry period of one year."
          )}
        </p>
        <p>
          {__(
            "Your Club Apparel Membership Tier defines the amount of points you will collect on your purchase. To know more about the tiers, please refer to "
          )}
          <a href="http://www.clubapparel.com/CA-Tiers-Info.html">
            {__("Club Apparel Tiers")}
          </a>
          {__(" details.")}
        </p>
        <p>
          {__(
            "Club Apparel also provides special bonus points and brand points during promotions and events. To know more about the Special Points, please refer to "
          )}
          <a href="http://www.clubapparel.com/brands-terms&amp;conditions.html">
            {__("Club Apparel Special Points Terms and Conditions.")}
          </a>
        </p>
      </div>
    );
  };

  renderAboutMobile() {
    const { isArabic } = this.state;

    return (
      <div block="MyAccountClubApparel" elem="MobileWrapper">
        <div block="MyAccountClubApparel" elem="AboutMobile">
          <Image lazyLoad={true}
            className="MemberDataLogo"
            src={isArabic ? ClubApparelLogoAR : ClubApparelLogoEN}
            alt="Logo icon"
          />
          <div block="MyAccountClubApparel" elem="AboutMobileText">
            <h3>{__("About Club Apparel")}</h3>
            {this.renderAbout()}
          </div>
        </div>
      </div>
    );
  }

  renderEarnMobile() {
    const { isArabic } = this.state;

    return (
      <div block="MyAccountClubApparel" elem="MobileWrapper">
        <div block="MyAccountClubApparel" elem="EarnMobile">
          <Image lazyLoad={true}
            className="MemberDataLogo"
            src={isArabic ? ClubApparelLogoAR : ClubApparelLogoEN}
            alt="Logo icon"
          />
          <div block="MyAccountClubApparel" elem="EarnMobileText">
            <h3>{__("Earn & Burn")}</h3>
            {this.renderEarn()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      linkAccount,
      country,
      verifyOtp,
      clubApparel,
      clubApparel: { 
          accountLinked,
          //memberDetails: { mobileNumber = "" },
        },
    } = this.props;
    const { isAboutExpanded, isEarnExpanded, isArabic, isPopupOpen } =
      this.state;
    const beforeDesktop = isMobile.any() || isMobile.tablet();
    const isMobileLogo = isMobile.any() !== null;
    const isArabicAbout = isArabic && isAboutExpanded;
    const isArabicEarn = isArabic && isEarnExpanded;
    
    const mobileNumber = clubApparel?.memberDetails?.mobileNumber ? clubApparel?.memberDetails?.mobileNumber :"";
    const number = mobileNumber.startsWith("00")
      ? `+${mobileNumber.slice(2).replace(/^(.{3})(.*)$/, "$1$2")}`
      : mobileNumber.replace(/^(.{3})(.*)$/, "$1$2");
    return (
      <div block="MyAccountClubApparel">
        <div block="MyAccountClubApparel" elem="Wrapper" />
        <div block="MyAccountClubApparel" elem="ClubApparelContainer">
          <Image lazyLoad={true}
            className="MemberDataLogo"
            mods={{ isMobileLogo }}
            src={isArabic ? ClubApparelLogoAR : ClubApparelLogoEN}
            alt="Logo icon"
          />
          {accountLinked
            ? this.renderLinkedMember()
            : this.renderNotLinkedMember()}
        </div>
        <div block="MyAccountClubApparel" elem="Buttons" mods={{ isArabic }}>
          <button
            block="MyAccountClubApparel"
            elem="AboutButton"
            mods={{ isAboutExpanded, isArabicAbout }}
            onClick={this.onAboutClick}
          >
            {__("About Club Apparel")}
          </button>
          {beforeDesktop && isAboutExpanded
            ? this.renderAboutMobile()
            : this.renderAbout()}
          <button
            block="MyAccountClubApparel"
            elem="EarnButton"
            mods={{ isEarnExpanded, isArabicEarn }}
            onClick={this.onEarnClick}
          >
            {__("Reward")}
          </button>
          {beforeDesktop && isEarnExpanded
            ? this.renderEarnMobile()
            : this.renderEarn()}
        </div>
        {isPopupOpen ? (
          <MyAccountClubApparelOverlay
            linkAccount={linkAccount}
            country={country}
            verifyOtp={verifyOtp}
            renderAbout={this.renderAbout}
            renderEarn={this.renderEarn}
            isAboutExpanded={isAboutExpanded}
            isEarnExpanded={isEarnExpanded}
            linkedNumber= {number}
          />
        ) : null}
      </div>
    );
  }
}

export default MyAccountClubApparel;
