/* eslint-disable max-len */
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import { NavigationAbstractContainer } from "Component/NavigationAbstract/NavigationAbstract.container";
import {
  changeNavigationState,
  goToPreviousNavigationState,
} from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import { appendWithStoreCode } from "Util/Url";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";

import Header from "./Header.component";

export const mapStateToProps = (state) => ({
  navigationState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
  activeOverlay: state.OverlayReducer.activeOverlay,
});

export const mapDispatchToProps = (dispatch) => ({
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  hideActiveOverlay: () => dispatch(hideActiveOverlay()),
  setNavigationState: (stateName) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, stateName)),
  goToPreviousNavigationState: () =>
    dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
});

export const DEFAULT_HEADER_STATE = {
  name: DEFAULT_STATE_NAME,
};

export class HeaderContainer extends NavigationAbstractContainer {
  static propTypes = {
    showOverlay: PropTypes.func.isRequired,
    goToPreviousNavigationState: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
  };

  default_state = DEFAULT_HEADER_STATE;

  routeMap = {
    "/": { name: DEFAULT_STATE_NAME },
  };

  componentDidMount() {
    this.handleHeaderVisibility();
  }

  componentDidUpdate(prevProps, prevState) {
    this.handleHeaderVisibility();

  }

  handleHeaderVisibility = () => {
    const {
      navigationState: { isHiddenOnDesktop },
    } = this.props;

    if (isHiddenOnDesktop) {
      document.documentElement.classList.add("hiddenHeader");
      return;
    }

    document.documentElement.classList.remove("hiddenHeader");
  };

  containerFunctions = {
    // getData: this.getData.bind(this)
  };

  containerProps = () => {
    const navigationState = this.getNavigationState();

    return {
      navigationState,
    };
  };

  getNavigationState() {
    const { navigationState } = this.props;

    const { pathname } = location;
    const { state: historyState } = window.history || {};
    const { state = {} } = historyState || {};

    // TODO: something here breaks /<STORE CODE> from being opened, and / when, the url-based stores are enabled.

    const activeRoute = Object.keys(this.routeMap || {}).find(
      (route) =>
        (route !== "/" ||
          pathname === appendWithStoreCode("/") ||
          pathname === "/") &&
        pathname.includes(route)
    );

    if (state.plp_config || state.product || state.popupOpen) {
      // keep state if it something identifying page type is in state
      return navigationState;
    }

    return this.routeMap[activeRoute] || this.default_state;
  }

  render() {
    return <Header {...this.containerFunctions} {...this.containerProps()} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContainer);
