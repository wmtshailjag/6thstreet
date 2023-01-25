import DragScroll from "Component/DragScroll/DragScroll.component";
import {
  HOME_PAGE_BANNER_CLICK_IMPRESSIONS,
  HOME_PAGE_BANNER_IMPRESSIONS,
} from "Component/GoogleTagManager/events/BannerImpression.event";
// import VueIntegrationQueries from "Query/vueIntegration.query";
// import { getUUID } from "Util/Auth";
import Image from "Component/Image";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { isArabic } from "Util/App";
import Event, { EVENT_GTM_BANNER_CLICK } from "Util/Event";
import { formatCDNLink } from "Util/Url";
import DynamicContentFooter from "../DynamicContentFooter/DynamicContentFooter.component";
import DynamicContentHeader from "../DynamicContentHeader/DynamicContentHeader.component";
import "./DynamicContentSliderWithLabel.style";

class DynamicContentSliderWithLabel extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        label: PropTypes.string,
        link: PropTypes.string,
        plp_config: PropTypes.shape({}), // TODO: describe
      })
    ).isRequired,
  };

  constructor(props) {
    super(props);
    this.cmpRef = React.createRef();
    this.scrollerRef = React.createRef();
    this.itemRef = React.createRef();
    this.state = {
      activeClass: false,
      isDown: false,
      startX: 0,
      scrollLeft: 0,
      isArabic: isArabic(),
      screenWidth: window.innerWidth,
      minusWidth: 690,
      settings: {
        lazyload: true,
        nav: false,
        mouseDrag: true,
        touch: true,
        controlsText: ["&#x27E8", "&#x27E9"],
        gutter: 8,
        loop: false,
        responsive: {
          1024: {
            items: 5,
            gutter: 25,
          },
          420: {
            items: 5,
          },
          300: {
            items: 2.3,
          },
        },
      },
      impressionSent: false,
    };
  }

  componentDidMount() {
    if (this.props.items.length < 8) {
      let setting = JSON.parse(JSON.stringify(this.state.settings));
      setting.responsive[1024].items = this.props.items.length;
      this.setState((prevState) => ({
        ...prevState,
        settings: {
          ...prevState.settings,
          responsive: {
            ...prevState.settings.responsive,
            1024: {
              ...prevState.settings.responsive[1024],
              items: this.props.items.length,
            },
          },
        },
      }));
    }
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
    const { index } = this.props;
    let banner = {
      link: item.link,
      promotion_name: item.promotion_name,
    };
    Event.dispatch(EVENT_GTM_BANNER_CLICK, banner);
    this.sendBannerClickImpression(item);
    this.props.setLastTapItemOnHome(`DynamicContentSliderWithLabel${index}`);
  };
  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderSliderWithLabel = (item, i) => {
    const { link, text, url, plp_config, height, width, text_align } = item;
    const { isArabic } = this.state;
    let parseLink = link;
    const wd = `${width.toString()}px`;
    const ht = `${height.toString()}px`;
    return (
      <div
        block="SliderWithLabel"
        mods={{ isArabic }}
        ref={this.itemRef}
        key={i * 10}
      >
        <Link
          to={formatCDNLink(parseLink)}
          key={i * 10}
          block="SliderWithLabel"
          elem="Link"
          data-banner-type="sliderWithLabel"
          data-promotion-name={item.promotion_name ? item.promotion_name : ""}
          data-tag={item.tag ? item.tag : ""}
          onClick={() => {
            this.onclick(item);
          }}
        >
          <Image
            lazyLoad={true}
            src={url}
            alt={text}
            block="Image"
            style={{ maxWidth: wd }}
          />
        </Link>
        {text ? (
          <div block="SliderText" style={{ textAlign: text_align }}>
            {text}
          </div>
        ) : null}
      </div>
    );
  };

  handleContainerScroll = (event) => {
    const target = event.nativeEvent.target;
    if (this.scrollerRef && this.scrollerRef.current) {
      this.scrollerRef.current.scrollLeft = target.scrollLeft;
    }
  };

  handleScroll = (event) => {
    const target = event.nativeEvent.target;
    const prentComponent = [...this.cmpRef.current.childNodes].filter(
      (node) => node.className == "SliderWithLabelWrapper"
    )[0];
    prentComponent && (prentComponent.scrollLeft = target.scrollLeft);
  };
  checkWidth(){
    const { screenWidth, minusWidth } = this.state;
    if(screenWidth > 1500){
      this.setState({minusWidth: 590});
    }else if(screenWidth < 1400){
      this.setState({minusWidth: 660});
    }
  }
  renderScrollbar = () => {
    const { items = [] } = this.props;
    this.checkWidth();
    const { minusWidth } = this.state;

    const width = `${(this.itemRef.current && this.itemRef.current.clientWidth) *
      items.length +
      items.length * 7 * 2 -
      minusWidth
      }px`;
    return (
      <div
        block="Outer"
        mods={{
          Hidden:
            this.scrollerRef.current &&
            this.scrollerRef.current.clientWidth >= width,
        }}
        ref={this.scrollerRef}
        onScroll={this.handleScroll}
      >
        <div block="Outer" style={{ width: width }} elem="Inner"></div>
      </div>
    );
  };

  renderSliderWithLabels() {
    const { items = [], title } = this.props;

    return (
      <DragScroll
        data={{ rootClass: "SliderWithLabelWrapper", ref: this.cmpRef }}
      >
        <div
          block="SliderWithLabelWrapper"
          id="SliderWithLabelWrapper"
          ref={this.cmpRef}
          onScroll={this.handleContainerScroll}
        >
          <div className="SliderHelper"></div>
          {items.map(this.renderSliderWithLabel)}
          <div className="SliderHelper"></div>
        </div>
        {this.renderScrollbar()}
      </DragScroll>
    );
  }

  render() {
    let setRef = (el) => {
      this.viewElement = el;
    };
    const { isArabic } = this.state;
    const { index } = this.props;
    return (
      <div
        ref={setRef}
        block="DynamicContentSliderWithLabel"
        id={`DynamicContentSliderWithLabel${index}`}
      >
        {this.props.header && (
          <DynamicContentHeader header={this.props.header} />
        )}
        {this.props.title && (
          <h1 block="Title" mods={{ isArabic }}>
            {this.props.title}
          </h1>
        )}
        {this.renderSliderWithLabels()}
        {this.props.footer && (
          <DynamicContentFooter footer={this.props.footer} />
        )}
      </div>
    );
  }
}

export default DynamicContentSliderWithLabel;
