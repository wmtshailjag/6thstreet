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

import PropTypes from 'prop-types';
import { Children } from 'react';

import Draggable from 'Component/Draggable';
import SliderVertical from 'Component/SliderVertical';
import { ChildrenType, MixType } from 'Type/Common';
import CSS from 'Util/CSS';

import {
    ANIMATION_DURATION
} from './SliderHorizontal.config';

import './SliderHorizontal.style';

/**
 * Slider component
 * @class Slider
 */
export class SliderHorizontal extends SliderVertical {
    static propTypes = {
        showCrumbs: PropTypes.bool,
        activeImage: PropTypes.number,
        onActiveImageChange: PropTypes.func,
        mix: MixType,
        children: ChildrenType.isRequired,
        isInteractionDisabled: PropTypes.bool,
        isZoomEnabled: PropTypes.bool.isRequired
    };

    static defaultProps = {
        activeImage: 0,
        onActiveImageChange: () => {},
        showCrumbs: false,
        isInteractionDisabled: false,
        mix: {}
    };

    componentDidMount() {
        const { draggableRef, sliderRef } = this;
        const sliderChildren = draggableRef.current.children;
        const sliderWidthChildren = draggableRef.current.children[0].offsetWidth;
        const sliderWidth = sliderRef.current.offsetWidth;
        // eslint-disable-next-line no-magic-numbers
        const countPerPage = Math.floor(sliderWidth / sliderWidthChildren);

        this.setState({
            draggableRef,
            sliderChildren,
            sliderHeightChildren: sliderWidthChildren,
            sliderHeight: sliderWidth,
            countPerPage,
            count: countPerPage
        });

        if (!sliderChildren || !sliderChildren[0]) {
            return;
        }

        sliderChildren[0].onload = () => {
            CSS.setVariable(this.sliderRef, 'slider-height', `${sliderChildren[0].offsetWidth}px`);
        };

        setTimeout(() => {
            CSS.setVariable(this.sliderRef, 'slider-height', `${sliderChildren[0].offsetWidth}px`);
        }, ANIMATION_DURATION);
    }

    isSlider() {
        const { children = [], isZoomEnabled } = this.props;
        const { countPerPage } = this.state;

        if (!isZoomEnabled) {
            this.setState({ isSlider: countPerPage < children.length });
        } else {
            this.setState({ isSlider: false });
        }
    }

    renderCrumbs() {
        const { children = [] } = this.props;
        if (children.length <= 1) {
            return null;
        }

        return (
            <div
              block="SliderHorizontal"
              elem="Crumbs"
            >
                { Children.map(children, this.renderCrumb) }
            </div>
        );
    }

    renderCrumb(_, i) {
        const { activeImage } = this.props;
        const isActive = i === Math.abs(-activeImage);

        return (
            <button
              block="SliderHorizontal"
              elem="Image"
              mods={ { type: 'single' } }
              // eslint-disable-next-line react/jsx-no-bind
              onClick={ () => this.changeActiveImage(i) }
              key={i}
            >
                <div
                  block="SliderHorizontal"
                  elem="Crumb"
                  mods={ { isActive } }
                />
            </button>
        );
    }

    render() {
        const {
            showCrumbs,
            mix,
            activeImage,
            children
        } = this.props;

        const { isArrowUpHidden, isArrowDownHidden } = this.state;

        this.isSlider();

        return (
            <div
              block="SliderHorizontal"
              mix={ mix }
              ref={ this.sliderRef }
            >
                <button
                  block="SliderHorizontal"
                  elem="ButtonLeft"
                  mods={ { isArrowUpHidden } }
                  onClick={ this.onArrowUpClick }
                >
                    <div block="SliderHorizontal" elem="ArrowLeft" />
                </button>
                <Draggable
                  mix={ { block: 'SliderHorizontal', elem: 'Wrapper' } }
                  draggableRef={ this.draggableRef }
                  onDragStart={ this.handleDragStart }
                  onDragEnd={ this.handleDragEnd }
                  onDrag={ this.handleDrag }
                  onClick={ this.handleClick }
                  shiftX={ -activeImage * this.sliderWidth }
                >
                    { children }
                </Draggable>
                <button
                  block="SliderHorizontal"
                  elem="ButtonRight"
                  mods={ { isArrowDownHidden } }
                  onClick={ this.onArrowDownClick }
                >
                    <div block="SliderHorizontal" elem="ArrowRight" />
                </button>
                { showCrumbs && this.renderCrumbs() }
            </div>
        );
    }
}

export default SliderHorizontal;
