import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import TrendingProductsVueSlider from "./TrendingProductsVueSlider.component";

export const mapStateToProps = (state) => ({});

export class TrendingProductsVueSliderContainer extends PureComponent {
  static propTypes = {
    withViewAll: PropTypes.bool,
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    widgetID: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
  };

  static defaultProps = {
    sliderLength: 10,
    withViewAll: false,
  };

  render() {
    return <TrendingProductsVueSlider {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  null
)(TrendingProductsVueSliderContainer);
