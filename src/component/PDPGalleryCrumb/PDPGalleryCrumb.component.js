import PropTypes from "prop-types";
import { PureComponent } from "react";

import Image from "Component/Image";

import {
  GALLERY_IMAGE_TYPE,
  GALLERY_VIDEO_TYPE,
} from "./PDPGalleryCrumb.config";

import "./PDPGalleryCrumb.style";

class PDPGalleryCrumb extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    type: PropTypes.number.isRequired,
    options: PropTypes.shape({
      src: PropTypes.string,
    }).isRequired,
  };

  renderMap = {
    [GALLERY_IMAGE_TYPE]: this.renderImage.bind(this),
    [GALLERY_VIDEO_TYPE]: this.renderVideo.bind(this),
  };

  renderVideo() {
    const {
      options: { src },
    } = this.props;
    return "video";
  }

  renderImage() {
    const {
      options: { src },
      product : { name }
    } = this.props;
    if (src.includes("http")) {
      return <Image lazyLoad={false} src={src} alt={name ? name : "product-name"} />;
    } else {
      return (
        <div block="staticDiv">
          <img src={src} className="staticImg" alt={name ? name : "product-name"} />
        </div>
      );
    }
  }

  renderType() {
    const { type } = this.props;
    return this.renderMap[type]();
  }

  render() {
    const { isActive, onClick } = this.props;

    return (
      <button block="PDPGalleryCrumb" mods={{ isActive }} onClick={onClick}>
        {this.renderType()}
      </button>
    );
  }
}

export default PDPGalleryCrumb;
