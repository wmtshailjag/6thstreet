/* eslint-disable react/no-unused-state */
import { Slider as SourceSlider } from 'SourceComponent/Slider/Slider.component';
import CSS from 'Util/CSS';

import 'SourceComponent/Slider/Slider.style';

export class SliderHomepage extends SourceSlider {
    handleDragEnd(state, callback) {
        const activeSlide = this.calculateNextSlide(state);

        const slideSize = this.sliderWidth;

        // eslint-disable-next-line
        const newTranslate = activeSlide * (slideSize - 30);

        CSS.setVariable(this.draggableRef, 'animation-speed', '300ms');

        CSS.setVariable(
            this.draggableRef,
            'translateX',
            `${newTranslate}px`
        );

        callback({
            originalX: newTranslate,
            lastTranslateX: newTranslate
        });
    }
}

export default SliderHomepage;
