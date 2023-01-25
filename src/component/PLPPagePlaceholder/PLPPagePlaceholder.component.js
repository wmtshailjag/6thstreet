import PropTypes from "prop-types";
import { PureComponent } from "react";
import VisibilitySensor from "react-visibility-sensor";

import "./PLPPagePlaceholder.style";
import isMobile from "Util/Mobile";

class PLPPagePlaceholder extends PureComponent {
  static propTypes = {
    onVisibilityChange: PropTypes.func.isRequired,
  };
  state = {
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  renderPlaceholder = (_, index) => (
    <div block="PLPPagePlaceholder" elem="Section" key={index} />
  );

  renderPlaceholders() {
    const placeholderCount = this.state.isMobile ? 8 : 9;
    return Array.from({ length: placeholderCount }, this.renderPlaceholder);
  }
  renderPlaceholderMobile() {
    const { onVisibilityChange, isFirst } = this.props;
    return (
      <VisibilitySensor
        delayedCall
        partialVisibility={["top", "bottom"]}
        minTopValue="1"
        onChange={onVisibilityChange}
      >
        <div block="PLPPagePlaceholder" mods={{ isFirst }}>
          {this.renderPlaceholders()}
        </div>
      </VisibilitySensor>
    );
  }
  renderPlaceholderDesktop() {
    const { onVisibilityChange, isFirst } = this.props;
    return (
      <div block="PLPPagePlaceholder" mods={{ isFirst }}>
        {this.renderPlaceholders()}
      </div>
    );
  }

  render() {
    return (
      <>
        {!this.state.isMobile
          ? this.renderPlaceholderDesktop()
          : this.renderPlaceholderMobile()}
      </>
    );
  }
}

export default PLPPagePlaceholder;
