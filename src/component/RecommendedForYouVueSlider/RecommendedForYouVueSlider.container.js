import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import RecommendedForYouVueSlider from "./RecommendedForYouVueSlider.component";

export const mapStateToProps = (state) => ({});

export class RecommendedForYouVueSliderContainer extends PureComponent {
  static propTypes = {
    withViewAll: PropTypes.bool,
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    widgetID: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
    pageType: PropTypes.string.isRequired,
  };

  static defaultProps = {
    sliderLength: 10,
    withViewAll: false,
  };

  render() {
    return <RecommendedForYouVueSlider {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  null
)(RecommendedForYouVueSliderContainer);
