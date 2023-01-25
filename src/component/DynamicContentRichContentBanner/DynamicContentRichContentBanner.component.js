import cx from "classnames";
import {
  HOME_PAGE_BANNER_CLICK_IMPRESSIONS,
  HOME_PAGE_BANNER_IMPRESSIONS,
} from "Component/GoogleTagManager/events/BannerImpression.event";
import Image from "Component/Image";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import TinySlider from "tiny-slider-react";
import { formatCDNLink } from "Util/Url";
import "react-circular-carousel/dist/index.css";
import DynamicContentHeader from "../DynamicContentHeader/DynamicContentHeader.component";
import DynamicContentFooter from "../DynamicContentFooter/DynamicContentFooter.component";
import Event, { EVENT_GTM_BANNER_CLICK } from "Util/Event";
// import VueIntegrationQueries from "Query/vueIntegration.query";
// import { getUUID } from "Util/Auth";
import "./DynamicContentRichContentBanner.style";

const settings = {
  lazyload: true,
  mouseDrag: true,
  touch: true,
  // controlsText: ["&#x27E8", "&#x27E9"],
  nav: true,
  loop: true,
  navPosition: "bottom",
  autoplay: false,
  responsive: {
    1025: {
      items: 2,
      gutter: 30,
    },
    768: {
      items: 2,
      gutter: 20,
    },
    767: {
      items: 1,
    },
  },
};

class DynamicContentRichContentBanner extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        image_url: PropTypes.string,
        label: PropTypes.string,
        link: PropTypes.string,
        plp_config: PropTypes.shape({}), // TODO: describe
      })
    ).isRequired,
  };
  state = {
    impressionSent: false,
  };

  componentDidMount() {
    this.registerViewPortEvent();
  }

  registerViewPortEvent() {
    let observer;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    observer = new IntersectionObserver(this.handleIntersect, options);
    observer.observe(this.viewElement);
  }
  sendImpressions() {
    const { items = [] } = this.props;
    const getStoreName = this.props?.promotion_name
      ? this.props?.promotion_name
      : "";
    const getIndexId = this.props?.index ? this.props.index : "";
    items.forEach((item, index) => {
      Object.assign(item, {
        store_code: getStoreName,
        indexValue: index + 1,
        default_Index: getIndexId,
      });
    });
    Event.dispatch(HOME_PAGE_BANNER_IMPRESSIONS, items);
    this.setState({ impressionSent: true });
  }
  handleIntersect = (entries, observer) => {
    const { impressionSent } = this.state;
    if (impressionSent) {
      return;
    }
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.sendImpressions();
      }
    });
  };
  onclick = (item) => {
    let banner = {
      link: item.link,
      promotion_name: item.promotion_name,
    };
    Event.dispatch(EVENT_GTM_BANNER_CLICK, banner);
    this.sendBannerClickImpression(item);
    const { index } = this.props;
    this.props.setLastTapItemOnHome(`DynamicContentRichContentBanner${index}`);
  };

  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderCircle = (item, i) => {
    const { link, title, image_url, plp_config, width, height } = item;

    const linkTo = {
      pathname: formatCDNLink(link),
      state: { plp_config },
    };

    let ht, wd;
    if (screen.width > 900 && item) {
      let ht1 = (item.height / item.width) * 600;
      ht = ht1.toString() + "px";
      wd = "600px";
    } else {
      ht = screen.width.toString() + "px";
      wd = screen.width.toString() + "px";
    }
    return (
      <div block="CircleSlider" key={i}>
        <Link
          to={formatCDNLink(item.button.link)}
          key={i}
          data-banner-type="richContentBanner"
          data-promotion-name={item.promotion_name ? item.promotion_name : ""}
          data-tag={item.tag ? item.tag : ""}
          onClick={() => {
            this.onclick(item);
          }}
        >
          <div block="ImageContainer">
            <Image
              lazyLoad={true}
              src={image_url}
              alt={title}
              mix={{ block: "DynamicContentRichContentBanner", elem: "Image" }}
            />

            {item.tag && (
              <div
                block={cx("Tag", {
                  "Tag-TopLeft": item.tag.position === "top_left",
                  "Tag-TopRight": item.tag.position === "top_right",
                  "Tag-TopCenter": item.tag.position === "top_center",
                  "Tag-BottomLeft": item.tag.position === "bottom_left",
                  "Tag-BottomRight": item.tag.position === "bottom_right",
                  "Tag-BottomCenter": item.tag.position === "bottom_center",
                })}
              >
                {item.tag.label}
              </div>
            )}
          </div>
        </Link>
        <div block="Label" className="customTag">
          {item.title && <p block="Label-Title">{item.title}</p>}
          {item.subtitle && <p block="Label-SubTitle">{item.subtitle}</p>}
          {item.button && (
            <Link
              to={formatCDNLink(item.button.link)}
              className="Label-Button"
              data-banner-type="Label-Button"
              onClick={() => {
                this.onclick(item);
              }}
            >
              {item.button.label}
            </Link>
          )}
        </div>
      </div>
    );
  };

  renderCircles() {
    const { items = [] } = this.props;
    return (
      <TinySlider settings={settings} block="CircleSliderWrapper">
        {items.map(this.renderCircle)}
      </TinySlider>
    );
  }

  render() {
    let setRef = (el) => {
      this.viewElement = el;
    };
    const { index } = this.props;
    return (
      <div
        ref={setRef}
        block="DynamicContentRichContentBanner"
        id={`DynamicContentRichContentBanner${index}`}
      >
        {this.props.header && (
          <DynamicContentHeader header={this.props.header} />
        )}
        {this.renderCircles()}
        {this.props.footer && (
          <DynamicContentFooter footer={this.props.footer} />
        )}
      </div>
    );
  }
}

export default DynamicContentRichContentBanner;
