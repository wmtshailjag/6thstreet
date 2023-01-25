import PropTypes from "prop-types";
import { PureComponent } from "react";
import { withRouter } from "react-router";

import { isArabic } from "Util/App";
import MyAccountOverlay from "Component/MyAccountOverlay";
import { EVENT_MOE_WISHLIST_TAB_ICON } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

import "./HeaderWishlist.style";

class HeaderWishlist extends PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
    isBottomBar: PropTypes.bool.isRequired,
    isWishlist: PropTypes.bool.isRequired,
    wishListItems: PropTypes.array.isRequired,
    isMobile: PropTypes.bool,
    isSignedIn: PropTypes.bool.isRequired,
    showNotification: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isMobile: false,
    showPopup: false,
    signInPopUp: "",
  };

  state = {
    isArabic: isArabic(),
  };

  routeChangeWishlist = () => {
    const { history, isSignedIn, showNotification } = this.props;

    Moengage.track_event(EVENT_MOE_WISHLIST_TAB_ICON, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });

    if (isSignedIn) {
      history.push("/my-account/my-wishlist");
    } else {
      this.setState({ showPopup: true });
    }
  };

  closePopup = () => {
    this.setState({ signInPopUp: "", showPopup: false });
  };

  onSignIn = () => {
    this.closePopup();
  };

  renderMySignInPopup() {
    const { showPopup } = this.state;
    if (!showPopup) {
      return null;
    }
    return (
      <MyAccountOverlay
        closePopup={this.closePopup}
        onSignIn={this.onSignIn}
        isPopup
      />
    );
  }

  render() {
    const {
      isBottomBar,
      isWishlist,
      isMobile,
      wishListItems = [],
    } = this.props;
    const { isArabic, signInPopUp } = this.state;
    const itemsCount = wishListItems.length;

    return (
      <div
        block="HeaderWishlist"
        mods={{ isWishlist }}
        mix={{
          block: "HeaderWishlist",
          mods: { isBottomBar },
          mix: {
            block: "HeaderWishlist",
            mods: { isArabic },
            mix: {
              block: "HeaderWishlist",
              mods: { isMobile },
            },
          },
        }}
        role="button"
        aria-label="header-wishlist-icon"
      >
        <button
          onClick={this.routeChangeWishlist}
          type="button"
          block="HeaderWishlist"
          elem="Button"
        >
          <div
            block="HeaderWishlist"
            elem="Count"
            mods={{ have: !!itemsCount }}
          >
            {itemsCount}
          </div>
          <span
            block="HeaderWishlist"
            elem="Heart"
            mods={{ isBlack: !!itemsCount }}
          />
        </button>
        {this.renderMySignInPopup()}
        {!isBottomBar && <label htmlFor="WishList">{__("Wishlist")}</label>}
      </div>
    );
  }
}

export default withRouter(HeaderWishlist);
