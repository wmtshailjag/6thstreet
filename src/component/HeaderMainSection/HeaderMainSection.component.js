import HeaderAccount from "Component/HeaderAccount";
import HeaderCart from "Component/HeaderCart";
import HeaderGenders from "Component/HeaderGenders";
import HeaderLogo from "Component/HeaderLogo";
import HeaderSearch from "Component/HeaderSearch";
import HeaderWishlist from "Component/HeaderWishlist";
import { MOBILE_MENU_SIDEBAR_ID } from "Component/MobileMenuSideBar/MoblieMenuSideBar.config";
import MyAccountOverlay from "Component/MyAccountOverlay";
import NavigationAbstract from "Component/NavigationAbstract/NavigationAbstract.component";
import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import PropTypes from "prop-types";
import { createRef } from "react";
import { connect } from "react-redux";
import { matchPath, withRouter } from "react-router";
import {
  TYPE_ACCOUNT,
  TYPE_BRAND,
  TYPE_CART,
  TYPE_CATEGORY,
  TYPE_HOME,
  TYPE_PRODUCT,
} from "Route/UrlRewrites/UrlRewrites.config";
import { isArabic } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";
import isMobile from "Util/Mobile";
import "./HeaderMainSection.style";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";

export const mapStateToProps = (state) => ({
  activeOverlay: state.OverlayReducer.activeOverlay,
  chosenGender: state.AppState.gender,
  displaySearch: state.PDP.displaySearch,
});

export const mapDispatchToProps = (dispatch) => ({
  showPDPSearch: (displaySearch) =>
    PDPDispatcher.setPDPShowSearch({ displaySearch }, dispatch),
});

class HeaderMainSection extends NavigationAbstract {
  static propTypes = {
    activeOverlay: PropTypes.string.isRequired,
    changeMenuGender: PropTypes.func,
  };

  static defaultProps = {
    changeMenuGender: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      prevScrollpos: window.pageYOffset,
      visible: false,
      type: null,
      delay: 150,
      lastProduct: null,
      lastCategory: null,
      search: "",
      showSearch: false,
      showPLPSearch: false,
      isArabic: isArabic(),
      signInPopUp: "",
      showPopup: false,
      isMobile: isMobile.any(),
    };

    this.headerSearchRef = createRef();
  }

  stateMap = {
    [DEFAULT_STATE_NAME]: {
      account: true,
      cart: true,
      wishlist: true,
      gender: true,
      logo: true,
    },
  };

  renderMap = {
    gender: this.renderGenderSwitcher.bind(this),
    logo: this.renderLogo.bind(this),
    leftContainer: this.renderLeftContainer.bind(this),
    // search: this.renderSearch.bind(this),
    back: this.renderBack.bind(this),
  };

  renderLeftContainer() {
    if (this.isPDP() && isMobile.any()) {
      return null;
    }
    return (
      <div block="leftContainer" key="leftContainer">
        {this.renderAccount()}
        {this.renderCart()}
        {this.renderWishlist()}
        {this.renderSearchIcon()}
      </div>
    );
  }

  showMyAccountPopup = () => {
    this.setState({ showPopup: true });
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
  // state = {

  // };

  handleScroll = () => {
    // return
    // if (!this.isPDP()) {
    //   return;
    // }
    // const { prevScrollpos, isMobile } = this.state;
    // const currentScrollPos = window.pageYOffset;
    // const visible = prevScrollpos < currentScrollPos;
    // this.setState({
    //   prevScrollpos: currentScrollPos,
    //   visible: isMobile && visible,
    // });
  };

  componentDidMount() {
    if (isMobile.any()) {
      this.setState({ showSearch: true });
    }
    window.addEventListener("scroll", this.handleScroll);
    const { delay } = this.state;
    this.timer = setInterval(this.tick, delay);
  }

  componentDidUpdate(prevState) {
    const { delay } = this.state;
    if (prevState !== delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, delay);
    }
  }

  componentWillUnmount() {
    this.timer = null;
    window.removeEventListener("scroll", this.handleScroll);
  }

  tick = () => {
    this.setState({
      type: this.getPageType(),
      lastCategory: this.getCategory(),
      lastProduct: this.getProduct(),
    });
  };

  isPLP() {
    const { type } = this.state;
    // updated this.props with window. in case of any issue need to verify this in future
    const {
      location: { search, pathname = "" },
    } = this.props;
    return TYPE_CATEGORY === type && (search || pathname.includes("?q="));
  }

  isPDP() {
    const { type } = this.state;
    return TYPE_PRODUCT === type;
  }

  getPageType() {
    if (location.pathname === "/" || location.pathname === "") {
      return TYPE_HOME;
    }
    if (matchPath(location.pathname, "/shop-by-brands")) {
      return TYPE_BRAND;
    }
    if (matchPath(location.pathname, "/my-account")) {
      return TYPE_ACCOUNT;
    }
    if (matchPath(location.pathname, "/cart")) {
      return TYPE_CART;
    }
    if (matchPath(location.pathname, "/viewall") || location.search.includes("?q=")) {
      return TYPE_CATEGORY;
    }
    return window.pageType;
  }

  getCategory() {
    return BrowserDatabase.getItem("CATEGORY_NAME") || "";
  }

  getProduct() {
    return BrowserDatabase.getItem("PRODUCT_NAME") || "";
  }

  setMainContentPadding(px = "0") {
    document.documentElement.style.setProperty("--main-content-padding", px);
  }

  renderAccount() {
    const isFooter = false;

    return <HeaderAccount key="account"  isFooter={isFooter} isMobile />;
  }

  renderCart() {
    return (
      <HeaderCart
        key="cart"
        CartButton="CartButton"
        showCartPopUp={!(isMobile.any() || isMobile.tablet())}
      />
    );
  }

  renderWishlist() {
    return <HeaderWishlist key="wishlist" isMobile />;
  }

  renderGenderSwitcher() {
    const { changeMenuGender, activeOverlay, displaySearch } = this.props;
    const { showPLPSearch } = this.state;
    if (isMobile.any() && activeOverlay === MOBILE_MENU_SIDEBAR_ID) {
      return null;
    }

    return (this.isPLP() ||
      this.isPDP() ||
      this.getPageType() === TYPE_BRAND ||
      showPLPSearch) &&
      isMobile.any() ? null : (
      <HeaderGenders
        key="genders"
        isMobile
        changeMenuGender={changeMenuGender}
      />
    );
  }

  renderLogo() {
    const { isArabic, showPLPSearch } = this.state;
    const { changeMenuGender } = this.props;

    if (isMobile.any()) {
      if (showPLPSearch) {
        this.setMainContentPadding("150px");
        
        return <HeaderLogo key="logo" />;

      } else if (this.isPLP() && !showPLPSearch) {
        this.setMainContentPadding("150px");

        return <HeaderLogo key="logo" />;
      }
      if (this.isPDP()) {
        const pagePDPTitle = String(this.getProduct()).toUpperCase();

        this.setMainContentPadding("50px");
        return (
          <span block="CategoryTitle" mods={{ isArabic, isPDP: true }}>
            {pagePDPTitle}
          </span>
        );
      }
    }

    this.setMainContentPadding("150px");

    return <HeaderLogo key="logo" />;
  }

  backFromPLP = () => {
    const { history, chosenGender } = this.props;

    switch (chosenGender) {
      case "women":
        history.push("/women.html");
        break;
      case "men":
        history.push("/men.html");
        break;
      case "kids":
        history.push("/kids.html");
        break;
      case "home":
        history.push("/home.html");
        break;
        case "all":
          history.push("/");
          break;
      default:
        history.push("/");
    }
  };

  renderBack() {
    const { history, displaySearch } = this.props;
    const { isArabic, showPLPSearch } = this.state;
    if (this.isPDP() && isMobile.any()) {
      return null;
    }
    return this.isPLP() || this.isPDP() || showPLPSearch ? (
      <div block="BackArrow" mods={{ isArabic }} key="back">
        <button block="BackArrow-Button" onClick={history.goBack}>
          <p>{__("Back")}</p>
        </button>
      </div>
    ) : null;
  }

  handleSearchClick = () => {
    const { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  };

  handlePLPSearchClick = () => {
    this.setState({ showPLPSearch: true }, () => {
      document.getElementById("search-field").focus();
      document.body.style.overflow = "hidden";
    });
  };

  handleHomeSearchClick = (status) => {
    this.setState({ showPLPSearch: status });
  };

  hideSearchBar = () => {
    this.setState({
      showSearch: false,
      showPLPSearch: false
    });
  };

  hidePDPSearchBar = () => {
    const { showPDPSearch } = this.props;
    showPDPSearch(false);
    this.setState({
      showPLPSearch: false,
    });
    document.body.style.overflow = "visible";
  };

  renderSearchIcon() {
    const { isArabic, showPLPSearch } = this.state;
    if ((isMobile.any() && !this.isPLP()) || showPLPSearch) {
      return null;
    }
    return (
      <div block="SearchIcon" mods={{ isArabic: isArabic }}>
        <button
          block="SearchIcon"
          onClick={
            isMobile.any()
              ? this.handlePLPSearchClick.bind(this)
              : this.handleSearchClick.bind(this)
          }
          elem="Button"
          aria-label="PLP Search Button"
          role="button"
        ></button>
      </div>
    );
  }

  renderDesktopSearch() {
    const { showSearch } = this.state;
    if (isMobile.any()) {
      return null;
    }
    if (!showSearch) {
      return null;
    }

    return (
      <div block="DesktopSearch">
        <HeaderSearch
          hideSearchBar={this.hideSearchBar}
          renderMySignInPopup={this.showMyAccountPopup}
          focusInput={true}
          key="searchDesktop"
        />
      </div>
    );
  }

  renderSearch = () => {
    const { displaySearch } = this.props;
    const { showPLPSearch } = this.state;
    const isPDPSearchVisible = this.isPDP() && displaySearch;
    let isPDP = this.isPDP();
    if (isMobile.any() || isMobile.tablet()) {
      return this.isPLP() && !showPLPSearch ? null : (
        <div block="HeaderSearchSection" mods={{ isPDPSearchVisible, isPDP }}>
          <HeaderSearch
            key="search"
            isPLP={this.isPLP() && showPLPSearch}
            isPDP={this.isPDP()}
            handleHomeSearchClick={this.handleHomeSearchClick}
            isPDPSearchVisible={isPDPSearchVisible}
            hideSearchBar={this.hidePDPSearchBar}
            focusInput={isPDPSearchVisible ? true : false}
          />
        </div>
      );
    }

    return null;
  };

  getHeaderMainSectionVisibility = () => {
    const { visible } = this.state;
    const { displaySearch } = this.props;

    if (this.isPDP()) {
      if (!displaySearch) {
        return visible;
      }
    }
    return true;
  };

  render() {
    const pageWithHiddenHeader = [TYPE_CART, TYPE_ACCOUNT];
    const { signInPopUp, showPLPSearch } = this.state;
    const { displaySearch } = this.props;
    const isPDPSearchVisible = this.isPDP() && displaySearch;
    return pageWithHiddenHeader.includes(this.getPageType()) &&
      isMobile.any() ? null : (
      <>
        <div
          block="HeaderMainSection"
          mods={{ showPLPSearch }}
          data-visible={this.getHeaderMainSectionVisibility()}
        >
          {this.renderMySignInPopup()}
          {this.renderNavigationState()}
          {this.renderDesktopSearch()}
        </div>
        {this.renderSearch()}
      </>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HeaderMainSection)
);
