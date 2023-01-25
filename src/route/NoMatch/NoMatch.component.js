/**
 * @category  sixth-street
 * @author    Vladislavs Belavskis <info@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import Image from "Component/Image";

import ContentWrapper from "Component/ContentWrapper";
import { TYPE_NOTFOUND } from "../UrlRewrites/UrlRewrites.config";
import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";

import pageNotFound from "./images/pagenotfound.png";
import pageNotFoundSVG from "./images/No_Results.svg";

import "./NoMatch.style.override";

import { connect } from "react-redux";
import { withRouter } from "react-router";
import { HOME_STATIC_FILE_KEY } from "Route/HomePage/HomePage.config";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import BrowserDatabase from "Util/BrowserDatabase";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import { getStaticFile } from "Util/API/endpoint/StaticFiles/StaticFiles.endpoint";
import { setLastTapItemOnHome } from "Store/PLP/PLP.action";
import DynamicContent from "Component/DynamicContent";
import Event, { EVENT_PAGE_NOT_FOUND } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = () => ({});
export const mapDispatchToProps = (dispatch) => ({
  setLastTapItemOnHome: (item) => dispatch(setLastTapItemOnHome(item)),
});

export class NoMatch extends PureComponent {
  static propTypes = {
    updateBreadcrumbs: PropTypes.func.isRequired,
    cleanUpTransition: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
  };
  state = {
    gender: "",
    isArabic: isArabic(),
    notFoundWidgetData: [],
  };

  setLastTapItem = (item) => {
    this.props.setLastTapItemOnHome(item);
  };
  pathname;

  componentDidMount() {
    this.addTag();
    this.updateBreadcrumbs();
    this.updateHeaderState();
    this.cleanUpTransition();
    window.pageType = TYPE_NOTFOUND;
    this.requestNoMatchWidgetData();
    Event.dispatch(EVENT_PAGE_NOT_FOUND, location.pathname || "");
    Moengage.track_event(EVENT_PAGE_NOT_FOUND, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      search_term: location.pathname || "",
      app6thstreet_platform: "Web",
    });
  }

  addTag() {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    if (meta) {
      document.head.append(meta);
    }
  }

  removeTag() {
    const tags = document.querySelectorAll("meta[name=robots]");
    if (tags) {
      tags.forEach((tag) => {
        tag.remove();
      });
    }
  }

  componentWillUnmount() {
    window.pageType = undefined;
    this.removeTag();
  }

  cleanUpTransition() {
    const { cleanUpTransition } = this.props;

    cleanUpTransition();
  }

  updateHeaderState() {
    const { changeHeaderState } = this.props;

    changeHeaderState({
      name: DEFAULT_STATE_NAME,
      isHiddenOnMobile: true,
    });
  }

  updateBreadcrumbs() {
    const { updateBreadcrumbs } = this.props;
    const breadcrumbs = [
      {
        url: "",
        name: __("Not Found"),
      },
      {
        url: "/",
        name: __("Home"),
      },
    ];

    updateBreadcrumbs(breadcrumbs);
  }

  getDevicePrefix() {
    return isMobile.any() ? "m/" : "d/";
  }
  async requestNoMatchWidgetData() {
    const { isArabic } = this.state;
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "Home";
    this.setState({ gender });
    const devicePrefix = this.getDevicePrefix();

    // if (gender) {
    try {
      const notFoundWidget = await getStaticFile(HOME_STATIC_FILE_KEY, {
        $FILE_NAME: `${devicePrefix}not_found.json`,
        //$FILE_NAME: `${devicePrefix}${gender}.json`,
      });

      if (typeof notFoundWidget === "object") {
        // let newWidgetData = notFoundWidget.filter((data)=>{
        //     return data.type=== "grid" && data.tag.includes("Home") || data.type=== "vue_recently_viewed_slider"
        // })
        // const exploreMore = {
        //   ......
        // }
        // newWidgetData.push(exploreMore);
        this.setState({ notFoundWidgetData: notFoundWidget[gender] || [] });
      } else {
        this.setState({ notFoundWidgetData: [] });
      }
    } catch (e) {
      this.setState({ notFoundWidgetData: [] });
      console.error(e);
    }
    // } else {
    //   this.setState({ notFoundWidgetData: [] });
    // }
  }
  renderDynamicBanners() {
    const { gender, notFoundWidgetData } = this.state;
    return notFoundWidgetData.length ? (
      <>
        <DynamicContent
          gender={gender}
          content={notFoundWidgetData}
          setLastTapItemOnHome={this.setLastTapItem}
        />
      </>
    ) : null;
  }

  render() {
    return (
      <main block="NoMatch" aria-label={__("Page not found")}>
        <ContentWrapper
          //mix={{ block: "NoMatch" }}
          wrapperMix={{
            block: "NoMatch",
            elem: "Wrapper",
          }}
          label={__("Page Not Found Content")}
        >
          {/* <div block="NoMatch">
            <div block="NoMatch-PageNotFound">
              <h4 block="PageNotFound-Title">
                {__("we are sorry!")}
                <span>{__("error 404!")}</span>
              </h4>
              <div block="PageNotFound">
                <Image lazyLoad={true} src={pageNotFound} alt="pageNotFound" />

              </div>
              <span block="PageNotFound-SubTitle">
                {__("this page could not be found :(")}
              </span>
              <p block="PageNotFound-Content">
                {__(
                  "Can't find what you need? Take a moment\nand do a search or start from our homepage"
                )}
              </p>
              <a block="PageNotFound-LinkHome" href="/">
                {__("back to homepage")}
              </a>
            </div>
          </div> */}
          <div block="NotFoundContent">
            <div block="notFoundImage">
              <Image lazyLoad={true} src={pageNotFoundSVG} alt="pageNotFound" />
            </div>
            <h4 block="Title">{__("Oops! Nothing here.")}</h4>
            <p block="SubTitle">{__("Here are some products you may like.")}</p>
          </div>
          {this.renderDynamicBanners()}
        </ContentWrapper>
      </main>
    );
  }
}

//export default NoMatch;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NoMatch)
);
