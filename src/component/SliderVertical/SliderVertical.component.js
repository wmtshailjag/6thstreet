/* eslint-disable react/no-unused-state */

/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from "prop-types";
import { Children, createRef, PureComponent } from "react";

import Draggable from "Component/Draggable";
import { ChildrenType, MixType } from "Type/Common";
import CSS from "Util/CSS";

import {
  ACTIVE_SLIDE_PERCENT,
  ANIMATION_DURATION,
} from "./SliderVertical.config";

import "./SliderVertical.style";

/**
 * Slider component
 * @class Slider
 */
export class SliderVertical extends PureComponent {
  static propTypes = {
    showCrumbs: PropTypes.bool,
    activeImage: PropTypes.number,
    onActiveImageChange: PropTypes.func,
    mix: MixType,
    children: ChildrenType.isRequired,
    isInteractionDisabled: PropTypes.bool,
  };

  static defaultProps = {
    activeImage: 0,
    onActiveImageChange: () => {},
    showCrumbs: false,
    isInteractionDisabled: false,
    mix: {},
  };

  sliderHeight = 0;

  prevPosition = 0;

  draggableRef = createRef();

  sliderRef = createRef();

  handleDragStart = this.handleInteraction.bind(this, this.handleDragStart);

  handleDrag = this.handleInteraction.bind(this, this.handleDrag);

  handleDragEnd = this.handleInteraction.bind(this, this.handleDragEnd);

  renderCrumb = this.renderCrumb.bind(this);

  isSlider = this.isSlider.bind(this);

  constructor(props) {
    super(props);

    const { activeImage } = this.props;

    this.state = {
      draggableRef: null,
      prevActiveImage: activeImage,
      height: 0,
      sliderChildren: [],
      sliderHeightChildren: null,
      sliderHeight: null,
      count: 0,
      countPerPage: 0,
      isArrowUpHidden: true,
      isArrowDownHidden: false,
      isSlider: false,
      oldTranslate: 0,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { activeImage } = props;
    const { prevActiveImage, sliderChildren = [], isSlider } = state;
    if (!sliderChildren) {
      return;
    }
    if (!isSlider) {
      return {
        isArrowUpHidden: true,
        isArrowDownHidden: true,
      };
    }

    if (prevActiveImage !== activeImage) {
      return {
        prevActiveImage: activeImage,
        isArrowUpHidden: activeImage === 0,
        isArrowDownHidden: activeImage === sliderChildren.length - 1,
      };
    }

    return {
      isArrowUpHidden: activeImage === 0,
      isArrowDownHidden: activeImage === sliderChildren.length - 1,
    };
  }

  componentDidMount() {
    const { children } = this.props;
    let timer = children.length > 4 ? 2000 : 0;
    setTimeout(() => {
      const { draggableRef, sliderRef } = this;
      const sliderChildren = draggableRef?.current?.children;
      const sliderHeightChildren =
        draggableRef?.current?.children[0]?.offsetHeight;
      const sliderHeight = sliderRef?.current?.offsetHeight;
      // eslint-disable-next-line no-magic-numbers
      const countPerPage = Math.floor(sliderHeight / sliderHeightChildren) || 3;

      this.setState({
        draggableRef,
        sliderChildren,
        sliderHeightChildren,
        sliderHeight,
        countPerPage,
        count: countPerPage,
      });

      if (!sliderChildren || !sliderChildren[0]) {
        return;
      }

      sliderChildren[0].onload = () => {
        CSS.setVariable(
          this.sliderRef,
          "slider-width",
          `${sliderChildren[0].offsetHeight}px`
        );
      };

      setTimeout(() => {
        CSS.setVariable(
          this.sliderRef,
          "slider-width",
          `${sliderChildren[0].offsetHeight}px`
        );
      }, ANIMATION_DURATION);
    }, timer);
  }

  componentDidUpdate(prevProps) {
    const { activeImage } = this.props;
    const { activeImage: prevActiveImage } = prevProps;

    const {
      draggableRef,
      sliderChildren = [],
      sliderHeightChildren,
      count,
      countPerPage,
      isSlider,
    } = this.state;

    if (isSlider) {
      if (activeImage > prevActiveImage) {
        this.handleSliderDown(
          activeImage,
          count,
          sliderChildren,
          countPerPage,
          sliderHeightChildren,
          draggableRef,
          prevActiveImage
        );
      }

      if (activeImage < prevActiveImage) {
        this.handleSliderUp(
          activeImage,
          count,
          countPerPage,
          sliderHeightChildren,
          draggableRef,
          prevActiveImage
        );
      }
    }
  }

  handleSliderDown = (
    activeImage,
    count,
    sliderChildren = [],
    countPerPage,
    sliderHeightChildren,
    draggableRef,
    prevActiveImage
  ) => {
    if (activeImage >= count && draggableRef) {
      const { oldTranslate } = this.state;
      const newTranslate =
        sliderChildren.length - count < countPerPage
          ? oldTranslate -
            (sliderChildren.length - count) * sliderHeightChildren
          : oldTranslate - countPerPage * sliderHeightChildren;

      CSS.setVariable(
        draggableRef,
        "animation-speed",
        `${Math.abs((prevActiveImage - activeImage) * ANIMATION_DURATION)}ms`
      );

      CSS.setVariable(draggableRef, "translateY", `${newTranslate}px`);

      if (activeImage === sliderChildren.length - 1) {
        this.setState({
          prevActiveImage: activeImage,
          count: sliderChildren.length,
          isArrowDownHidden: activeImage === sliderChildren.length - 1,
          oldTranslate: newTranslate,
        });
      } else {
        this.setState({
          prevActiveImage: activeImage,
          count:
            count + countPerPage > sliderChildren.length
              ? sliderChildren.length
              : count + countPerPage,
          isArrowDownHidden: activeImage === sliderChildren.length - 1,
          oldTranslate: newTranslate,
        });
      }
    }
  };

  handleSliderUp = (
    activeImage,
    count,
    countPerPage,
    sliderHeightChildren,
    draggableRef,
    prevActiveImage
  ) => {
    const { oldTranslate } = this.state;
    if (activeImage <= count - countPerPage - 1) {
      const newTranslate =
        count <= countPerPage * 2
          ? 0
          : oldTranslate + countPerPage * sliderHeightChildren;

      CSS.setVariable(
        draggableRef,
        "animation-speed",
        `${Math.abs((prevActiveImage - activeImage) * ANIMATION_DURATION)}ms`
      );

      CSS.setVariable(draggableRef, "translateY", `${newTranslate}px`);

      if (newTranslate === 0) {
        this.setState({
          prevActiveImage: activeImage,
          count: countPerPage,
          isArrowUpHidden: activeImage === 0,
          oldTranslate: newTranslate,
        });
      } else {
        this.setState({
          prevActiveImage: activeImage,
          count: count - countPerPage,
          isArrowUpHidden: activeImage === 0,
          oldTranslate: newTranslate,
        });
      }
    }
  };

  isSlider() {
    const { children = [] } = this.props;
    const { countPerPage } = this.state;

    this.setState({ isSlider: countPerPage < children.length });
  }

  onArrowUpClick = () => {
    const { onActiveImageChange, activeImage } = this.props;
    onActiveImageChange(activeImage - 1);
  };

  onArrowDownClick = () => {
    const { onActiveImageChange, activeImage } = this.props;
    onActiveImageChange(activeImage + 1);
  };

  getFullSliderHeight() {
    const fullSliderHeight = this.draggableRef.current.scrollHeight;
    return fullSliderHeight - this.sliderHeight;
  }

  calculateNextSlide(state) {
    const {
      translateY: translate,
      lastTranslateY: lastTranslate,
      isSlider,
    } = state;

    if (isSlider) {
      const { onActiveImageChange } = this.props;

      const slideSize = this.sliderHeight;

      const fullSliderSize = this.getFullSliderHeight();

      const activeSlidePosition = translate / slideSize;
      const activeSlidePercent = Math.abs(activeSlidePosition % 1);
      const isSlideBack = translate > lastTranslate;

      if (translate >= 0) {
        onActiveImageChange(0);
        return 0;
      }

      if (translate < -fullSliderSize) {
        const activeSlide = Math.round(fullSliderSize / -slideSize);
        onActiveImageChange(-activeSlide);
        return activeSlide;
      }

      if (isSlideBack && activeSlidePercent < 1 - ACTIVE_SLIDE_PERCENT) {
        const activeSlide = Math.ceil(activeSlidePosition);
        onActiveImageChange(-activeSlide);
        return activeSlide;
      }

      if (!isSlideBack && activeSlidePercent > ACTIVE_SLIDE_PERCENT) {
        const activeSlide = Math.floor(activeSlidePosition);
        onActiveImageChange(-activeSlide);
        return activeSlide;
      }

      const activeSlide = Math.round(activeSlidePosition);
      onActiveImageChange(-activeSlide);
      return activeSlide;
    }

    return null;
  }

  handleDragStart() {
    CSS.setVariable(this.draggableRef, "animation-speed", "0");
  }

  handleDrag(state) {
    const { translateY, isSlider } = state;

    if (isSlider) {
      const translate = translateY;

      const fullSliderSize = this.getFullSliderHeight();

      if (translate < 0 && translate > -fullSliderSize) {
        CSS.setVariable(this.draggableRef, "translateY", `${translate}px`);
      }
    }
  }

  handleDragEnd(state, callback) {
    const activeSlide = this.calculateNextSlide(state);

    const slideSize = this.sliderHeight;

    const newTranslate = activeSlide * slideSize;

    CSS.setVariable(this.draggableRef, "animation-speed", "300ms");

    CSS.setVariable(this.draggableRef, "translateY", `${newTranslate}px`);

    callback({
      originalY: newTranslate,
      lastTranslateY: newTranslate,
    });
  }

  handleClick = (state, callback, e) => {
    if (e.type === "contextmenu") {
      this.handleDragEnd(state, callback);
    }
  };

  handleInteraction(callback, ...args) {
    const { isInteractionDisabled } = this.props;

    if (isInteractionDisabled || !callback) {
      return;
    }

    callback.call(this, ...args);
  }

  changeActiveImage(activeImage) {
    const { onActiveImageChange } = this.props;
    onActiveImageChange(activeImage);
  }

  renderCrumbs() {
    const { children = [] } = this.props;
    if (children.length <= 1) {
      return null;
    }

    return (
      <div block="SliderVertical" elem="Crumbs">
        {Children.map(children, this.renderCrumb)}
      </div>
    );
  }

  renderCrumb(_, i) {
    const { activeImage } = this.props;
    const isActive = i === Math.abs(-activeImage);

    return (
      <button
        block="SliderVertical"
        elem="Image"
        mods={{ type: "single" }}
        // eslint-disable-next-line react/jsx-no-bind
        onClick={() => this.changeActiveImage(i)}
      >
        <div block="SliderVertical" elem="Crumb" mods={{ isActive }} />
      </button>
    );
  }

  render() {
    const { showCrumbs, mix, activeImage, children } = this.props;

    const { isArrowUpHidden, isArrowDownHidden } = this.state;

    this.isSlider();

    return (
      <div block="SliderVertical" mix={mix} ref={this.sliderRef}>
        <button
          block="SliderVertical"
          elem="ButtonUp"
          mods={{ isArrowUpHidden }}
          onClick={this.onArrowUpClick}
        >
          <div block="SliderVertical" elem="ArrowUp" />
        </button>
        <Draggable
          mix={{ block: "SliderVertical", elem: "Wrapper" }}
          draggableRef={this.draggableRef}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          onDrag={this.handleDrag}
          onClick={this.handleClick}
          shiftX={-activeImage * this.sliderHeight}
        >
          {children}
        </Draggable>
        <button
          block="SliderVertical"
          elem="ButtonDown"
          mods={{ isArrowDownHidden }}
          onClick={this.onArrowDownClick}
        >
          <div block="SliderVertical" elem="ArrowDown" />
        </button>
        {showCrumbs && this.renderCrumbs()}
      </div>
    );
  }
}

export default SliderVertical;
