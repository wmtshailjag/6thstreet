import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { setGender } from "Store/AppState/AppState.action";
import HeaderLogo from "./HeaderLogo.component";
import {
  setPrevPath,
} from "Store/PLP/PLP.action";

export const mapStateToProps = (state) => ({
  gender: state.AppState.gender,
  prevPath: state.PLP.prevPath,
});
export const mapDispatchToProps = (dispatch) => ({
  setGender: (gender) => dispatch(setGender(gender)),
  // prevPath: window.location.href,
  setPrevPath: (prevPath) => dispatch(setPrevPath(prevPath)),
});

class HeaderLogoContainer extends PureComponent {
  static propTypes = {
    setGender: PropTypes.func.isRequired,
  };

  containerFunctions = {
    setGender: this.setGender.bind(this),
    setPrevPath: this.setPrevPath.bind(this),
  };

  setGender() {
    const { setGender, gender } = this.props;

    setGender(gender);
  }

  setPrevPath(path) {
    const {setPrevPath} = this.props;
    setPrevPath(path);
  }
  render() {
    return <HeaderLogo {...this.containerFunctions} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderLogoContainer);