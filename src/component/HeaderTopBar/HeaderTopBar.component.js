import PropTypes from "prop-types";
import { Fragment } from "react";
import { withRouter } from "react-router";
import { getCountryFromUrl } from "Util/Url/Url";
import CountrySwitcher from "Component/CountrySwitcher";
import InlineCustomerSupport from "Component/InlineCustomerSupport";
import LanguageSwitcher from "Component/LanguageSwitcher";
import NavigationAbstract from "Component/NavigationAbstract/NavigationAbstract.component";
import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import isMobile from "Util/Mobile";

import "./HeaderTopBar.style";

const settings = {
  loop: true,
  autoplay: true,
  axis: "vertical",
  items: 1,
  edgePadding: 10,
  autoHeight: true,
  autoplayTimeout: 3000,
  speed: 1000,
};
class HeaderTopBar extends NavigationAbstract {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  stateMap = {
    [DEFAULT_STATE_NAME]: {
      support: true,
      cms: true,
      store: true,
    },
  };

  state = {
    isOnMobile: false,
    pageYOffset: 0,
    isHidden: false,
  };

  renderMap = {
    support: this.renderCustomerSupport.bind(this),
    cms: this.renderCmsBlock.bind(this),
    store: this.renderStoreSwitcher.bind(this),
  };

  static getDerivedStateFromProps(props) {
    const { location } = props;

    return location.pathname !== "/" && isMobile.any()
      ? {
          isOnMobile: true,
        }
      : {
          isOnMobile: false,
        };
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const { pageYOffset } = this.state;

    this.setState({
      isHidden: window.pageYOffset > pageYOffset,
      pageYOffset: window.pageYOffset,
    });
  };

  renderCmsBlock() {
    // TODO: find out what is this, render here
    let country = getCountryFromUrl();
    let txt = {
      AE: __("FREE SHIPPING OVER AED199"),
      SA: __("FREE SHIPPING OVER SAR199"),
      KW: __("FREE SHIPPING OVER KWD20"),
      QA: __("FREE SHIPPING OVER QAR199"),
      OM: __("FREE SHIPPING OVER OMR20"),
      BH: __("FREE SHIPPING OVER BHD20.5"),
    };
    return (
      <div className="customVerticalSlider" key="cms-block">
        <div className="carouselItemInner">
          <div block="HeaderTopBar" elem="CmsBlock">
            {__("800+ GLOBAL BRANDS")}
          </div>
          <div block="HeaderTopBar" elem="CmsBlock">
            {__("100-DAY FREE RETURNS")}
          </div>
          <div block="HeaderTopBar" elem="CmsBlock">
            {__("CLUB APPAREL REWARDS")}
          </div>
          {country ? (
            <div block="HeaderTopBar" elem="CmsBlock">
              {txt[country]}
            </div>
          ) : (
            " "
          )}
          {getCountryFromUrl() === "QA" ? (
            <div block="HeaderTopBar" elem="CmsBlock">
              {__("CASH ON RECEIVING")}
            </div>
          ) : (
            <div block="HeaderTopBar" elem="CmsBlock">
              {__("CASH ON DELIVERY")}
            </div>
          )}

          <div block="HeaderTopBar" elem="CmsBlock">
            {__("ALL PRICES ARE INCLUSIVE OF VAT")}
          </div>
        </div>
      </div>
    );
  }

  renderCustomerSupport() {
    return <InlineCustomerSupport key="support" {...this.props} />;
  }

  renderStoreSwitcher() {
    return (
      <Fragment key="store-switcher">
        <div block="Switcher">
          <LanguageSwitcher />
          <CountrySwitcher />
        </div>
      </Fragment>
    );
  }

  isHidden = () => {
    const {
      location: { pathname },
    } = this.props;
    if (
      isMobile.any() &&
      !(
        pathname === "/" ||
        pathname === "" ||
        pathname === "/women.html" ||
        pathname === "/men.html" ||
        pathname === "/kids.html" ||
        pathname === "/home.html" ||
        pathname.includes("catalogsearch")
      )
    ) {
      return true;
    }
    return false;
  };

  render() {
    return (
      <div block="HeaderTopBar" mods={{ isHidden: this.isHidden() }}>
        <div block="HeaderTopBar" elem="ContentWrapper">
          {this.renderNavigationState()}
        </div>
      </div>
    );
  }
}

export default withRouter(HeaderTopBar);
