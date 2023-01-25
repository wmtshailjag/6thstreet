import { HOME_PAGE_BANNER_CLICK_IMPRESSIONS } from "Component/GoogleTagManager/events/BannerImpression.event";
import Image from "Component/Image";
import Link from "Component/Link";
import Price from "Component/Price";
import WishlistIcon from "Component/WishlistIcon";
import PropTypes from "prop-types";
import Logger from "Util/Logger";
import VueIntegrationQueries from "Query/vueIntegration.query";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { isArabic } from "Util/App";
import { getCurrency } from "Util/App/App";
import { getUUID } from "Util/Auth";
import Event, {
  EVENT_GTM_VUE_PRODUCT_CLICK,
  VUE_CAROUSEL_CLICK,
} from "Util/Event";
import { parseURL } from "Util/Url";

export const mapStateToProps = (state) => ({
  country: state.AppState.country,
});

class DynamicContentVueProductSliderItem extends PureComponent {
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
      // data: { category, sku, link },
      data,
      posofreco,
      sourceProdID,
      sourceCatgID,
      index
    } = this.props;
    const { category, sku, link, price } = data;
    let destProdID = sku;
    // vue analytics
    try {
      const locale = VueIntegrationQueries.getLocaleFromUrl();
      const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
      const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];

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
          destCategoryID: category,
          prodPrice: itemPrice,
          posofreco: posofreco,
        },
      });
      Event.dispatch(EVENT_GTM_VUE_PRODUCT_CLICK, data);
      this.props.setLastTapItemOnHome(`VeuSliderWrapper${index}`);

    }
    catch (e) {
      Logger.log(e);
    }

    // this.sendBannerClickImpression(item);
  };
  sendBannerClickImpression(item) {
    Event.dispatch(HOME_PAGE_BANNER_CLICK_IMPRESSIONS, [item]);
  }

  renderPrice(price) {
    const { isArabic } = this.state;
    if (price && price.length > 0) {
      return (
        <div
          block="VueProductSlider"
          elem="SpecialPriceCon"
          mods={{ isArabic }}
        >
          <Price price={price} renderSpecialPrice={false} cart={true} />
        </div>
      );
    }
    return null;
  }

  renderIsNew(is_new_in) {
    if (is_new_in) {
      return (
        <div block="VueProductSlider" elem="VueIsNewTag">
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
    const { isArabic } = this.state;
    let newLink = link;
    if (data?.url) {
      newLink = data.url;
    }
    let productTag = this.props.data.product_tag ? this.props.data.product_tag : ""

    return (
      <div
        block="VueProductSlider"
        elem="VueProductContainer"
        mods={{ isArabic }}
        data-sku={sku}
        data-category={category}
        ref={this.childRef}
      >
        <Link
          to={parseURL(newLink)?.pathname?.split("?_ga")[0] || "/"}
          data-banner-type="vueSlider"
          block="VueProductSlider-Link"
          onClick={() => {
            this.onclick(widgetID, data);
          }}
        >
          <Image
            lazyLoad={true}
            block="VueProductSlider"
            elem="VueProductImage"
            src={thumbnail_url}
            alt={name}
          />
          <h6 id="brandName">{brand_name}</h6>
          <span id="productName">{name}</span>
          {this.renderPrice(price)}
          {this.renderIsNew(is_new_in)}
          {
            productTag ?
              this.renderProductTag(productTag)
              :
              this.renderIsNew(is_new_in)
          }
        </Link >
        <WishlistIcon
          renderMySignInPopup={renderMySignInPopup}
          sku={sku}
          data={data}
          pageType={pageType}
        />
      </div >
    );
  }
}

export default connect(
  mapStateToProps,
  null
)(DynamicContentVueProductSliderItem);
