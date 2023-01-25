import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { setGender } from "Store/AppState/AppState.action";
import { toggleOverlayByKey } from "Store/Overlay/Overlay.action";
import { setLastTapItemOnHome } from "Store/PLP/PLP.action";

import HeaderMenu from "./HeaderMenu.component";

export const mapStateToProps = (state) => ({
  activeOverlay: state.OverlayReducer.activeOverlay,
  gender: state.AppState.gender,
});

export const mapDispatchToProps = (_dispatch) => ({
  toggleOverlayByKey: (key) => _dispatch(toggleOverlayByKey(key)),
  setGender: (gender) => _dispatch(setGender(gender)),
  setLastTapItemOnHome: (item) => _dispatch(setLastTapItemOnHome(item)),
});

export class HeaderMenuContainer extends PureComponent {
  static propTypes = {
    activeOverlay: PropTypes.string.isRequired,
    newMenuGender: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
  };

  containerProps = () => {
    const { activeOverlay, newMenuGender, gender } = this.props;
    return { activeOverlay, newMenuGender, gender };
  };

  render() {
    return <HeaderMenu {...this.props} {...this.containerProps()} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderMenuContainer);
