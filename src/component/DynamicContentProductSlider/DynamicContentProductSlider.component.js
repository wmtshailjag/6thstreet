/* eslint-disable no-constant-condition */
import { HOME_PAGE_BANNER_IMPRESSIONS } from "Component/GoogleTagManager/events/BannerImpression.event";
import ProductItem from "Component/ProductItem";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { Products } from "Util/API/endpoint/Product/Product.type";
import { isArabic } from "Util/App";
import Event from "Util/Event";
import DynamicContentVueProductSliderContainer from "./../DynamicContentVueProductSlider/DynamicContentVueProductSlider.container";
import { HOME_PAGE_TRANSLATIONS } from "./DynamicContentProductSlider.config";
import "./DynamicContentProductSlider.style";

class DynamicContentProductSlider extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    products: Products.isRequired,
  };

  constructor(props) {
    super(props);
  }

  state = {
    currentPage: 0,
    isArabic: isArabic(),
    withViewAll: true,
    impressionSent: false,
    eventRegistered: false,
  };

  componentDidMount() { }

  registerViewPortEvent() {
    let observer;
    const elem = document.querySelector(`#productSlider-${index}`);

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
  sendImpressions() {
    const { products = [] } = this.props;
    const items = products.map((item) => {
      return {
        id: item.sku,
        label: item.name,
      };
    });
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

  renderProduct = (product, i) => {
    const { sku } = product;
    const { isArabic } = this.state;

    // TODO: remove if statement and add appropriate query for items with new
    return (
      <div
        mix={{
          block: "DynamicContentProductSlider",
          elem: "ProductItem",
          mods: { isArabic },
        }}
        key={i}
      >
        <ProductItem product={product} key={sku} pageType="home" />
        {this.renderCTA()}
      </div>
    );
  };

  renderProductsDesktop() { }

  renderTitle() {
    const { title, isHomePage } = this.props;
    let finalTitle;
    if (isHomePage) {
      finalTitle = title;
    } else {
      finalTitle = isArabic() ? HOME_PAGE_TRANSLATIONS[title] : title;
    }
    return (
      <h2 mix={{ block: "DynamicContentProductSlider", elem: "Header" }}>
        {finalTitle}
      </h2>
    );
  }

  renderCTA() {
    const { isArabic } = this.state;
    return (
      <div
        mix={{
          block: "DynamicContentProductSlider",
          elem: "FavoriteOverlay",
          mods: { isArabic },
        }}
      />
    );
  }

  render() {
    const { isArabic, withViewAll, eventRegistered } = this.state;
    const {
      title,
      isHomePage,
      products,
      renderMySignInPopup,
      setLastTapItemOnHome,
      index = 0,
    } = this.props;
    if (products.length === 0) {
      return null;
    }

    if (!eventRegistered) {
      setTimeout(() => {
        // this.registerViewPortEvent();
      }, 3000);
    }

    let finalTitle;
    if (isHomePage) {
      finalTitle = title;
    } else {
      finalTitle = isArabic() ? HOME_PAGE_TRANSLATIONS[title] : title;
    }
    const productsDesktop = (
      <React.Fragment>
        <DynamicContentVueProductSliderContainer
          products={products}
          heading={finalTitle}
          withViewAll
          setLastTapItemOnHome={setLastTapItemOnHome}
          renderMySignInPopup={renderMySignInPopup}
          key={`VueProductSliderContainer`}
          isHome={true}
          pageType={"home"}
          widgetID={"vue_top_picks_slider"}
          index={index}
        />
      </React.Fragment>
    );

    let setRef = (el) => {
      this.viewElement = el;
    };

    return (
      <div
        ref={setRef}
        id="productSlider"
        mix={{
          block: "DynamicContentProductSliderHomePage",
          mods: { isArabic },
        }}
      >
        {productsDesktop}
      </div>
    );
  }
}

export default DynamicContentProductSlider;
