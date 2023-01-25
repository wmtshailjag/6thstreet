/* eslint-disable max-len */
import ClickOutside from "Component/ClickOutside";
import MyAccountOverlay from "Component/MyAccountOverlay";
import MyAccountSignedInOverlay from "Component/MyAccountSignedInOverlay";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { customerType } from "Type/Account";
import { isArabic } from "Util/App";
import history from "Util/History";
import isMobile from "Util/Mobile";
import { SMS_LINK } from "./HeaderAccount.config";
import "./HeaderAccount.style";
import Event, {
  EVENT_MOE_ACCOUNT_TAB_ICON,
  EVENT_GTM_ACCOUNT_TAB_CLICK,
  EVENT_GTM_AUTHENTICATION,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class HeaderAccount extends PureComponent {
  static propTypes = {
    isBottomBar: PropTypes.bool.isRequired,
    isAccount: PropTypes.bool.isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    customer: customerType,
    isMobile: PropTypes.bool,
    isFooter: PropTypes.bool.isRequired,
    handleFooterIsAccountOpen: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isMobile: false,
    customer: null,
  };

  _isArabic = isArabic();

  state = {
    showPopup: false,
    showPopupSignedIn: false,
  };

  componentDidMount() {
    this.orderRedirect();
  }

  orderRedirect() {
    const { pathname = "" } = window.location;
    const { isSignedIn } = this.props;
    const orderId = pathname.split(SMS_LINK)[1] || null;

    if (orderId && pathname.includes(SMS_LINK) && isSignedIn) {
      history.push(`/my-account/my-orders/${orderId}`);
    }

    if (
      orderId &&
      pathname.includes(SMS_LINK) &&
      !isSignedIn &&
      !isMobile.any()
    ) {
      history.push("/");
      localStorage.setItem("ORDER_ID", orderId);
      this.showMyAccountPopup();
    }
  }

  closePopup = () => {
    this.setState({ showPopup: false, showPopupSignedIn: false });
    this.handleFooterPopup();
  };

  showMyAccountPopup = () => {
    const { isSignedIn } = this.props;
    this.setState({ showPopup: true, showPopupSignedIn: isSignedIn });
    this.handleFooterPopup();
  };

  handleFooterPopup = () => {
    const { handleFooterIsAccountOpen, isFooter } = this.props;
    if (isFooter) {
      handleFooterIsAccountOpen();
    }
  };

  onSignIn = () => {
    this.closePopup();
  };

  renderMyAccountPopup() {
    const { isSignedIn } = this.props;
    const { showPopup, showPopupSignedIn } = this.state;

    if (!showPopup) {
      return null;
    }

    if (isSignedIn && showPopupSignedIn) {
      return (
        <ClickOutside onClick={this.closePopup}>
          <div>
            <MyAccountSignedInOverlay onHide={this.closePopup} />
          </div>
        </ClickOutside>
      );
    }

    return (
      <MyAccountOverlay
        closePopup={this.closePopup}
        onSignIn={this.onSignIn}
        isPopup
      />
    );
  }

  sendMoeEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }
  renderAccountButton() {
    const { isSignedIn, customer, isBottomBar, isFooter } = this.props;

    if (isBottomBar) {
      return;
      // return <label htmlFor="Account">{__("Account")}</label>;
    }

    const accountButtonText =
      isSignedIn && customer && customer.firstname && customer.lastname
        ? `${customer.firstname} ${customer.lastname}`
        : __("Login/Register");
    const sendGTMEvent = () => {
      const eventData = {
        name: EVENT_GTM_ACCOUNT_TAB_CLICK,
        category: "top_navigation_menu",
        action: EVENT_GTM_ACCOUNT_TAB_CLICK,
      };
      Event.dispatch(EVENT_GTM_AUTHENTICATION, eventData);
    };
    return (
      <div block="HeaderAccount" elem="ButtonWrapper">
        <button
          block="HeaderAccount"
          elem="Button"
          mods={{ isArabic: this._isArabic, isFooter }}
          onClick={() => {
            isFooter && isSignedIn
              ? this.redirectToAccount()
              : this.showMyAccountPopup(),
              this.sendMoeEvents(EVENT_MOE_ACCOUNT_TAB_ICON);
              sendGTMEvent();
          }}
        >
          <label htmlFor="Account">
            <span>{accountButtonText}</span>
          </label>
        </button>
        {this.renderMyAccountPopup()}
      </div>
    );
  }

  redirectToAccount() {
    window.location = "/my-account";
  }

  render() {
    const { isBottomBar, isAccount, isMobile } = this.props;

    return (
      <div
        block="HeaderAccount"
        mods={{ isBottomBar }}
        mix={{
          block: "HeaderAccount",
          mods: { isAccount },
          mix: {
            block: "HeaderAccount",
            mods: { isMobile },
          },
        }}
        role="button"
        aria-label="header-account-icon"
      >
        {this.renderAccountButton()}
      </div>
    );
  }
}

export default HeaderAccount;
