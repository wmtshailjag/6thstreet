import {
  HOME_PAGE_BANNER_CLICK_IMPRESSIONS,
  HOME_PAGE_BANNER_IMPRESSIONS,
} from "Component/GoogleTagManager/events/BannerImpression.event";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getGenderInArabic } from "Util/API/endpoint/Suggestions/Suggestions.create";
import { isArabic } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";
import Event, { EVENT_GTM_BANNER_CLICK } from "Util/Event";
import isMobile from "Util/Mobile";
import Image from "Component/Image";
import { formatCDNLink } from "Util/Url";
import DynamicContentHeader from "../DynamicContentHeader/DynamicContentHeader.component";
import "./DynamicContentGrid.style";

class DynamicContentGrid extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        link: PropTypes.string,
        url: PropTypes.string,
        title: PropTypes.string,
      })
    ).isRequired,
    header: PropTypes.shape({
      title: PropTypes.string,
    }),
    items_per_row: PropTypes.number,
  };

  static defaultProps = {
    items_per_row: 4,
    header: {},
  };
  state = {
    isArabic: isArabic(),
    isAllShowing: true,
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
    const { index } = this.props;
    let banner = {
      link: item.link,
      promotion_name: item.promotion_name,
    };
    Event.dispatch(EVENT_GTM_BANNER_CLICK, banner);
    this.sendBannerClickImpression(item);
    this.props.setLastTapItemOnHome(`DynamicContentGrid${index}`);
  };
  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderItem = (item, i) => {
    const { link, url } = item;
    const { isArabic } = this.state;
    const { items_per_row, item_height, index } = this.props;
    let ht = item_height.toString() + "px";
    let contentClass = "contentAll";
    if (item_height >= 500 && items_per_row === 2) {
      contentClass = `Content_${i}`;
    }
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";
    let requestedGender = isArabic ? getGenderInArabic(gender) : gender;

    return (
      <div
        block="CategoryItem"
        mods={{ isArabic }}
        elem="Content"
        className={contentClass}
        key={i}
      >
        <Link
          to={formatCDNLink(link)}
          key={i}
          data-banner-type="grid"
          data-promotion-name={item.promotion_name ? item.promotion_name : ""}
          data-tag={item.tag ? item.tag : ""}
          onClick={() => {
            this.onclick(item);
          }}
        >
          <Image
            lazyLoad={index === 34 ? false : true}
            src={url}
            className="GridImage"
            alt={item.promotion_name ? item.promotion_name : "GridImage"}
          />
          {item.footer && (
            <div block="Footer">
              {item.footer.title && (
                <p block="Footer-Title">{item.footer.title}</p>
              )}
              {item.footer.subtitle && (
                <p block="Footer-SubTitle">{item.footer.subtitle}</p>
              )}
              {item.footer.button_label && (
                <p>
                  <a block="Footer-Button">{item.footer.button_label}</a>
                </p>
              )}
            </div>
          )}
        </Link>
      </div>
    );
  };

  renderItemMobile = (item, i) => {
    const { link, url,promotion_name, } = item;
    const { index } = this.props;
    let ht = this.props.item_height.toString() + "px";
    const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
      : "home";
    let requestedGender = isArabic ? getGenderInArabic(gender) : gender;

    return (
      <div block="CategoryItem" elem="Content" key={i}>
        <Link
          to={formatCDNLink(link)}
          key={i}
          data-banner-type="grid"
          data-promotion-name={item.promotion_name ? item.promotion_name : ""}
          data-tag={item.tag ? item.tag : ""}
          onClick={() => {
            this.onclick(item);
          }}
        >
          <Image lazyLoad={index === 34 ? false : true} src={url} alt={promotion_name ? promotion_name : "categoryItemsImage"}/>

          {item.footer && (
            <div block="Footer">
              {item.footer.title && (
                <p block="Footer-Title">{item.footer.title}</p>
              )}
              {item.footer.subtitle && (
                <p block="Footer-SubTitle">{item.footer.subtitle}</p>
              )}
              {item.footer.button_label && (
                <a block="Footer-Button">{item.footer.button_label}</a>
              )}
            </div>
          )}
        </Link>
      </div>
    );
  };

  renderItems() {
    const { items = [] } = this.props;
    if (isMobile.any()) {
      return items.map(this.renderItemMobile);
    }
    return items.map(this.renderItem);
  }

  renderGrid() {
    const { items_per_row, header: { title } = {} } = this.props;

    const style = { gridTemplateColumns: `repeat(${items_per_row}, 1fr)` };
    return (
      <>
        {this.props.header && title && (
          <DynamicContentHeader header={this.props.header} />
        )}

        <div block="DynamicContentGrid" elem="Grid" style={style}>
          {this.renderItems()}
        </div>
      </>
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
        block="DynamicContentGrid"
        id={`DynamicContentGrid${index}`}
      >
        {this.renderGrid()}
      </div>
    );
  }
}

export default DynamicContentGrid;
