import { HOME_PAGE_BANNER_CLICK_IMPRESSIONS } from "Component/GoogleTagManager/events/BannerImpression.event";
import Link from "Component/Link";
import WishlistIcon from "Component/WishlistIcon";
import PropTypes from "prop-types";
import VueIntegrationQueries from "Query/vueIntegration.query";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App/App";
import { getUUID } from "Util/Auth";
import Event, {
  VUE_CAROUSEL_CLICK,
  EVENT_CLICK_RECOMMENDATION_CLICK,
  EVENT_GTM_PRODUCT_CLICK
} from "Util/Event";
import { Price as PriceType } from "Util/API/endpoint/Product/Product.type";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  country: state.AppState.country,
});

class RecommendedForYouVueSliderItem extends PureComponent {
  static propTypes = {
    country: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    pageType: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.childRef = React.createRef();
    this.state = {
      isArabic: isArabic(),
    };
  }

  onclick = (widgetID, item) => {
    const {
      pageType,
      data: {
        category,
        sku,
        link,
        name,
        price,
        product_type_6s,
        color,
        brand_name,
        product_Position
      },
      sourceProdID,
      sourceCatgID,
      posofreco,
      data,
    } = this.props;
    let destProdID = sku;
    // vue analytics
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_CAROUSEL_CLICK,
      params: {
        event: VUE_CAROUSEL_CLICK,
        pageType: pageType,
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: window.location.href,
        url: link ? link : null,
        widgetID: VueIntegrationQueries.getWidgetTypeMapped(widgetID, pageType),
        sourceProdID: sourceProdID,
        sourceCatgID: sourceCatgID,
        destProdID: destProdID,
        posofreco: posofreco,
      },
    });
    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"] || "";
    Event.dispatch(EVENT_CLICK_RECOMMENDATION_CLICK, name);
    Event.dispatch(EVENT_GTM_PRODUCT_CLICK, {
      name: name || "",
      id: sku || "",
      price: itemPrice || "",
      brand: brand_name || "",
      category: product_type_6s || category,
      varient: color || "",
      position: product_Position || "",
    });
    //this.sendBannerClickImpression(item);
  };
  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  discountPercentage(basePrice, specialPrice, haveDiscount) {
    const { country, config } = this.props;
    const showDiscountPercentage =
      config?.countries[country]?.price_show_discount_percent ?? true;
    if (!showDiscountPercentage) {
      return null;
    }

    let discountPercentage = Math.round(100 * (1 - specialPrice / basePrice));
    if (discountPercentage === 0) {
      discountPercentage = 1;
    }

    return (
      <span
        block="VueProductSlider"
        elem="Discount"
        mods={{ discount: haveDiscount }}
      >
        -{discountPercentage}%<span> </span>
      </span>
    );
  }

  renderSpecialPrice(specialPrice, haveDiscount) {
    const currency = getCurrency();
    return (
      <span
        block="VueProductSlider"
        elem="SpecialPrice"
        mods={{ discount: haveDiscount }}
      >
        {currency}
        <span> </span>
        {specialPrice}
      </span>
    );
  }

  renderPrice(price) {
    const { isArabic } = this.state;
    if (price && price.length > 0) {
      const priceObj = price[0],
        currency = getCurrency();
      const basePrice = priceObj[currency]["6s_base_price"];
      const specialPrice = priceObj[currency]["6s_special_price"];
      const haveDiscount =
        specialPrice !== "undefined" &&
        specialPrice &&
        basePrice !== specialPrice;

      if (basePrice === specialPrice || !specialPrice) {
        return (
          <div
            block="VueProductSlider"
            elem="SpecialPriceCon"
            mods={{ isArabic }}
          >
            <span block="VueProductSlider" elem="PriceWrapper">
              <span
                id="price"
                style={{ color: "#000000" }}
              >{`${currency} ${basePrice}`}</span>
            </span>
          </div>
        );
      }

      return (
        <div
          block="VueProductSlider"
          elem="SpecialPriceCon"
          mods={{ isArabic }}
        >
          <del block="VueProductSlider" elem="Del">
            <span id="price">{`${currency} ${basePrice}`}</span>
          </del>
          <span block="VueProductSlider" elem="PriceWrapper">
            {this.discountPercentage(basePrice, specialPrice, haveDiscount)}
            {this.renderSpecialPrice(specialPrice, haveDiscount)}
          </span>
        </div>
      );
    }
    return null;
  }

  renderIsNew(is_new_in) {
    const { isArabic } = this.state;
    if (is_new_in) {
      return (
        <div block="VueProductSlider" elem="VueIsNewTag" mods={{ isArabic }}>
          <span>{__("New")}</span>
        </div>
      );
    }
    return null;
  }

  renderProductTag(productTag) {
    return (
      <div block="VueProductSlider" elem="VueProductTag">
        <span>{__(productTag)}</span>
      </div>
    );
  }

  render() {
    const {
      data: {
        category,
        thumbnail_url,
        name,
        brand_name,
        price,
        is_new_in = false,
        sku,
        link = "",
      },
      data,
      widgetID,
      pageType,
      renderMySignInPopup,
    } = this.props;
    let productTag = this.props.data.product_tag
      ? this.props.data.product_tag
      : "";
    const { isArabic } = this.state;
    let newLink = link;
    if (this.props.data.url) {
      newLink = this.props.data.url;
    }
    return (
      <div
        block="VueProductSlider"
        elem="VueProductContainer"
        data-sku={sku}
        data-category={category}
        ref={this.childRef}
      >
        <Link
          to={newLink.split("?_ga")[0]}
          data-banner-type="vueSlider"
          block="VueProductSlider-Link"
          onClick={() => {
            this.onclick(widgetID, data);
          }}
        >
          <img
            block="VueProductSlider"
            elem="VueProductImage"
            src={thumbnail_url}
            alt={name}
          />
        </Link>
        <h6
          block="VueProductSlider"
          id="brandName"
          elem="brandName"
          mods={{ isArabic }}
        >
          {brand_name}
        </h6>
        <span
          id="productName"
          block="VueProductSlider"
          elem="productName"
          mods={{ isArabic }}
        >
          {name}
        </span>
        {this.renderPrice(price)}
        {productTag
          ? this.renderProductTag(productTag)
          : this.renderIsNew(is_new_in)}
        <WishlistIcon
          sku={sku}
          data={data}
          pageType={pageType}
          renderMySignInPopup={renderMySignInPopup}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(RecommendedForYouVueSliderItem);
