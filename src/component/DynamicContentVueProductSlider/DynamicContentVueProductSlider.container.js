import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import DynamicContentVueProductSlider from "./DynamicContentVueProductSlider.component";
import { getUUIDToken } from "Util/Auth";

export const mapStateToProps = (state) => ({});

export class DynamicContentVueProductSliderContainer extends PureComponent {
  static propTypes = {
    withViewAll: PropTypes.bool,
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    widgetID: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
    pageType: PropTypes.string.isRequired,
    index: PropTypes.number,
    product: PropTypes.object,
  };

  static defaultProps = {
    sliderLength: 10,
    withViewAll: true,
    product: {},
  };

  render() {
    return <DynamicContentVueProductSlider {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  null
)(DynamicContentVueProductSliderContainer);
