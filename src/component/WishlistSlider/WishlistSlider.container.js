import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import WishlistSlider from "./WishlistSlider.component";

export const mapStateToProps = (state) => ({});

export class WishlistSliderContainer extends PureComponent {
  static propTypes = {
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
  };

  static defaultProps = {
    sliderLength: 10,
  };

  render() {
    return <WishlistSlider {...this.props} />;
  }
}

export default connect(mapStateToProps, null)(WishlistSliderContainer);
