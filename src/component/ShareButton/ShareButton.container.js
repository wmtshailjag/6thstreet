import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import isMobile from "Util/Mobile";

import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import ShareButton from "./ShareButton.component";
import SharePopup from "Component/SharePopup";
import Event,{ EVENT_SHARE, EVENT_GTM_PDP_TRACKING } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import BrowserDatabase from "Util/BrowserDatabase";
import { getCurrency } from "Util/App";
import { SHARE_POPUP_ID } from "Component/SharePopup/SharePopup.config";

export const mapDispatchToProps = (dispatch) => ({
  showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
  hideOverlay: () => dispatch(hideActiveOverlay()),
});

class ShareButtonContainer extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    children: PropTypes.node,
    data: PropTypes.object.isRequired,
  };

  static defaultProps = {
    children: null,
  };

  state = {
    openShareOverlay: false,
  };

  showShareOverlay = () => {
    const { showOverlay } = this.props;
    this.setState({ openShareOverlay: true }, () =>
      showOverlay(SHARE_POPUP_ID)
    );
  };

  hideShareOverlay = () => {
    const { hideOverlay } = this.props;
    this.setState({ openShareOverlay: false }, hideOverlay);
  };

  async _initiateShare() {
    const isDesktop = !(isMobile.any() || isMobile.tablet());
    const {
      product: {
        categories = {},
        name,
        sku,
        image_url,
        url,
        brand_name,
        thumbnail_url,
        product_type_6s,
        price,
        color,
      },
    } = this.props;
    const specialPrice =
      price && price[0]
        ? price[0][Object.keys(price[0])[0]]["6s_special_price"]
        : price && Object.keys(price)[0] !== "0"
          ? price[Object.keys(price)[0]]["6s_special_price"]
          : null;
    const originalPrice =
      price && price[0]
        ? price[0][Object.keys(price[0])[0]]["6s_base_price"]
        : price && Object.keys(price)[0] !== "0"
          ? price[Object.keys(price)[0]]["6s_base_price"]
          : null;
    const checkCategoryLevel = () => {
      if (!categories) {
        return "this category";
      }
      if (categories.level4 && categories.level4.length > 0) {
        return categories.level4[0];
      } else if (categories.level3 && categories.level3.length > 0) {
        return categories.level3[0];
      } else if (categories.level2 && categories.level2.length > 0) {
        return categories.level2[0];
      } else if (categories.level1 && categories.level1.length > 0) {
        return categories.level1[0];
      } else if (categories.level0 && categories.level0.length > 0) {
        return categories.level0[0];
      } else return "";
    };
    const categoryLevel =
      checkCategoryLevel().includes("///")
        ? checkCategoryLevel().split("///").pop()
        : product_type_6s && product_type_6s.length > 0
          ? product_type_6s
          : "";
    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    Moengage.track_event(EVENT_SHARE, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      gender: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      subcategory: categoryLevel || "",
      color: color || "",
      brand_name: brand_name || "",
      full_price: originalPrice || "",
      product_url: url,
      currency: getCurrency() || "",
      product_sku: sku || "",
      discounted_price: specialPrice || "",
      product_image_url: thumbnail_url || "",
      product_name: name || "",
      app6thstreet_platform: "Web",
    });

    const eventData = {
      name: EVENT_SHARE,
      product_name: name,
      product_id: sku,
      action: "pdp_share_click",
    };
    Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData);
    
    if (isDesktop) {
      this.showShareOverlay();
    } else if (window.navigator.share) {
      const { title, text, url } = this.props;

      await window.navigator.share({
        title,
        text,
        url,
      });
    }
  }

  render() {
    const { openShareOverlay } = this.state;
    const { children, product, ...rest } = this.props;
    const isDesktop = !(isMobile.any() || isMobile.tablet());
    return (
      <>
        {isDesktop ? (
          <SharePopup
            showShareOverlay={this.showShareOverlay}
            hideShareOverlay={this.hideShareOverlay}
            openSharePopup={open}
            product={product}
            {...rest}
          />
        ) : null}
        {window.navigator.share || isDesktop ? (
          <ShareButton
            initiateShare={this._initiateShare.bind(this)}
            openShareOverlay={openShareOverlay}
            {...rest}
          >
            {children}
          </ShareButton>
        ) : null}
      </>
    );
  }
}

export default connect(null, mapDispatchToProps)(ShareButtonContainer);
