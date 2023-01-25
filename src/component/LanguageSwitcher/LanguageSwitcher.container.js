import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { getCountryLocaleForSelect } from "Util/API/endpoint/Config/Config.format";
import { Config } from "Util/API/endpoint/Config/Config.type";
import {
  setCountry,
  setLanguageForWelcome,
} from "Store/AppState/AppState.action";
import LanguageSwitcher from "./LanguageSwitcher.component";
import Event, {
  EVENT_MOE_SET_LANGUAGE,
  EVENT_LANGUAGE_CHANGE,
  EVENT_GTM_TOP_NAV_CLICK,
} from "Util/Event";
import { getCountryFromUrl } from "Util/Url/Url";
import Loader from "Component/Loader";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  language: state.AppState.language,
  country: state.AppState.country,
});

export const mapDispatchToProps = (dispatch) => ({
  setCountry: (value) => dispatch(setCountry(value)),
  setLanguageForWelcome: (value) => dispatch(setLanguageForWelcome(value)),
});

export class LanguageSwitcherContainer extends PureComponent {
  static propTypes = {
    config: Config.isRequired,
    language: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  };

  containerFunctions = {
    onLanguageSelect: this.onLanguageSelect.bind(this),
  };

  state = {
    isLoad: false,
  };

  timer = null;

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onLanguageSelect(value) {
    const { language = "", history } = this.props;
    this.setState({ isLoad: true });
    Moengage.track_event(EVENT_MOE_SET_LANGUAGE, {
      country: getCountryFromUrl().toUpperCase(),
      language: value.toUpperCase() || "",
      app6thstreet_platform: "Web",
    });

    const eventData = {
      name: EVENT_LANGUAGE_CHANGE,
      value: value.toUpperCase(),
    };
    Event.dispatch(EVENT_GTM_TOP_NAV_CLICK, eventData);

    const pageUrl = new URL(window.location.href);
    if (
      window.location.href.includes("en-") ||
      window.location.href.includes("ar-")
    ) {
      if (location.pathname.match(/my-account/)) {
        this.timer = setTimeout(() => {
          // Delay is for Moengage call to complete
          window.location.href = location.href
            .replace(language.toLowerCase(), value, location.href)
            .split("/my-account")[0];
        }, 1000);
      } else if (location.pathname.match(/viewall/)) {
        this.timer = setTimeout(() => {
          // Delay is for Moengage call to complete
          window.location.href = location.href
            .replace(language.toLowerCase(), value, location.href)
            .split("/viewall")[0];
        }, 1000);
      } else if (pageUrl.pathname == "/catalogsearch/result/") {
        const pagePath = pageUrl.origin;
        this.timer = setTimeout(() => {
          // Delay is for Moengage call to complete
          window.location.href = pagePath.replace(
            language.toLowerCase(),
            value,
            pagePath
          );
        }, 1000);
      } else if (
        pageUrl.search &&
        pageUrl.search.length > 0 &&
        pageUrl.pathname !== "/catalogsearch/result/"
      ) {
        const pagePath = pageUrl.origin + pageUrl.pathname;
        this.timer = setTimeout(() => {
          // Delay is for Moengage call to complete
          window.location.href = pagePath.replace(
            language.toLowerCase(),
            value,
            pagePath
          );
        }, 1000);
      } else {
        this.timer = setTimeout(() => {
          // Delay is for Moengage call to complete
          window.location.href = location.href.replace(
            language.toLowerCase(),
            value,
            location.href
          );
        }, 1000);
      }
    } else {
      this.props.setLanguageForWelcome(value);
    }
    this.timer = setTimeout(() => {
      this.setState({ isLoad: false });
    }, 1000);
  }

  containerProps = () => {
    const { language, config, country, welcomePagePopup, isWelcomeMobileView } =
      this.props;

    return {
      languageSelectOptions: getCountryLocaleForSelect(config, country),
      language,
      welcomePagePopup,
      isWelcomeMobileView,
    };
  };

  render() {
    const { isLoad } = this.state;
    return (
      <>
        <LanguageSwitcher
          {...this.containerFunctions}
          {...this.containerProps()}
        />
        <Loader isLoading={isLoad} />
      </>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LanguageSwitcherContainer)
);
