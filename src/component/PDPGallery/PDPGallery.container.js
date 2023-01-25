import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { setPDPGaleryImage } from "Store/PDP/PDP.action";
import { Product } from "Util/API/endpoint/Product/Product.type";
import PDPGallery from "./PDPGallery.component";
import {
  TYPE_HOME,
} from 'Route/UrlRewrites/UrlRewrites.config';
export const mapStateToProps = (state) => ({
  currentIndex: state.PDP.imageIndex,
  isLoading: state.PDP.isLoading,
  product: state.PDP.product,
  chosenGender: state.AppState.gender,
});

export const mapDispatchToProps = (_dispatch) => ({
  setImageIndex: (index) => _dispatch(setPDPGaleryImage(index)),
});

export class PDPGalleryContainer extends PureComponent {
  static propTypes = {
    currentIndex: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    product: Product.isRequired,
    setImageIndex: PropTypes.func.isRequired,
    index: PropTypes.number,
  };

  static defaultProps = {
    index: 0,
  };

  containerFunctions = {
    onSliderChange: this.onSliderChange.bind(this),
    homeFromPDP: this.homeFromPDP.bind(this)
  };

  containerProps = () => {
    const { currentIndex, product, renderMySignInPopup } = this.props;

    return {
      gallery: this.getGallery(),
      prod_style_video: this.getStyleVideo(),
      prod_360_video: this.get360Video(),
      crumbs: this.getCrumbs(),
      currentIndex,
      product,
      renderMySignInPopup
    };
  };

  homeFromPDP() {
    const { chosenGender, history } = this.props;
    window.pageType = TYPE_HOME
    switch (chosenGender) {
      case "women":
        history.push("/women.html");
        break;
      case "men":
        history.push("/men.html");
        break;
      case "kids":
        history.push("/kids.html");
        break;
      case "home":
        history.push("/home.html");
        break;
      case "all":
          history.push("/");
          break;
      default:
        history.push("/");
    }
  };

  onSliderChange(activeSlide) {
    const { setImageIndex } = this.props;

    return setImageIndex(activeSlide);
  }

  getCrumbs() {
    // TODO: determine if has video append it here
    const galleryCrumbs = Object.values(this.getGallery() || {});
    return galleryCrumbs;
  }

  getGallery() {
    const {
      isLoading,
      product: { gallery_images = [] },
    } = this.props;
    if (isLoading || gallery_images.length === 0) {
      return Array.from({ length: 4 });
    }

    return gallery_images;
  }

  getStyleVideo() {
    const {
      isLoading,
      product: { prod_style_video = "" },
    } = this.props;

    if (isLoading || !prod_style_video) {
      return "";
    }

    return prod_style_video;
  }

  get360Video() {
    const {
      isLoading,
      product: { prod_360_video = "" },
    } = this.props;

    if (isLoading || !prod_360_video) {
      return "";
    }

    return prod_360_video;
  }

  render() {
    const {
      product: { sku = "" },
    } = this.props;

    return (
      <PDPGallery
        {...this.containerFunctions}
        {...this.containerProps()}
        sku={sku}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PDPGalleryContainer);
