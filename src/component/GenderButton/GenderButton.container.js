import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { setGender } from "Store/AppState/AppState.action";
import PLPDispatcher from "Store/PLP/PLP.dispatcher";
import GenderButton from "./GenderButton.component";
import { getLocaleFromUrl } from "Util/Url/Url";
import Event, {
  EVENT_MOE_TOP_NAV_CHANGE,
  EVENT_TOP_NAV_HOME,
  EVENT_TOP_NAV_MEN,
  EVENT_TOP_NAV_WOMEN,
  EVENT_TOP_NAV_KIDS,
  EVENT_TOP_NAV_ALL,
  EVENT_GTM_TOP_NAV_CLICK,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = (state) => ({
  currentContentGender: state.AppState.gender,
});

export const mapDispatchToProps = (dispatch) => ({
  setGender: (gender) => dispatch(setGender(gender)),
  requestPLPWidgetData: () => PLPDispatcher.requestPLPWidgetData(dispatch),
});

export class GenderButtonContainer extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
    setGender: PropTypes.func.isRequired,
    currentContentGender: PropTypes.string.isRequired,
    changeMenuGender: PropTypes.func,
    isCurrentGender: PropTypes.bool.isRequired,
    getNewActiveMenuGender: PropTypes.func.isRequired,
    handleUnsetStyle: PropTypes.func.isRequired,
    isUnsetStyle: PropTypes.bool.isRequired,
    gender: PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    onClick: () => {},
    changeMenuGender: () => {},
  };

  containerFunctions = {
    onGenderClick: this.onGenderClick.bind(this),
    onGenderEnter: this.onGenderEnter.bind(this),
    onGenderLeave: this.onGenderLeave.bind(this),
  };

  containerProps = () => {
    const {
      gender: { label, key },
      isCurrentGender,
      isUnsetStyle,
    } = this.props;

    return {
      label,
      urlKey: key,
      isCurrentGender,
      isUnsetStyle,
    };
  };
  sendNavigationImpressions(label) {
    const MoeGenderEvent =
      label == "women"
        ? EVENT_TOP_NAV_WOMEN
        : label == "men"
        ? EVENT_TOP_NAV_MEN
        : label == "kids"
        ? EVENT_TOP_NAV_KIDS
        : label == "all"
        ? EVENT_TOP_NAV_ALL
        : label == "home"
        ? EVENT_TOP_NAV_HOME
        : "";
    const genderChangeEvent = (event) => {
      Moengage.track_event(event, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        screen_name: this.getPageType(),
        ...(event == EVENT_MOE_TOP_NAV_CHANGE && { category: label || "" }),
        app6thstreet_platform: "Web",
      });
    };
    if (MoeGenderEvent && MoeGenderEvent.length > 0) {
      genderChangeEvent(EVENT_MOE_TOP_NAV_CHANGE);
      genderChangeEvent(MoeGenderEvent);
      Event.dispatch(EVENT_GTM_TOP_NAV_CLICK, MoeGenderEvent);
    }
  }
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
  onGenderClick() {
    const {
      onClick,
      setGender,
      requestPLPWidgetData,
      gender: { key },
    } = this.props;

    setGender(key);
    onClick(key);
    this.sendNavigationImpressions(key);
    const locale = getLocaleFromUrl();
    if (locale) {
      requestPLPWidgetData();
    }
  }

  onGenderEnter() {
    const {
      gender: { key },
      changeMenuGender,
      getNewActiveMenuGender,
      handleUnsetStyle,
    } = this.props;

    getNewActiveMenuGender(key);
    changeMenuGender(key);
    handleUnsetStyle(true);
  }

  onGenderLeave() {
    const { handleUnsetStyle, changeMenuGender, currentContentGender } =
      this.props;
    changeMenuGender(currentContentGender);
    handleUnsetStyle(false);
  }

  render() {
    return (
      <GenderButton {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenderButtonContainer);
