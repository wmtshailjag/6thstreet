import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import isMobile from "Util/Mobile";
import { isArabic } from "Util/App";
import './CircleItemSliderSubPage.style';
import Image from "Component/Image";

class CircleItemSliderSubPage extends PureComponent {
    static propTypes = {
        url: PropTypes.string.isRequired
    };

    componentDidMount() {
        let ele = document.getElementById("CircleItemSliderSubPage-Video")
        if (ele) {
            ele.controls = false,
                ele.playsinline = true,
                ele.muted = true,
                ele.loop = true,
                ele.autoplay = true,
                ele.setAttribute("muted", ""),
                ele.setAttribute("playsinline", "")

            setTimeout(() => {
                const promise = ele.play();
            }, 0)

        }
    }

    render() {
        let banner = this.props?.bannerData.plp_config && this.props.bannerData.plp_config?.banner;
        if(banner ===  undefined) {
            return null;
        }
        let url = banner?.url
        let mWidth = (screen.width - 50).toString() + "px"
        let mHeight = ((screen.width - 50) / banner?.aspect_ratio).toString() + "px"
        let isMobileWithImage = isMobile.any() && (banner?.type === "image")
        return (
            <div block="CircleItemSliderSubPage">
                <div block="CircleItemSliderSubPage-Video" >
                    {
                        banner?.type === "image" ?
                            <img src={url} style={isMobile.any() && { height: mHeight, width: mWidth }} alt={"bannerImage"}/>
                            :
                            <video id="CircleItemSliderSubPage-Video" style={isMobile.any() && { height: mHeight, width: mWidth }}>
                                <source src={url} type="video/mp4" />
                            </video>
                    }
                </div>
                <div block="CircleItemSliderSubPage-Discription">
                    <h2 block="CircleItemSliderSubPage-Discription" elem="Title" mods={{ isArabic: isArabic() }}>{banner?.title}</h2>
                    <p block="CircleItemSliderSubPage-Discription" elem="Desc" mods={{ isArabic: isArabic() }}>{banner?.description}</p>
                </div>

            </div>
        );
    }
}

export default CircleItemSliderSubPage;
