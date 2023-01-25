/* eslint-disable no-magic-numbers */
import PropTypes from "prop-types";
import { createRef, PureComponent } from "react";

import Image from "Component/Image";
import PDPGalleryCrumb from "Component/PDPGalleryCrumb";
import Slider from "Component/Slider";
import SliderHorizontal from "Component/SliderHorizontal";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";

import { ReactComponent as Close } from "./icons/close.svg";
import { ChevronLeft, ChevronRight } from "Component/Icons";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MIN_ZOOM_SCALE, MAX_ZOOM_SCALE } from "./PDPGalleryOverlay.config"

import "./PDPGalleryOverlay.style";

class PDPGalleryOverlay extends PureComponent {
  static propTypes = {
    currentIndex: PropTypes.number.isRequired,
    gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
    crumbs: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ).isRequired,
    onSliderChange: PropTypes.func.isRequired,
    closeGalleryOverlay: PropTypes.func.isRequired,
    isZoomEnabled: PropTypes.bool.isRequired,
    handleZoomChange: PropTypes.func.isRequired,
    disableZoom: PropTypes.func.isRequired,
    isGalleryEmpty: PropTypes.bool.isRequired,
  };

  overlayRef = createRef();


  constructor(props) {
    super(props);
    this.ResetTheZoomInValue = this.ResetTheZoomInValue.bind(this);
    this.hideZoomingGuide = this.hideZoomingGuide.bind(this);
    this.transformWrapperRef = React.createRef();
    this.state = {
      scale: 1,
      positionY: 0,
      positionX: 0,
      addY: 0,
      addX: 0,
      initialScale: 1,
      isMobile: isMobile.any() || isMobile.tablet(),
      isZoomIn: false,
      showZoomingGuide: true
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleArrowKeySlide);
    setTimeout(this.hideZoomingGuide, 1800);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleArrowKeySlide);
  }

  ResetTheZoomInValue() {
    this.setState({isZoomIn:false});
  }

  renderCrumb = (index, i) => {
    const { onSliderChange } = this.props;
    const {isZoomIn} = this.state;
    return (
      <PDPGalleryCrumb
        onSlideChange={onSliderChange}
        key={i}
        // prefer numerical index
        index={+index}
        isZoomIn={isZoomIn}
        block="PDPGalleryCrumb"
        mods={{
          isArabic: isArabic()
        }}
        ResetTheZoomInValue={this.ResetTheZoomInValue}
      />
    );
  };

  renderGalleryImage = (src, i) => <Image lazyLoad={false} src={src} key={i} />;

  renderCrumbs() {
    const {
      crumbs = [],
      currentIndex,
      onSliderChange,
      isZoomEnabled,
    } = this.props;

    return (
      <div block="PDPGalleryOverlay" elem="Crumbs">
        <SliderHorizontal
          mix={{
            block: "Slider",
            mods: {
              isCrumbs: true,
              isArabic: isArabic()
            },
            mix: {
              block: "Slider",
              elem: "Wrapper",
              mods: { isCrumbs: true },
            },
          }}
          activeImage={currentIndex}
          onActiveImageChange={onSliderChange}
          isInteractionDisabled
          isZoomEnabled={isZoomEnabled}
        >
          {crumbs.map(this.renderCrumb)}
        </SliderHorizontal>
      </div>
    );
  }

  onZoomStop({state}) {
    if(state?.scale){
      this.setState({
        scale: state.scale
      });
    }
  }

  hideZoomingGuide() {
    this.setState({showZoomingGuide: false});
  }

  renderGallery() {
    const { gallery = [], isGalleryEmpty } = this.props;
    const { scale, showZoomingGuide} = this.state;
    if (gallery[0] !== undefined && !isGalleryEmpty) {
      return gallery.map((src, i) => {
        const { currentIndex, gallery } = this.props;
        return (
        <div key={i}>
          <TransformWrapper
            ref={this.transformWrapperRef}
            centerOnInit={true}
            centerZoomedOut
            minScale={MIN_ZOOM_SCALE || 1}
            maxScale={MAX_ZOOM_SCALE || 8}
            doubleClick={{
              mode: scale>=MAX_ZOOM_SCALE?'zoomOut':'zoomIn',
            }}
            panning={{
              disabled: isMobile.any()?scale <= MIN_ZOOM_SCALE:false
            }}
            onZoomStop={this.onZoomStop.bind(this)}
          >
            {
              () => (
                <React.Fragment>
                  {
                    showZoomingGuide && scale<=MIN_ZOOM_SCALE && !isMobile.any()
                    ?
                    <div block="ZoomGuide" onClick={this.hideZoomingGuide}>
                      { __("Double Click to Zoom In") }
                    </div>
                    :
                    null
                  }
                  <TransformComponent>
                    <img
                      src={gallery[currentIndex]}
                      block="CurrentImage"
                      mods={{
                        isMaxZoomedIn: scale>=MAX_ZOOM_SCALE
                      }}
                    />
                  </TransformComponent>
                </React.Fragment>
              )
            }
          </TransformWrapper>
        </div >
        )
      })
    }
    return gallery.map(this.renderGalleryImage);
  }

  renderSlider() {
    const {
      gallery = [],
      currentIndex,
      onSliderChange,
      isZoomEnabled,
    } = this.props;

    if (!gallery.length) {
      return null;
    }

    return (
      <Slider
        activeImage={currentIndex}
        onActiveImageChange={onSliderChange}
        mix={{ block: "PDPGalleryOverlay", elem: "Slider" }}
        showCrumbs={false}
        isInteractionDisabled={!isMobile.any()}
      >
        {this.renderGallery()}
      </Slider>
    );
  }
  prev = (e) => {
    e.preventDefault();
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

    const { currentIndex, onSliderChange, gallery = [] } = this.props;

    if (currentIndex === 0) {
      return;
    } else {
      onSliderChange(currentIndex - 1);
    }
  };
  next = (e) => {
    e.preventDefault();
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

    const { currentIndex, onSliderChange, gallery = [] } = this.props;
    if (currentIndex + 1 === gallery.length) {
      return;
    } else {
      onSliderChange(currentIndex + 1);
    }
  };

  handleArrowKeySlide = (e) => {
    const { isMobile } = this.state;
    const { closeGalleryOverlay } = this.props;
    if(isMobile) {
      return;
    }
    switch (e.keyCode) {
      case 27:
        closeGalleryOverlay()
        break;
      case 37:
        this.prev(e);
        break;
      case 39:
        this.next(e);
        break;
    }
  };

  renderPrevButton = () => {
    return (
      <button block="PDPGalleryOverlay" elem="Prev" onClick={this.prev}>
        <ChevronLeft />
      </button>
    );
  };

  renderNextButton = () => {
    return (
      <button block="PDPGalleryOverlay" elem="Next" onClick={this.next}>
        <ChevronRight />
      </button>
    );
  };

  render() {
    const { closeGalleryOverlay } = this.props;

    return (
      <div block="PDPGalleryOverlay">
        <button
          block="PDPGalleryOverlay"
          elem="Button"
          onClick={closeGalleryOverlay}
        >
          <Close />
        </button>
        {this.renderPrevButton()}
        {this.renderNextButton()}
        {this.renderCrumbs()}
        {this.renderSlider()}
      </div>

    );
  }
}

export default PDPGalleryOverlay;
