import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import TinySlider from 'tiny-slider-react';

import Image from 'Component/Image';
import Link from 'Component/Link';
import { formatCDNLink } from 'Util/Url';

import 'react-circular-carousel/dist/index.css';
import './DynamicContentCircleInfluencerSlider.style';

const settings = {
    lazyload: true,
    nav: false,
    mouseDrag: true,
    controlsText: ["&#x27E8", "&#x27E9"],
    responsive: {
        1024:{
            items: 8
        },
        420: {
            items: 4
        }
    }
};

class DynamicContentCircleInfluencerSlider extends PureComponent {
    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.shape({
                image_url: PropTypes.string,
                label: PropTypes.string,
                link: PropTypes.string,
                plp_config: PropTypes.shape({}) // TODO: describe
            })
        ).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            influencerContent: [],
            isLoading: true
        };
    }

    async requestDynamicContent(isUpdate = false) {


        if (isUpdate) {
            // Only set loading if this is an update
            this.setState({ isLoading: true });
        }

        try {
            const dynamicContent = await getStaticFile(
                'influencer',
                { $FILE_NAME: `/collections/influencer.json` }
                // { $FILE_NAME: `http://mobilecdn.6thstreet.com/resources/20190121/en-ae/women.json` }

            );

            this.setState({
                influencerContent: Array.isArray(dynamicContent) ? dynamicContent : [],
                isLoading: false
            });
        } catch (e) {
            // TODO: handle error
            Logger.log(e);
        }
    }

    componentDidMount(){

    }

    renderCircle = (item, i) => {
        const {
            link,
            label,
            image_url,
            plp_config
        } = item;

        // TODO: move to new component

        return (
            <div block="CircleSlider" key={i}>

                <Link
                  to={ formatCDNLink(link) }
                  key={ i }
                  onClick={ () => {
                      this.clickLink(item);
                  } }

                >
                    <Image lazyLoad={true}
                      src={ image_url }
                      alt={ label }
                      mix={ { block: 'DynamicContentCircleItemSlider', elem: 'Image' } }
                      ratio="custom"
                      height="80px"
                      width="80px"
                    />
                    { /* <button
                  block="DynamicContentCircleItemSlider"
                  elem="Label"
                  mix={ { block: 'button primary' } }
                >
                    { label }
                </button> */ }
                </Link>
                <div block="CircleSliderLabel">{ label }</div>
            </div>
        );
    };

    renderCircles() {
        const { items = [] } = this.props;
        return (
            <TinySlider settings={ settings } block="CircleSliderWrapper">
                { items.map(this.renderCircle) }
            </TinySlider>
        );
    }

    render() {
        return (
            <div block="DynamicContentCircleItemSlider">
                { this.renderCircles() }
            </div>
        );
    }
}

export default DynamicContentCircleInfluencerSlider;
