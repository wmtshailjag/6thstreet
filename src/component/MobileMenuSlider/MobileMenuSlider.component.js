import { ANIMATION_DURATION } from 'Component/Slider/Slider.config';
import { Slider } from 'SourceComponent/Slider/Slider.component';
import CSS from 'Util/CSS';

export class MobileMenuSlider extends Slider {
    componentDidUpdate(prevProps) {
        const { activeImage: prevActiveImage } = prevProps;
        const { activeImage } = this.props;

        if (activeImage !== prevActiveImage) {
            const newTranslate = -activeImage * this.draggableRef.current.children[0].offsetWidth;

            CSS.setVariable(
                this.draggableRef,
                'animation-speed',
                `${ Math.abs((prevActiveImage - activeImage) * ANIMATION_DURATION) }ms`
            );

            CSS.setVariable(
                this.draggableRef,
                'translateX',
                `${newTranslate < 0 ? newTranslate : 0}px`
            );
        }
    }

    handleDrag(state) {             
        const fullSliderSize = this.getFullSliderWidth();
        const { activeImage } = this.props;
        const { lastTranslateX, translateX } = state;
        const activeSlide = activeImage + (lastTranslateX > translateX ? 1 : -1);
        const newTranslate = activeSlide * (this.draggableRef.current.children[0].offsetWidth);

        if (newTranslate < 0 && newTranslate > -fullSliderSize) {
            CSS.setVariable(
                this.draggableRef,
                'translateX',
                `${newTranslate}px`
            );
        }
    }

    handleDragEnd(state, callback) {        
        const { lastTranslateX, translateX } = state;
        const { onActiveImageChange, activeImage } = this.props;
        const direction = lastTranslateX > translateX ? 1 : -1;
        const activeSlide = activeImage + direction;
        const newTranslate = -activeSlide * (this.draggableRef.current.children[0].offsetWidth);

        CSS.setVariable(this.draggableRef, 'animation-speed', '300ms');        
        if(newTranslate == -0){
            return null
        }

        CSS.setVariable(
            this.draggableRef,
            'translateX',
            `${newTranslate < 0 ? newTranslate : 0}px`
        );

        callback({
            originalX: newTranslate,
            lastTranslateX: newTranslate
        });

        onActiveImageChange(direction);
    }
}

export default MobileMenuSlider;
