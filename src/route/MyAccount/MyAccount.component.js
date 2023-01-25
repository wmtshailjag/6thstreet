import ContactHelp from "Component/ContactHelp";
import ContentWrapper from "Component/ContentWrapper";
import Image from "Component/Image";
import Link from "Component/Link";
import MyAccountAddressBook from "Component/MyAccountAddressBook";
import WalletAndPayments from "Component/WalletsAndPayments";
import MyAccountClubApparel from "Component/MyAccountClubApparel";
import MyAccountDashboard from "Component/MyAccountDashboard";
import MyAccountMobileHeader from "Component/MyAccountMobileHeader";
import MyAccountMyOrders from "Component/MyAccountMyOrders";
import MyAccountMyWishlist from "Component/MyAccountMyWishlist";
import {
  RETURN_ITEM_LABEL,
  RETURN__EXCHANGE_ITEM_LABEL,
} from "Component/MyAccountOrderView/MyAccountOrderView.config.js";
import MyAccountReturns from "Component/MyAccountReturns";
import MyAccountStoreCredit from "Component/MyAccountStoreCredit";
import MyAccountTabList from "Component/MyAccountTabList";
import SettingsScreen from "Component/SettingsScreen";
import PropTypes from "prop-types";
import { Fragment } from "react";
import { MyAccount as SourceMyAccount } from "SourceRoute/MyAccount/MyAccount.component";
import {
  activeTabType,
  ADDRESS_BOOK,
  CLUB_APPAREL,
  CONTACT_HELP,
  DASHBOARD,
  MY_ORDERS,
  MY_WISHLIST,
  RETURN_ITEM,
  EXCHANGE_ITEM,
  SETTINGS_SCREEN,
  STORE_CREDIT,
  WALLET_PAYMENTS,
  tabMapType,
} from "Type/Account";
import {
  exchangeReturnState,
  returnState,
  tabMap,
  tabMap2,
} from "./MyAccount.container";
import { isArabic } from "Util/App";
import { deleteAuthorizationToken } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import isMobile from "Util/Mobile";
import { TIER_DATA } from "./../../component/MyAccountClubApparel/MyAccountClubApparel.config";
import box from "./icons/box.png";
import calogo from "./icons/calogo.png";
import contactHelp from "./icons/contact-help.png";
import infoIcon from "./icons/infobold.png";
import { ADD_ADDRESS } from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import {
  EVENT_MOE_ACCOUNT_ORDERS_CLICK,
  EVENT_MOE_ACCOUNT_RETURNS_CLICK,
  EVENT_MOE_ACCOUNT_ADDRESS_BOOK_CLICK,
  EVENT_MOE_ACCOUNT_PROFILE_CLICK,
  EVENT_MOE_ACCOUNT_CLUB_APPAREL_CLICK,
  EVENT_MOE_ACCOUNT_SETTINGS_CLICK,
  EVENT_MOE_ACCOUNT_CUSTOMER_SUPPORT_CLICK,
  EVENT_MOE_RETURN_AN_ITEM_CLICK
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class MyAccount extends SourceMyAccount {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.returnItemButtonClick = this.returnItemButtonClick.bind(this);
  }

  static propTypes = {
    activeTab: activeTabType.isRequired,
    tabMap: tabMapType.isRequired,
    changeActiveTab: PropTypes.func.isRequired,
    onSignIn: PropTypes.func.isRequired,
    onSignOut: PropTypes.func.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    mobileTabActive: PropTypes.bool.isRequired,
    setMobileTabActive: PropTypes.func.isRequired,
  };

  state = {
    isArabic: isArabic(),
    isMobile: isMobile.any(),
  };

  renderMap = {
    [STORE_CREDIT]: MyAccountStoreCredit,
    [CLUB_APPAREL]: MyAccountClubApparel,
    [DASHBOARD]: MyAccountDashboard,
    [MY_ORDERS]: MyAccountMyOrders,
    [RETURN_ITEM]: MyAccountReturns,
    [EXCHANGE_ITEM]: MyAccountReturns,
    [MY_WISHLIST]: MyAccountMyWishlist,
    [ADDRESS_BOOK]: MyAccountAddressBook,
    [WALLET_PAYMENTS]: WalletAndPayments,
    [CONTACT_HELP]: ContactHelp,
    [SETTINGS_SCREEN]: SettingsScreen,
  };

  linksMap = [
    {
      title: __("Download The App"),
      items: [
        {
          id_app: "App1",
          app_store:
            "https://static.6media.me/static/version1600320971/frontend/6SNEW/6snew/en_US/images/apple-store-badge.svg",
          app_onclick:
            "https://apps.apple.com/ro/app/6thstreet-com/id1370217070",
          id_google: "Google1",
          google_play:
            "https://static.6media.me/static/version1600320042/frontend/6SNEW/6snew/en_US/images/google-play-badge.svg",
          google_onclick:
            "https://play.google.com/store/apps/details?id=com.apparel.app6thstreet",
          id_gallery: "Gallery1",
          app_gallery:
            "https://6thstreetmobileapp-eu-c.s3.eu-central-1.amazonaws.com/resources/20190121/en-ae/d/icon_huaweiappgallery.svg",
          gallery_onclick: "https://appgallery.huawei.com/#/app/C102324663",
          header: __("Follow the latest trends"),
        },
      ],
    },
  ];

  renderAppColumn() {
    return this.linksMap.map((column) => (
      <div block="FooterMain" elem="LastColumn" key={column.title}>
        <h4 block="FooterMain" elem="FooterHeading">
          {column.title}
        </h4>
        <div block="FooterMain" elem="Nav">
          {column.items.map((items, i) => (
            <Fragment key={`last_main_footer_column_${i}`}>
              <div block="FooterMain" elem="WrapperFirst">
                <div block="MobileFooterMain">
                  <Link to={items.app_onclick} key={items.id_app}>
                    <Image
                      lazyLoad={true}
                      src={items.app_store}
                      alt="app store download"
                    />
                  </Link>
                  <Link to={items.google_onclick} key={items.id_google}>
                    <Image
                      lazyLoad={true}
                      src={items.google_play}
                      alt="google play download"
                    />{" "}
                  </Link>
                  <Link to={items.gallery_onclick} key={items.id_gallery}>
                    <Image
                      lazyLoad={true}
                      src={items.app_gallery}
                      alt="app gallery download"
                      className="appGallery"
                    />
                  </Link>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    ));
  }

  sendEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      ...(event == EVENT_MOE_RETURN_AN_ITEM_CLICK  && {screen_name: "Return List"}),
      app6thstreet_platform: "Web",
    });
  }

  chat() {
    if (document.querySelector(".ori-cursor-ptr")) {
      document.querySelector(".ori-cursor-ptr").click();
    }
  }

  handleTabChange(key) {
    const { changeActiveTab, mobileTabActive, setMobileTabActive } = this.props;

    setMobileTabActive(!mobileTabActive);
    changeActiveTab(key);
    const MoeEvent =
      key == "dashboard"
        ? EVENT_MOE_ACCOUNT_PROFILE_CLICK
        : key == "my-orders"
        ? EVENT_MOE_ACCOUNT_ORDERS_CLICK
        : key == "settings"
        ? EVENT_MOE_ACCOUNT_SETTINGS_CLICK
        : key == "address-book"
        ? EVENT_MOE_ACCOUNT_ADDRESS_BOOK_CLICK
        : key == "return-item"
        ? EVENT_MOE_ACCOUNT_RETURNS_CLICK
        : key == "club-apparel"
        ? EVENT_MOE_ACCOUNT_CLUB_APPAREL_CLICK
        : "";
    if (MoeEvent && MoeEvent.length > 0) {
      this.sendEvents(MoeEvent);
    }
  }

  openTabMenu() {
    const { mobileTabActive, setMobileTabActive, history } = this.props;
    // history.push("/my-account");
    history.goBack();
    setMobileTabActive(!mobileTabActive);
  }

  handleClick(e) {
    e.preventDefault();
    this.openTabMenu();
  }

  handleSignOut() {
    const { onSignOut } = this.props;
    onSignOut();
    deleteAuthorizationToken();
    const { history } = this.props;
    history.push("/");
  }

  returnItemButtonClick() {
    const { history } = this.props;
    history.push("/my-account/my-orders");
    this.sendEvents(EVENT_MOE_RETURN_AN_ITEM_CLICK);
  }

  renderDesktop() {
    const {
      activeTab,
      changeActiveTab,
      isSignedIn,
      exchangeTabMap,
      is_exchange_enabled = false,
    } = this.props;
    const { pathname = "" } = location;
    let newTabMap = is_exchange_enabled
      ? { ...tabMap, ...exchangeReturnState, ...tabMap2 }
      : { ...tabMap, ...returnState, ...tabMap2 };
    const { isArabic } = this.state;

    if (!isSignedIn) {
      const { history } = this.props;
      return history.push("/");
    }
    const TabContent = this.renderMap[activeTab];
    // eslint-disable-next-line no-unused-vars

    let finalTab;
    if (newTabMap[activeTab]) {
      finalTab = newTabMap[activeTab];
    } else if (exchangeTabMap[activeTab]) {
      finalTab = exchangeTabMap[activeTab];
    }
    const { name, alternativePageName, alternateName } = finalTab;
    const pickUpAddress =
      pathname === "/my-account/return-item/pick-up-address";

    const returnTitle =
      activeTab === RETURN_ITEM
        ? pickUpAddress
          ? __("Select Pick Up Address")
          : __("Return Statement")
        : activeTab === EXCHANGE_ITEM
        ? __("Exchange Statement")
        : null;
    const isCancel = pathname.includes("/return-item/cancel");
    const isReturnButton = pathname === "/my-account/return-item";
    return (
      <ContentWrapper
        label={__("My Account page")}
        wrapperMix={{ block: "MyAccount", elem: "Wrapper", mods: { isArabic } }}
      >
        <MyAccountTabList
          tabMap={newTabMap}
          activeTab={activeTab === EXCHANGE_ITEM ? RETURN_ITEM : activeTab}
          changeActiveTab={changeActiveTab}
          onSignOut={this.handleSignOut}
        />
        <div block="MyAccount" elem="TabContent" mods={{ isArabic }}>
          {alternativePageName === "Club Apparel Loyalty" ||
          name === "Club Apparel Loyalty" ? null : !isReturnButton ? (
            <h1 block="MyAccount" elem="Heading">
              {isCancel
                ? alternateName
                : alternativePageName || returnTitle || name}
            </h1>
          ) : (
            <div block="MyAccount" elem="HeadingBlock">
              <h1 block="MyAccount" elem="Heading">
                {isReturnButton
                  ? is_exchange_enabled
                    ? __("Return/Exchange Statement")
                    : __("Return Statement")
                  : alternativePageName || returnTitle || name}
              </h1>
              <button
                block="MyAccount"
                elem="ReturnButton"
                onClick={this.returnItemButtonClick}
              >
                {is_exchange_enabled
                  ? RETURN__EXCHANGE_ITEM_LABEL
                  : RETURN_ITEM_LABEL}
              </button>
            </div>
          )}
          <TabContent />
        </div>
      </ContentWrapper>
    );
  }

  renderMobile() {
    const {
      activeTab,
      isSignedIn,
      mobileTabActive,
      setMobileTabActive,
      exchangeTabMap,
      payload,
      is_exchange_enabled,
    } = this.props;

    const { isArabic, isMobile } = this.state;
    let newTabMap = is_exchange_enabled
      ? { ...tabMap, ...exchangeReturnState, ...tabMap2 }
      : { ...tabMap, ...returnState, ...tabMap2 };
    const showProfileMenu =
      location.pathname.match("\\/my-account").input === "/my-account";
    // let hiddenTabContent = mobileTabActive ? "Active" : "Hidden";
    // let hiddenTabList = mobileTabActive ? "Hidden" : "Active";
    let hiddenTabContent, hiddenTabList;
    if (showProfileMenu) {
      hiddenTabList = "Active";
      hiddenTabContent = "Hidden";
    } else {
      hiddenTabList = "Hidden";
      hiddenTabContent = "Active";
    }
    if (!isSignedIn) {
      return this.renderLoginOverlay();
    }

    const { pathname = "" } = location;

    const TabContent = this.renderMap[activeTab];
    let finalTab;
    if (newTabMap[activeTab]) {
      finalTab = newTabMap[activeTab];
    } else if (exchangeTabMap[activeTab]) {
      finalTab = exchangeTabMap[activeTab];
    }
    const { name, alternativePageName, alternateName } = finalTab;
    const isCancel = pathname.includes("/return-item/cancel");
    const isPickUpAddress = pathname === "/my-account/return-item/pick-up-address";
    const customer = BrowserDatabase.getItem("customer");
    const firstname =
      customer && customer.firstname ? customer.firstname : null;
    const payloadKey = Object.keys(payload)[0];
    return (
      <ContentWrapper
        label={__("My Account page")}
        wrapperMix={{ block: "MyAccount", elem: "Wrapper", mods: { isArabic } }}
      >
        {!(isPickUpAddress && payloadKey && payload[payloadKey].title) && (
          <MyAccountMobileHeader
            onClose={this.handleClick}
            isHiddenTabContent={hiddenTabContent === "Active"}
            alternativePageName={alternativePageName}
            name={
              isPickUpAddress
                ? "Select Pick Up Address"
                : isCancel
                ? alternateName
                : name
            }
          />
        )}

        <div block={hiddenTabList}>
          <div block="UserBlock">
            <span>{__("Hello, ")}</span>
            <span block="UserName">{firstname}</span>
          </div>
          <div block="MobileCards">
            <div block="CaCardsContainer">
              <div block="InfoIconBlock">
                <Image block="InfoIcon" src={infoIcon} alt={"Club Apparel"} />
              </div>
              <div block="CardsIconBlock">
                <Image block="CardsIcon" src={calogo} alt={"apparel"} />
              </div>
              {/* tier image to be added once we got the background image REF: https://projects.invisionapp.com/d/main?origin=v7#/console/17341759/362923026/preview?scrollOffset=23294#project_console */}
              {this.props.clubApparel?.accountLinked ? (
                <button
                  onClick={() => this.handleTabChange("club-apparel")}
                  block="AccountLinked"
                >
                  <div block="AccountLinkedTextBlock">
                    <span block="ClubApparelImgBlock">
                      <Image
                        block="ClubApparelImg"
                        src={
                          TIER_DATA[
                            this.props.clubApparel?.memberDetails?.memberTier
                          ]?.img
                        }
                        alt={"apparel"}
                      />
                    </span>
                    <span block="TierName">
                      {" "}
                      {this.props.clubApparel?.memberDetails?.memberTier} TIER
                    </span>
                    <span block="pointDetails">
                      <span block="pointsValue">
                        {this.props.clubApparel?.caPointsValue}
                      </span>{" "}
                      {this.props.clubApparel?.currency}
                    </span>
                  </div>
                </button>
              ) : (
                <button onClick={() => this.handleTabChange("club-apparel")}>
                  {__("Link Now")}
                </button>
              )}
            </div>
            <div block="CardsContainer">
              <Image block="CardsIcon" src={box} alt={"box"} />
              <div block="CardTitle"> {__("My Orders")} </div>
              <button onClick={() => this.handleTabChange("my-orders")}>
                {__("View")}
              </button>
            </div>
            <div block="CardsContainer">
              <Image block="CardsIcon" src={contactHelp} alt={"box"} />
              <div block="CardTitle"> {__("Customer Support")} </div>
              <button
                onClick={() => {
                  this.chat();
                  this.sendEvents(EVENT_MOE_ACCOUNT_CUSTOMER_SUPPORT_CLICK);
                }}
              >
                {__("Live Chat")}
              </button>
            </div>
          </div>
          <MyAccountTabList
            tabMap={newTabMap}
            activeTab={activeTab === EXCHANGE_ITEM ? RETURN_ITEM : activeTab}
            changeActiveTab={this.handleTabChange}
            onSignOut={this.handleSignOut}
          />
          <div>{isMobile ? this.renderAppColumn() : null}</div>
        </div>
        <div block={hiddenTabContent}>
          <div block="MyAccount" elem="TabContent">
            <TabContent />
          </div>
        </div>
      </ContentWrapper>
    );
  }

  renderContent() {
    const { isMobile } = this.state;
    return isMobile ? this.renderMobile() : this.renderDesktop();
  }
}

export default MyAccount;
