import PropTypes from "prop-types";
import { PureComponent } from "react";
import Image from "Component/Image";

import SizeTable from "Component/SizeTable";
import ExpandableContent from "SourceComponent/ExpandableContent";
import Popup from "SourceComponent/Popup";
import isMobile from "SourceUtil/Mobile/isMobile";
import { isArabic } from "Util/App";
import { Product } from "Util/API/endpoint/Product/Product.type";
import chart from "./sizeChart/sizechart.jpg";
import "./PDPSizeGuide.style";
import { BRANDTITLE } from "Component/SizeTable/SizeTable.config.js";
import Event, {
  EVENT_GO_TO_SIZE_CHART,
  EVENT_GTM_PDP_TRACKING,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getCurrency } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";

class PDPSizeGuide extends PureComponent {
  static propTypes = {
    activeOverlay: PropTypes.string.isRequired,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    currentContentGender: PropTypes.string.isRequired,
    product: Product.isRequired,
  };

  state = {
    isArabic: isArabic(),
    isOpen: false,
  };

  static getDerivedStateFromProps(nextProps) {
    const { activeOverlay } = nextProps;
    document.body.style.overflow =
      activeOverlay === "PDPSizeGuide" ? "hidden" : "visible";
    return { isOpen: activeOverlay === "PDPSizeGuide" };
  }

  handleModalClick = () => {
    const {
      product: {
        categories = {},
        brand_name,
        color,
        name,
        price,
        product_type_6s,
        sku,
        thumbnail_url,
        url,
        simple_products,
        size_uk = [],
        size_eu = [],
        size_us = [],
      },
    } = this.props;
    const { isOpen } = this.state;
    const { showOverlay } = this.props;
    showOverlay("PDPSizeGuide");
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
      product_type_6s && product_type_6s.length > 0
        ? product_type_6s
        : checkCategoryLevel().includes("///")
        ? checkCategoryLevel().split("///").pop()
        : "";

    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];
    Moengage.track_event(EVENT_GO_TO_SIZE_CHART, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      currency: getCurrency() || "",
      category: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      gender: currentAppState.gender
        ? currentAppState.gender.toUpperCase()
        : "",
      subcategory: categoryLevel || product_type_6s,
      color: color || "",
      brand_name: brand_name || "",
      product_url: url || "",
      product_sku: sku || "",
      full_price: basePrice || "",
      discounted_price: itemPrice || "",
      product_image_url: thumbnail_url || "",
      product_name: name || "",
      app6thstreet_platform: "Web",
    });
    const eventData = {
      name: EVENT_GO_TO_SIZE_CHART,
      product_name: name,
      product_id: sku,
      action:"size_chart_click",
    };
    Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData);
    this.setState({ isOpen: !isOpen });
  };

  renderButton() {
    const { isArabic } = this.state;
    return (
      <span
        onClick={this.handleModalClick}
        onKeyDown={this.handleModalClick}
        role="button"
        aria-label="Dismiss"
        tabIndex={0}
        block="PDPSizeGuide"
        elem="Button"
        mods={{ isArabic }}
        // mix={{ block: "PDPSizeGuide", elem: "Button", mods: isArabic }}
        // mods={{ isArabic }}
      >
        {__("Size Help")}
        {isArabic}
      </span>
    );
  }

  renderModal() {
    const { isArabic, isOpen } = this.state;

    return (
      <Popup
        mix={{
          block: "PDPSizeGuide",
          elem: "Modal",
          mods: { isOpen, isArabic },
        }}
        id="PDPSizeGuide"
        title="Sizing"
      >
        {this.renderModalContents()}
      </Popup>
    );
  }

  hideOverlay = () => {
    const { hideActiveOverlay } = this.props;
    hideActiveOverlay();
  };
  isBrandPro = () => {
    const {
      currentContentGender,
      product: { brand_name, gender },
    } = this.props;
    let checkingBrand = false;
    if (
      BRANDTITLE[brand_name] &&
      (gender === "Women" ||
        gender === "Men" ||
        gender === "رجال" ||
        gender === "نساء")
    ) {
      checkingBrand = true;
    }
    return checkingBrand;
  };
  renderModalContents() {
    const { isArabic } = this.state;
    const closeBtn = (
      <div
        mix={{ block: "PDPSizeGuide", elem: "BackBtn", mods: { isArabic } }}
        onClick={this.hideOverlay}
        onKeyDown={this.hideOverlay}
        role="button"
        aria-label="Dismiss"
        tabIndex={0}
      />
    );

    return (
      <div
        mix={{
          block: "PDPSizeGuide",
          elem: "GuideContainer",
          mods: { isArabic },
        }}
      >
        <div
          mix={{
            block: "PDPSizeGuide",
            elem: "HeaderContainer",
            mods: { isArabic },
          }}
        >
          {isMobile.any() || isMobile.tablet() ? closeBtn : null}
          {this.isBrandPro() ? (
            ""
          ) : (
            <>
              <h1
                mix={{
                  block: "PDPSizeGuide",
                  elem: "Header",
                  mods: { isArabic },
                }}
              >
                {isMobile.any() || isMobile.tablet()
                  ? __("SIZE GUIDE")
                  : __("SIZE GUIDE")}
              </h1>
              <hr
                mix={{
                  block: "PDPSizeGuide",
                  elem: "Line",
                  mods: { isArabic },
                }}
              />
            </>
          )}
        </div>
        {/* <span
                  mix={ { block: 'PDPSizeGuide', elem: 'SubHeader', mods: { isArabic } } }
                >
                    { __('Fitting Information - Items fits true to size') }
                </span> */}
        <div
          mix={{
            block: "PDPSizeGuide",
            elem: "TableContainer",
            mods: { isArabic },
          }}
        >
          {this.renderSizeChart()}
          {/* { this.renderTableUK() }
                    <hr mix={ { block: 'PDPSizeGuide', elem: 'Divider', mods: { isArabic } } } />
                    { this.renderTableInt() }
                    <hr mix={ { block: 'PDPSizeGuide', elem: 'Divider', mods: { isArabic } } } />
                    { this.renderTableEu() } */}
        </div>
      </div>
    );
  }

  renderSizeChart() {
    const {
      currentContentGender,
      product: { fit_size_url, brand_name, gender },
    } = this.props;

    if (!!fit_size_url) {
      return <Image lazyLoad={true} src={fit_size_url} alt="Size Chart" />;
    }

    return (
      <SizeTable
        brand={brand_name}
        gender={gender}
        currentContentGender={currentContentGender}
      />
    );
  }

  renderTableUK() {
    const { isArabic } = this.state;
    const isOpen = true;
    return (
      <ExpandableContent
        isOpen={isOpen}
        heading={__("UK")}
        mix={{ mods: { isArabic } }}
      >
        <SizeTable />
      </ExpandableContent>
    );
  }

  renderTableInt() {
    const { isArabic } = this.state;
    const isOpen = true;
    return (
      <ExpandableContent
        isOpen={isOpen}
        heading={__("International")}
        mix={{ mods: { isArabic } }}
      >
        <SizeTable />
      </ExpandableContent>
    );
  }

  renderTableEu() {
    const { isArabic } = this.state;
    const isOpen = false;
    return (
      <ExpandableContent
        isOpen={isOpen}
        heading={__("European")}
        mix={{ mods: { isArabic } }}
      >
        <SizeTable />
      </ExpandableContent>
    );
  }

  render() {
    const { isOpen } = this.state;
    return (
      <div block="PDPSizeGuide">
        {this.renderButton()}
        {isOpen ? this.renderModal() : null}
      </div>
    );
  }
}

export default PDPSizeGuide;
