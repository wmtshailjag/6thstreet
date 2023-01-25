import {
  HOME_PAGE_BANNER_CLICK_IMPRESSIONS,
  HOME_PAGE_BANNER_IMPRESSIONS,
} from "Component/GoogleTagManager/events/BannerImpression.event";
import Image from "Component/Image";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import Event, { EVENT_GTM_BANNER_CLICK } from "Util/Event";
import isMobile from "Util/Mobile";
import { formatCDNLink } from "Util/Url";
import DynamicContentFooter from "../DynamicContentFooter/DynamicContentFooter.component";
import DynamicContentHeader from "../DynamicContentHeader/DynamicContentHeader.component";
import "./DynamicContentBanner.style";

class DynamicContentBanner extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        link: PropTypes.string,
        height: PropTypes.any,
        width: PropTypes.any,
      })
    ).isRequired,
    isMenu: PropTypes.bool,
    toggleMobileMenuSideBar: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.onclick = this.onclick.bind(this);
  }

  static defaultProps = {
    isMenu: false,
  };

  state = {
    isMobile: isMobile.any() || isMobile.tablet(),
    impressionSent: false,
  };

  componentDidMount() {
    const { doNotTrackImpression } = this.props;
    if (!doNotTrackImpression) {
      this.registerViewPortEvent();
    }
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
    const { toggleMobileMenuSideBar, index } = this.props;
    if (toggleMobileMenuSideBar) {
      toggleMobileMenuSideBar();
    }
    setTimeout(() => { });
    let banner = {
      link: item.link,
      promotion_name: item.promotion_name,
    };
    Event.dispatch(EVENT_GTM_BANNER_CLICK, banner);
    this.sendBannerClickImpression(item);
    this.props.setLastTapItemOnHome(`DynamicContentBanner${index}`);
  };
  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderImage = (item, i) => {
    const { index, type } = this.props;
    // const { height, width } = items[0];
    const { url, image_url, link, height = "", width = "",promotion_name } = item;
    let ht, wd;
    // if (screen.width < 900) {
    //   wd = (screen.width - 20).toString() + "px";
    //   ht = (height / width) * screen.width;
    // } else {
    //   wd = width.toString() + "px";
    //   ht = height.toString() + "px";
    // }

    // TODO: calculate aspect ratio to ensure images not jumping.
    if (!link) {
      return (
        <>
          <Image
            lazyLoad={index === 21 || index === 35 ? false : true}
            key={i}
            src={url || image_url}
            ratio="custom"
            height={ht}
            width={wd}
            alt={ promotion_name ? promotion_name : "DynamicContentBannerImage"}
          />
          {this.renderButton()}
        </>
      );
    }

    return (
      <Link
        to={formatCDNLink(link)}
        key={i}
        data-banner-type={type || "banner"}
        data-promotion-name={item.promotion_name ? item.promotion_name : ""}
        data-tag={item.tag ? item.tag : ""}
        onClick={() => {
          this.onclick(item);
        }}
      >
        <Image
          lazyLoad={index === 21 || index === 35 ? false : true}
          src={url || image_url}
          block="Image"
          style={{ maxWidth: wd, height: ht, objectFit: "unset" }}
          alt={item.promotion_name ? item.promotion_name : "DynamicContentBannerImage"}
        />

        {this.renderButton()}
      </Link>
    );
  };

  renderButton() {
    const { isMobile } = this.state;
    const { isMenu } = this.props;

    return isMobile || !isMenu ? null : <button>{__("Shop now")}</button>;
  }

  renderImages() {
    const { items = [] } = this.props;
    return items.map(this.renderImage);
  }

  render() {
    let setRef = (el) => {
      this.viewElement = el;
    };
    const { index } = this.props;
    return (
      <div
        ref={setRef}
        block="DynamicContentBanner"
        id={`DynamicContentBanner${index}`}
      >
        {this.props.header && (
          <DynamicContentHeader header={this.props.header} />
        )}
        {this.renderImages()}
        {this.props.footer && (
          <DynamicContentFooter footer={this.props.footer} />
        )}
      </div>
    );
  }
}

export default DynamicContentBanner;
