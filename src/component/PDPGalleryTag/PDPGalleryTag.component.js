import PropTypes from "prop-types";
import { PureComponent } from "react";
import "./PDPGalleryTag.style";

class PDPGalleryTag extends PureComponent {
  static propTypes = {
    tag: PropTypes.string,
  };

  render() {
    const { tag } = this.props;
    if (!tag) {
      return null;
    }
    return (
      <div block="PDPGalleryTag">
        <span block="PDPGalleryTag" elem="Tag">
          {tag}
        </span>
      </div>
    );
  }
}

export default PDPGalleryTag;
