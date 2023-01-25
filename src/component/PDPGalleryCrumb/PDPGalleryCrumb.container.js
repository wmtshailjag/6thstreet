import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { setPDPGaleryImage } from "Store/PDP/PDP.action";
import { Product } from "Util/API/endpoint/Product/Product.type";

import PDPGalleryCrumb from "./PDPGalleryCrumb.component";
import {
  GALLERY_IMAGE_TYPE,
  GALLERY_VIDEO_TYPE,
} from "./PDPGalleryCrumb.config";

export const mapStateToProps = (state) => ({
  product: state.PDP.product,
  currentIndex: state.PDP.imageIndex,
});

export const mapDispatchToProps = (dispatch) => ({
  setImageIndex: (index) => dispatch(setPDPGaleryImage(index)),
});

export class PDPGalleryCrumbContainer extends PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired,
    currentIndex: PropTypes.number.isRequired,
    product: Product.isRequired,
    setImageIndex: PropTypes.func.isRequired,
    activeImage: PropTypes.number,
  };

  static defaultProps = {
    activeImage: 0,
  };

  indexTypeMap = {
    [GALLERY_VIDEO_TYPE]: {
      type: GALLERY_VIDEO_TYPE,
      optionsGetter: this.getVideoTypeOptions.bind(this),
    },
  };

  containerFunctions = {
    onClick: this.onClick.bind(this),
  };

  onClick() {
    const { index, onSlideChange, ResetTheZoomInValue,isZoomIn } = this.props;

    if(isZoomIn) ResetTheZoomInValue();

    return onSlideChange(index);
  }

  containerProps = () => ({
    ...this.getTypeAndOptions(),
    isActive: this.getIsActive(),
    product:this.props.product
  });

  getVideoTypeOptions() {
    // TODO: implement
  }

  // getImageTypeOptions() {
  // const {
  // index,
  // product: {
  // gallery_images = []
  // }
  // } = this.props;

  // return {
  // src: gallery_images[index]
  // };
  // }
  getImageTypeOptions() {
    let finalSrc;
    const {
      index,
      product: { gallery_images = [] },
      src,
    } = this.props;
    if (gallery_images[index]) {
      finalSrc = gallery_images[index];
    } else if (src) {
      finalSrc = src;
    }
    return { src: finalSrc };
  }
  getTypeAndOptions() {
    const { index } = this.props;

    const { type, optionsGetter } = this.indexTypeMap[index] || {
      type: GALLERY_IMAGE_TYPE,
      optionsGetter: this.getImageTypeOptions.bind(this),
    };

    return {
      type,
      options: optionsGetter() || {},
    };
  }

  getIsActive() {
    const { index, currentIndex } = this.props;
    return index === currentIndex;
  }

  render() {
    return (
      <PDPGalleryCrumb
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PDPGalleryCrumbContainer);
