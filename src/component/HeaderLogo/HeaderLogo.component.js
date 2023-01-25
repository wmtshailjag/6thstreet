import Image from "Component/Image";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { withRouter } from "react-router";
import { isArabic } from "Util/App";
import "./HeaderLogo.style";
import logo from "./logo/6thstreet_logo.png";
import BrowserDatabase from "Util/BrowserDatabase";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import Event,{ EVENT_TOP_NAV_DEFAULT,EVENT_GTM_TOP_NAV_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class HeaderLogo extends PureComponent {
  static propTypes = {
    setGender: PropTypes.func.isRequired,
    setPrevPath: PropTypes.func.isRequired,
  };

  state = {
    isArabic: isArabic(),
  };

  handleLinkOnClick = (path) => {
    const { setGender, setPrevPath } = this.props;
    const genderDefault = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";
    setGender();
    setPrevPath(path);
    Moengage.track_event(EVENT_TOP_NAV_DEFAULT, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: this.getPageType(),
      category: genderDefault || "",
      app6thstreet_platform: "Web",
    });
    Event.dispatch(EVENT_GTM_TOP_NAV_CLICK, EVENT_TOP_NAV_DEFAULT);
  };

  getPageType() {
    const { urlRewrite, currentRouteName } = window;

    if (currentRouteName === "url-rewrite") {
      if (typeof urlRewrite === "undefined") {
        return "";
      }

      if (urlRewrite.notFound) {
        return "notfound";
      }

      return (urlRewrite.type || "").toLowerCase();
    }

    return (currentRouteName || "").toLowerCase();
  }

  render() {
    const { isArabic } = this.state;
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";
    if (gender === "all") {
      return (
        <Link
          to={`/`}
          block="HeaderLogo"
          mods={{ isArabic }}
          onClick={() => this.handleLinkOnClick(window.location.href)}
        >
          <Image
            lazyLoad={true}
            mix={{ block: "Image", mods: { isArabic } }}
            src={logo}
            alt={"6thstreet_logo"}
          />
        </Link>
      );
    }
    return (
      <Link
        to={`/${gender}.html`}
        block="HeaderLogo"
        mods={{ isArabic }}
        onClick={() => this.handleLinkOnClick(window.location.href)}
      >
        <Image
          lazyLoad={true}
          mix={{ block: "Image", mods: { isArabic } }}
          src={logo}
          alt={"6thstreet_logo"}
        />
      </Link>
    );
  }
}

export default withRouter(HeaderLogo);
