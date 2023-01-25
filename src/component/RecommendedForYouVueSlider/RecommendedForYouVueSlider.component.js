import DragScroll from "Component/DragScroll/DragScroll.component";
import { HOME_PAGE_BANNER_IMPRESSIONS } from "Component/GoogleTagManager/events/BannerImpression.event";
import { EVENT_PRODUCT_LIST_IMPRESSION } from "Component/GoogleTagManager/events/ProductImpression.event";
import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import React, { PureComponent } from "react";
import { isArabic } from "Util/App";
import { getUUID } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import Event, { VUE_CAROUSEL_SHOW, VUE_CAROUSEL_SWIPE } from "Util/Event";
import RecommendedForYouVueSliderItem from "./RecommendedForYouVueSlider.Item";
import "./RecommendedForYouVueSlider.style.scss";
import { connect } from "react-redux";

export const mapStateToProps = (state) => ({
  prevPath: state.PLP.prevPath,
});

class RecommendedForYouVueSlider extends PureComponent {
  static propTypes = {
    withViewAll: PropTypes.bool,
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
    widgetID: PropTypes.string.isRequired,
    pageType: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.itemRef = React.createRef();
    this.cmpRef = React.createRef();
    this.indexRef = React.createRef(0);
    this.scrollerRef = React.createRef();
    this.state = {
      customScrollWidth: null,
      isArabic: isArabic(),
      impressionSent: false,
      eventRegistered: false,
    };
  }
  componentDidMount() {
    if (this.state.customScrollWidth < 0) {
      this.renderScrollbar();
    }
    const {
      widgetID,
      pageType = "home",
      prevPath = null,
      sourceCatgID,
      sourceProdID,
    } = this.props;
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_CAROUSEL_SHOW,
      params: {
        event: VUE_CAROUSEL_SHOW,
        pageType: pageType,
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: prevPath,
        widgetID: VueIntegrationQueries.getWidgetTypeMapped(widgetID, pageType),
        userID: userID,
        sourceProdID: sourceProdID,
        sourceCatgID: sourceCatgID,
        url: window.location.href,
      },
    });
    this.registerViewPortEvent();
  }
  componentWillUnmount() {}

  registerViewPortEvent() {
    let observer;
    const elem = document.querySelector("#productSlider");

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    observer = new IntersectionObserver(this.handleIntersect, options);

    observer.observe(elem);
    this.setState({ eventRegistered: true });
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

  async handleContainerScroll(widgetID, event) {
    const { isArabic } = this.state;
    const {
      pageType = "home",
      prevPath = null,
      sourceCatgID,
      sourceProdID,
    } = this.props;
    const target = event.nativeEvent.target;
    if (this.scrollerRef && this.scrollerRef.current) {
      this.scrollerRef.current.scrollLeft = isArabic
        ? Math.abs(target.scrollLeft)
        : target.scrollLeft;
    }
    let width = 0;
    if (screen.width > 1024) {
      width = 245;
    } else {
      width = 220;
    }
    let index = Math.floor(Math.abs(target.scrollLeft) / width);
    if (this.indexRef.current !== index) {
      this.indexRef.current = index;
      const locale = VueIntegrationQueries.getLocaleFromUrl();
      VueIntegrationQueries.vueAnalayticsLogger({
        event_name: VUE_CAROUSEL_SWIPE,
        params: {
          event: VUE_CAROUSEL_SWIPE,
          pageType: pageType,
          currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
          clicked: Date.now(),
          uuid: getUUID(),
          referrer: prevPath,
          url: window.location.href,
          sourceProdID: sourceProdID,
          sourceCatgID: sourceCatgID,
          widgetID: VueIntegrationQueries.getWidgetTypeMapped(
            widgetID,
            pageType
          ),
        },
      });
    }
  }

  getProducts = () => {
    const { products: data, sliderLength } = this.props;
    let products = [...data];
    if (products.length > sliderLength) {
      products.length = sliderLength;
    }
    return [...products];
  };

  viewAllBtn() {
    const { withViewAll } = this.props;
    if (withViewAll) {
      return (
        <div block="VueProductSlider" elem="ViewAllBtn">
          <span>{"View All"}</span>
        </div>
      );
    }
    return null;
  }

  renderHeader() {
    const { heading } = this.props;
    return (
      <div block="recommendedForYou">
        <h2>{heading}</h2>
      </div>
    );
  }

  handleScroll = (event) => {
    const target = event.nativeEvent.target;
    const prentComponent = [...this.cmpRef.current.childNodes].filter(
      (node) => node.id == "ScrollWrapper"
    )[0];
    prentComponent && (prentComponent.scrollLeft = target.scrollLeft);
  };

  renderScrollbar = () => {
    let items = this.getProducts();

    const width =
      (this.itemRef &&
        this.itemRef.current &&
        this.itemRef.current.childRef.current.clientWidth) *
        items.length +
      items.length * 7 * 2 -
      690;
    this.setState({
      customScrollWidth: width,
    });

    // return null;

    return (
      <div
        block="VueProductSlider"
        elem="SliderContainer"
        ref={this.scrollerRef}
        mods={{
          isArabic: isArabic(),
          Hidden:
            this.scrollerRef.current &&
            this.scrollerRef.current.clientWidth >=
              this.state.customScrollWidth,
        }}
        onScroll={this.handleScroll}
      >
        <div
          block="Outer"
          style={{ width: this.state.customScrollWidth }}
          elem="Inner"
        ></div>
      </div>
    );
  };
  sendImpressions() {
    const products = this.getProducts();
    const items = products.map((item, index) => {
      return {
        name: item.name,
        id: item.sku,
        price: item.price,
        brand_name: item.brand_name,
        category: item.product_type_6s ? item.product_type_6s : item.category,
        color: item.color ? item.color : "",
        list: "Search Recommendation",
        product_Position: index + 1,
      };
    });
    Event.dispatch(EVENT_PRODUCT_LIST_IMPRESSION, items);
    this.setState({ impressionSent: true });
  }

  renderSliderContainer() {
    const items = this.getProducts();
    const { isHome } = this.props;
    const {
      widgetID,
      pageType,
      renderMySignInPopup,
      sourceCatgID,
      sourceProdID,
    } = this.props;
    items.forEach((item, index) => {
      Object.assign(item, {
        product_Position: index +1,
      });
    });
    return (
      <DragScroll data={{ rootClass: "ScrollWrapper", ref: this.cmpRef }}>
        <>
          <div
            block="VueProductSlider"
            elem="SliderContainer"
            id="ScrollWrapper"
            ref={this.cmpRef}
            mods={{ isHome }}
            onScroll={(e) => {
              this.handleContainerScroll(widgetID, e);
            }}
          >
            {isHome && <div block="SliderHelper" mods={{ isHome }}></div>}
            {items.map((item, i) => {
              const { sku } = item;
              return (
                <RecommendedForYouVueSliderItem
                  key={sku}
                  renderMySignInPopup={renderMySignInPopup}
                  data={item}
                  widgetID={widgetID}
                  pageType={pageType}
                  sourceProdID={sourceProdID}
                  sourceCatgID={sourceCatgID}
                  posofreco={i}
                />
              );
            })}
            {isHome && <div block="SliderHelper" mods={{ isHome }}></div>}
          </div>
          {this.renderScrollbar()}
        </>
      </DragScroll>
    );
  }

  render() {
    let setRef = (el) => {
      this.viewElement = el;
    };
    return (
      <div
        ref={setRef}
        id="productSlider"
        block="VueProductSlider"
        elem="Container"
      >
        {this.renderHeader()}
        {this.renderSliderContainer()}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(RecommendedForYouVueSlider);
