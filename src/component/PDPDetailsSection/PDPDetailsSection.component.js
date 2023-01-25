// import PropTypes from 'prop-types';
import Accordion from "Component/Accordion";
import { EMAIL_LINK } from "Component/CheckoutSuccess/CheckoutSuccess.config";
import { Chat, Email, Phone } from "Component/Icons";
import Link from "Component/Link";
import PDPDetail from "Component/PDPDetail";
import ShareButton from "Component/ShareButton";
import PropTypes from "prop-types";
import { PureComponent, Fragment } from "react";
import { Product } from "Util/API/endpoint/Product/Product.type";
import { isArabic } from "Util/App";
import Event, {
  EVENT_MOE_CHAT,
  EVENT_MAIL,
  EVENT_PHONE,
  EVENT_MORE_FROM_THIS_BRAND_CLICK,
  EVENT_GTM_PDP_TRACKING,
  EVENT_EXPAND_PRODUCT_DETAILS,
} from "Util/Event";
import isMobile from "Util/Mobile";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import DynamicContentVueProductSliderContainer from "../DynamicContentVueProductSlider";
import { PDP_ARABIC_VALUES_TRANSLATIONS } from "./PDPDetailsSection.config";
import "./PDPDetailsSection.style";
import { 
  YES_IN_ARABIC,
  YES,
  NO,
  NO_IN_ARABIC,
} from "../../util/Common/index";
class PDPDetailsSection extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
    clickAndCollectStores: PropTypes.object.isRequired,
  };
  state = {
    isHidden: true,
    isExpanded: {
      0: true,
      1: true,
      2: true,
      3: false,
      4: true,
      5: true,
    },
    isArabic: isArabic(),
    showMore: isMobile.any() || isMobile.tablet() ? false : true,
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  componentDidMount() {
    const {
      product: { sku = null, categories_without_path = [] },
    } = this.props;
    localStorage.setItem("PRODUCT_SKU", JSON.stringify(sku));
    localStorage.setItem(
      "PRODUCT_CATEGORY",
      JSON.stringify(categories_without_path[0])
    );
  }

  componentWillUnmount() {
    localStorage.removeItem("PRODUCT_SKU");
    localStorage.removeItem("PRODUCT_CATEGORY");
    document.body.style.overflowX = 'visible';
  }

  renderShareButton() {
    const url = new URL(window.location.href);
    url.searchParams.append("utm_source", "pdp_share");
    return (
      <>
        <div block="PDPDetailsSection" elem="ShareButtonContainer">
          <ShareButton
            block="PDPDetailsSection-ShareButtonContainer"
            elem="ShareButton"
            title={document.title}
            text={`Hey check this out: ${document.title}`}
            url={url.toString()}
            mods={{ isArabic: isArabic() }}
          >
            <span>{__("Share")}</span>
          </ShareButton>
        </div>
        {this.renderAccordionSeperator()}
      </>
    );
  }

  renderSizeAndFit() {
    const {
      product: { description },
    } = this.props;
    return (
      <>
        <p block="PDPDetailsSection" elem="SizeFit">
          {__("Fitting Information - Items fits true to size")}
        </p>
        <div block="PDPDetailsSection" elem="ModelMeasurements">
          <h4>{__("Model Measurements")}</h4>
        </div>
      </>
    );
  }

  renderMoreDetailsItem(item) {
    return (
      <li block="PDPDetailsSection" elem="MoreDetailsList" key={item.key}>
        <span block="PDPDetailsSection" elem="ListItem" mods={{ mod: "title" }}>
          {isArabic()
            ? this._translateValue(item.key)
            : this.listTitle(__(item.key))}
        </span>
        <span block="PDPDetailsSection" elem="ListItem" mods={{ mod: "value" }}>
          {item.value}
        </span>
      </li>
    );
  }

  _translateValue(value) {
    if (typeof PDP_ARABIC_VALUES_TRANSLATIONS[value] === "undefined") {
      return value;
    }

    return PDP_ARABIC_VALUES_TRANSLATIONS[value];
  }

  openFullInfo = () => {
    this.setState({ isHidden: false });
  };

  renderIconsSection() {
    const { clickAndCollectStores } = this.props;
    const { isArabic } = this.state;
    const {
      product: {
        sku,
        highlighted_attributes,
        categories,
        model_height,
        product_height,
        product_length,
        product_width,
        bag_dimension,
        model_wearing_size,
      },
      product,
    } = this.props;
    const highlights = this.getHighlights(
      highlighted_attributes,
      categories,
      product_height,
      product_length,
      product_width,
      bag_dimension,
      product
    );
    let isReturnable = true;
    highlights.forEach((val) => {
      if (val.key === "returnable") {
        if (val.value === "No") {
          isReturnable = false;
        }
      }
    });

    return (
      <div block="PDPDetailsSection" elem="IconsSection">
        {clickAndCollectStores?.length ? (
          <div
            block="PDPDetailsSection"
            elem="IconContainer"
            mods={{ isArabic }}
          >
            <div
              block="PDPDetailsSection"
              elem="Icon"
              mods={{ clickAndCollect: true }}
            />
            <div block="ClickAndCollect">
              <div block="Click">{__("Click")}</div>
              <div block="AndCollect">{__("& Collect")}</div>
            </div>
          </div>
        ) : null}
        <div block="PDPDetailsSection" elem="IconContainer" mods={{ isArabic }}>
          <div
            block="PDPDetailsSection"
            elem="Icon"
            mods={{ isGenuine: true }}
          />
          <div>{__("100% Genuine")}</div>
        </div>
        {isReturnable && (
          <div
            block="PDPDetailsSection"
            elem="IconContainer"
            mods={{ isArabic }}
          >
            <div
              block="PDPDetailsSection"
              elem="Icon"
              mods={{ freeReturn: true }}
            />
            <div>{__("Free Returns")}</div>
          </div>
        )}
      </div>
    );
  }

  renderDescription() {
    const {
      product: { description },
    } = this.props;
    const { showMore, isMobile } = this.state;
    return (
      <div block="PDPDetailWrapper">
        <div block="PDPDetailWrapper" elem="Items" mods={{ showMore }}>
          <div block="PDPDetailWrapper" elem="LeftDescription">
            <h3
              block="PDPDetailWrapper"
              elem="Title"
              mods={{ isMobile: !!isMobile }}
            >
              {__("PRODUCT DETAILS:")}
            </h3>
            <p block="PDPDetailsSection" elem="Description">
              {description}
            </p>
          </div>
          {this.renderHighlights()}
        </div>
        {showMore ? (
          <div block="PDPDetailWrapper" elem="Button">
            <button onClick={() => this.updateShowMoreState(false)}>
              {__("SHOW MORE DETAILS")}
            </button>
          </div>
        ) : null}
      </div>
    );
  }
  updateShowMoreState(state) {
    const {
      product: { name, sku },
    } = this.props;
    const eventData = {
      name: EVENT_EXPAND_PRODUCT_DETAILS,
      action: "expand_product_details_click",
      product_name: name,
      product_id: sku,
    };
    Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData);
    this.setState({ showMore: state });
  }

  listTitle(str) {
    return str.replace("_", " ");
  }

  renderListItem(item) {
    return (
      <li block="PDPDetailsSection" elem="HighlightsList" key={item.key}>
        <span block="PDPDetailsSection" elem="ListItem" mods={{ mod: "title" }}>
          {isArabic()
            ? this._translateValue(item.key)
            : this.listTitle(item.key)}
        </span>
        <span block="PDPDetailsSection" elem="ListItem" mods={{ mod: "value" }}>
          {item.value}
        </span>
      </li>
    );
  }

  renderListItems(data) {
    return data
      ?.filter(({ key }) => key !== "sku" && key !== "alternate_name")
      ?.map((item) =>
        this.renderListItem({
          key: item.key,
          value: item.value,
        })
      );
  }

  getCategoryByLevel(categories = {}, level = 0) {
    try {
      return categories.level2 && categories.level2[0].split(" /// ")[level];
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  getHighlights(
    highlights = [],
    categories = {},
    product_height = "",
    product_length = "",
    product_width = "",
    bag_dimension = "",
    product
  ) {
    if (!Object.keys(categories).length) {
      return highlights || [];
    }

    const category = {
      key: "category",
      value: this.getCategoryByLevel(categories, 1),
    };

    const subcategory = {
      key: "subcategory",
      value: this.getCategoryByLevel(categories, 2),
    };
    const productHeight = {
      key: "product_height",
      value: product_height,
    };

    const productLength = {
      key: "product_length",
      value: product_length,
    };

    const productWidth = {
      key: "product_width",
      value: product_width,
    };

    const bagDimention = {
      key: "bag_dimension",
      value: bag_dimension,
    };

    const material = {
      key: "material",
      value: product?.material,
    };

    const occasion = {
      key: "occasion",
      value: product?.occasion,
    };

    const heelHeight = {
      key: "heel_height",
      value: product?.heel_height,
    };

    const ToeShape = {
      key: "toe_shape",
      value: product?.toe_shape,
    };

    const HeelShape = {
      key: "heel_shape",
      value: product?.heel_shape,
    };

    const UpperMaterial = {
      key: "upper_material",
      value: product?.upper_material,
    };

    const sole = {
      key: "sole",
      value: product?.sole,
    };

    const fit = {
      key: "fit",
      value: product?.fit,
    };

    const dressLegth = {
      key: "dress_length",
      value: product?.dress_length,
    };

    const length = {
      key: "length",
      value: product?.length,
    };

    const sleeveLength = {
      key: "sleeve_length",
      value: product?.sleeve_length,
    };

    const skirtLength = {
      key: "skirt_length",
      value: product?.skirt_length,
    };

    const collerType = {
      key: "coller_type",
      value: product?.coller_type,
    };

    const legLength = {
      key: "leg_length",
      value: product?.leg_length,
    };

    const neckTine = {
      key: "neck_line",
      value: product?.neck_line,
    };

    const type = {
      key: "type",
      value: product?.type,
    };

    const bagSize = {
      key: "bag_size",
      value: product?.bag_size,
    };

    const bagStyle = {
      key: "bag_style",
      value: product?.bag_style,
    };

    const fastener = {
      key: "fastener",
      value: product?.fastener,
    };

    const neckline = {
      key: "neckline",
      value: product?.neckline,
    };

    const trend = {
      key: "trend",
      value: product?.trend,
    };

    const fashionSegment = {
      key: "fashion_segment",
      value: product?.fashion_segment,
    };

    const unisex = {
      key: "unisex",
      value: product?.unisex,
    };

    const sustainableFashion = {
      key: "sustainable_fashion",
      value: product?.sustainable_fashion,
    };

    const returnable = {
      key: "returnable",
      value: product?.returnable,
    };

    const discountable = {
      key: "discountable",
      value: product?.discountable,
    };
    const skinType = {
      key: "skin_type",
      value: product?.skin_type,
    };
    const formulation = {
      key: "formulation",
      value: product?.formulation,
    };
    const concern = {
      key: "concern",
      value: product?.concern,
    };
    const preference = {
      key: "preference",
      value: product?.preference,
    };
    const finish = {
      key: "finish",
      value: product?.finish,
    };
    const coverage = {
      key: "coverage",
      value: product?.coverage,
    };
    const materialComposition = {
      key: "material_composition",
      value: product?.material_composition,
    };

    return [
      ...(highlights || []),
      ...(category.value ? [category] : []),
      ...(subcategory.value ? [subcategory] : []),
      ...(productHeight.value ? [productHeight] : []),
      ...(productLength.value ? [productLength] : []),
      ...(productWidth.value ? [productWidth] : []),
      ...(bagDimention.value ? [bagDimention] : []),
      ...(material.value ? [material] : []),
      ...(occasion.value ? [occasion] : []),
      ...(heelHeight.value ? [heelHeight] : []),
      ...(ToeShape.value ? [ToeShape] : []),
      ...(HeelShape.value ? [HeelShape] : []),
      ...(UpperMaterial.value ? [UpperMaterial] : []),
      ...(sole.value ? [sole] : []),
      ...(fit.value ? [fit] : []),
      ...(dressLegth.value ? [dressLegth] : []),
      ...(length.value ? [length] : []),
      ...(skirtLength.value ? [skirtLength] : []),
      ...(sleeveLength.value ? [sleeveLength] : []),
      ...(collerType.value ? [collerType] : []),
      ...(legLength.value ? [legLength] : []),
      ...(neckTine.value ? [neckTine] : []),
      ...(type.value ? [type] : []),
      ...(bagSize.value ? [bagSize] : []),
      ...(bagStyle.value ? [bagStyle] : []),
      ...(fastener.value ? [fastener] : []),
      ...(neckline.value ? [neckline] : []),
      ...(trend.value ? [trend] : []),
      ...(fashionSegment.value ? [fashionSegment] : []),
      ...(unisex.value ? [unisex] : []),
      ...(sustainableFashion.value ? [sustainableFashion] : []),
      ...(returnable.value ? [returnable] : []),
      ...(discountable.value ? [discountable] : []),
      ...(skinType.value ? [skinType] : []),
      ...(formulation.value ? [formulation] : []),
      ...(concern.value ? [concern] : []),
      ...(preference.value ? [preference] : []),
      ...(finish.value ? [finish] : []),
      ...(coverage.value ? [coverage] : []),
      ...(materialComposition.value ? [materialComposition] : []),
    ];
  }

  renderHighlights() {
    const {
      product: {
        sku,
        highlighted_attributes,
        categories,
        model_height,
        product_height,
        product_length,
        product_width,
        bag_dimension,
        model_wearing_size,
        material_composition,
      },
      product,
    } = this.props;

    // highlighted_attributes.forEach((item) => console.log(item))
    const highlights = this.getHighlights(
      highlighted_attributes,
      categories,
      product_height,
      product_length,
      product_width,
      bag_dimension,
      product,
      material_composition
    );

    return (
      <div
        block="PDPDetailsSection"
        elem="Highlights"
        mods={{ isArabic: isArabic() }}
      >
        <h3 className="highlightsTag">{__("Highlights")}</h3>
        <ul>{this.renderListItems(highlights)}</ul>
        <div block="BottomHighlights">
          {this.renderModelDetails(model_height, model_wearing_size)}
          {this.renderSKU(sku)}
        </div>
        {/* {this.renderMoreDetailsList()} */}
      </div>
    );
  }

  renderModelDetails(height, size) {
    if (!size) {
      return null;
    }

    if (!height) {
      return (
        <p block="PDPDetailsSection-Highlights" elem="ModelDetails">
          <span>{__("Model is wearing")} </span>
          <span>{__("size")} </span>
          <span>{size}</span>
        </p>
      );
    }
    return (
      <p block="PDPDetailsSection-Highlights" elem="ModelDetails">
        <span>{__("Model's height is")} </span>
        <span>{height}</span>
        <span> {__("& is wearing")} </span>
        <span>{__("size")} </span>
        <span>{size}</span>
      </p>
    );
  }

  renderSKU(sku) {
    return (
      <p block="PDPDetailsSection-Highlights" elem="SKU">
        <span>SKU: </span>
        <span>{sku}</span>
      </p>
    );
  }

  renderSizeAndFit() {
    const {
      product: { description },
    } = this.props;
    return (
      <>
        <p block="PDPDetailsSection" elem="SizeFit">
          {__("Fitting Information - Items fits true to size")}
        </p>
        <div block="PDPDetailsSection" elem="ModelMeasurements">
          <h4>{__("Model Measurements")}</h4>
        </div>
      </>
    );
  }

  renderMoreDetailsList() {
    const {
      product: { highlighted_attributes },
    } = this.props;

    if (
      highlighted_attributes !== undefined &&
      highlighted_attributes !== null
    ) {
      return (
        <ul block="PDPDetailsSection" elem="MoreDetailsUl">
          {highlighted_attributes
            .filter(({ key }) => key !== "alternate_name")
            .map((item) => this.renderMoreDetailsItem(item))}
        </ul>
      );
    }

    return null;
  }

  renderMoreDetailsSection() {
    const { isHidden } = this.state;

    return (
      <div block="PDPDetailsSection" elem="MoreDetails" mods={{ isHidden }}>
        {this.renderMoreDetailsList()}
      </div>
    );
  }

  renderAccordionTitle(title) {
    return (
      <div block="'PDPDetailsSection-Description" elem="AccordionTitle">
        <h3>{title}</h3>
      </div>
    );
  }

  renderPdpWidgets() {
    const {
      pdpWidgetsData = [],
      renderMySignInPopup,
      product: { sku = null, categories_without_path = [] },
      pdpWidgetsAPIData = [],
      product
    } = this.props;
    const { innerWidth: width } = window;
    document.body.style.overflowX = 'clip';
    if (pdpWidgetsData?.length > 0 && pdpWidgetsAPIData?.length > 0) {
      return (
        <>
          {this.props?.product?.returnable ? (<div block="Seperator2" />) : (null)}
          <React.Fragment>
            {pdpWidgetsAPIData?.map((item, index) => {
              if (typeof item === "object" && Object.keys(item)?.length > 0) {
                const { title: heading } = pdpWidgetsData[index]["layout"];
                const widgetID = pdpWidgetsData[index]["type"];
                const { data } = item;
                if (data && data?.length > 0) {
                  return (
                    <Fragment key={index}>
                      <div
                        block="PDPWidgets"
                        elem="Slider"
                        mods={{ largeScreen: width > 1440 }}
                      >
                        <DynamicContentVueProductSliderContainer
                          widgetID={widgetID}
                          products={data}
                          heading={heading}
                          isHome={false}
                          renderMySignInPopup={renderMySignInPopup}
                          sourceProdID={sku}
                          sourceCatgID={categories_without_path[0]}
                          pageType={"pdp"}
                          key={`DynamicContentVueProductSliderContainer${index}`}
                          index={index}
                          isArabic={isArabic()}
                          withViewAll={true}
                          product={product}
                        />
                      </div>
                    </Fragment>
                  );
                }
                return null;
              }
              return null;
            })}
          </React.Fragment>
        </>
      );
    }
    return null;
  }

  getCountryConfigs() {
    const {
      config: { countries },
      country,
      language,
    } = this.props;

    const {
      opening_hours: { [language]: openHoursLabel },
      contact_using: {
        options: { phone },
      },
    } = countries[country];

    return {
      openHoursLabel,
      toll_free: phone,
    };
  }
  chat() {
    if (document.querySelector(".ori-cursor-ptr")) {
      document.querySelector(".ori-cursor-ptr").click();
    }
  }
  sendEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }
  renderContactUs() {
    const { config } = this.props;
    const { openHoursLabel, toll_free } = this.getCountryConfigs();
    return (
      <div block="ContactUs">
        <div block="ContactUs" elem="Icons">
          <div block="IconWrapper">
            <div
              block="IconWrapper"
              elem="Icon"
              onClick={() => this.sendEvents(EVENT_PHONE)}
            >
              <a href={`tel:${toll_free}`} target="_blank" rel="noreferrer">
                <Phone />
              </a>
            </div>
            <p block="IconWrapper" elem="IconTitle">
              {__("Phone")}
            </p>
          </div>
          <div block="divider"></div>
          <div block="IconWrapper">
            <div
              block="IconWrapper"
              elem="Icon"
              onClick={() => {
                this.sendEvents(EVENT_MOE_CHAT);
                this.chat();
              }}
            >
              <Chat />
            </div>
            <p block="IconWrapper" elem="IconTitle">
              {__("Live Chat")}
            </p>
          </div>
          <div block="divider"></div>
          <div block="IconWrapper">
            <div
              block="IconWrapper"
              elem="Icon"
              onClick={() => this.sendEvents(EVENT_MAIL)}
            >
              <a href={`mailto:${EMAIL_LINK}`} target="_blank" rel="noreferrer">
                <Email />
              </a>
            </div>
            <p block="IconWrapper" elem="IconTitle">
              {__("Email")}
            </p>
          </div>
        </div>
        <p block="ContactUs" elem="Message">
          {__("Customer Service available all days from: ")}
          {openHoursLabel}
        </p>
      </div>
    );
  }
  renderContactAccordion() {
    const { isMobile } = this.state;
    if (!isMobile) {
      return null;
    }
    return (
      <Accordion
        mix={{ block: "PDPDetailsSection", elem: "Accordion" }}
        title={__("Contact us")}
        is_expanded={this.state.isExpanded["5"]}
      >
        {this.renderContactUs()}
      </Accordion>
    );
  }

  renderBrandDetail() {
    const { isMobile } = this.state;
    // if (isMobile) {
    //   return null;
    // }
    return <PDPDetail {...this.props} />;
  }
  renderAboutBrand() {
    const {
      product: { brand_name },
      brandDescription,
      brandImg,
      brandName,
    } = this.props;
    if (!(brandDescription && brandImg && brandName)) {
      return null;
    }
    return (
      <>
        <Accordion
          mix={{ block: "PDPDetailsSection", elem: "Accordion" }}
          title={`${__("About")} ${brand_name}`}
          is_expanded={this.state.isExpanded["3"]}
        >
          {this.renderBrandDetail()}
        </Accordion>
        {this.renderAccordionSeperator()}
      </>
    );
  }

  renderSeperator() {
    return <div block="Seperator"></div>;
  }
  renderAccordionSeperator() {
    return <div block="AccordionSeperator"></div>;
  }
  getBrandUrl = () => {
    const {
      product: { brand_name = "" },
    } = this.props;
    const url = brand_name
      .replace(/'/g, "")
      .replace(/[(\s+).&]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/\-$/, "")
      .replace("@", "at")
      .toLowerCase();
    return `${url}.html`;
  };
  renderMoreFromTheBrand = () => {
    const url = this.getBrandUrl();
    // const url = "https://www.google.com";
    const eventData = {
      name: EVENT_MORE_FROM_THIS_BRAND_CLICK,
      action: EVENT_MORE_FROM_THIS_BRAND_CLICK,
    };
    return (
      <div block="FromBrand">
        <Link
          block="FromBrand"
          elem="MoreButton"
          to={url}
          onClick={() => Event.dispatch(EVENT_GTM_PDP_TRACKING, eventData)}
        >
          <span block="FromBrand" elem="ButtonText">
            {__("More from this brand")}
          </span>
        </Link>
      </div>
    );
  };
  renderContactUsSection() {
    return (
      <div block="ContactUsWrapper">
        <div block="ContactUsWrapper" elem="Detail">
          {this.renderAccordionSeperator()}
          {this.renderContactUs()}
        </div>
      </div>
    );
  }

  renderShipping() {
    let country = getCountryFromUrl();
    let txt = {
      AE: __(
        "Shipments will be delivered within 3-5 days for most of the areas. Free delivery for orders above AED 100."
      ),
      SA: __(
        "Shipments will be delivered within 5-7 days for most of the areas. Free delivery for orders above SAR 200."
      ),
      KW: __(
        "Shipments will be delivered within 5-7 days for most of the areas. Free delivery for orders above KWD 20."
      ),
      QA: __(
        "Shipments will be delivered within 5-7 days for most of the areas. Free delivery for orders above QAR 200."
      ),
      OM: __(
        "Shipments will be delivered within 5-7 days for most of the areas. Free delivery for orders above OMR 20."
      ),
      BH: __(
        "Shipments will be delivered within 5-7 days for most of the areas. Free delivery for orders above BHD 20."
      ),
    };
    return (
      <div>
        <p>
          {" "}
          {txt[country]}
          <Link to={`/shipping-policy`} className="MoreDetailsLinkStyle">
            {" "}
            {__("More info")}
          </Link>
        </p>
      </div>
    );
  }

  renderShippingAndFreeReturns() {
    if (this.props.product.is_returnable === 1) {
      return (
        <div>
          <p>
            {__("100 days free return available. Shop freely.")}
            <Link to={`/return-information`} className="MoreDetailsLinkStyle">
              {" "}
              {__("More info")}
            </Link>
          </p>
        </div>
      );
    }

    if (this.props.product.is_returnable === 0) {
      return (
        <div>
          <p>
            {__("Not eligible for return.")}
            <Link to={`/return-information`} className="MoreDetailsLinkStyle">
              {" "}
              {__("More info")}
            </Link>
          </p>
        </div>
      );
    }

    // if(this.props.product.is_returnable === "NO"){
    //   return(
    //     <div>check check check</div>
    //   )
    // }

    return (
      <div>
        <p>
          {__(
            "Returns available through customer care for unused product only if the product is defective, damaged or wrong item is delivered within 15 days of delivery."
          )}
          <Link to={`/return-information`} className="MoreDetailsLinkStyle">
            {" "}
            {__("More info")}
          </Link>
        </p>
      </div>
    );
  }

  
  renderReturnInfo() {

    const { isArabic } = this.state;

    if(this.props.product.returnable === YES || ( this.props.product.returnable === YES_IN_ARABIC && isArabic )){
      return (
        <div>
          <p block="shippingAndFreeReturns" elem="infoShippingFee">
              {__("Return any unsatisfactory items within 100 days from receiving your order.")}
          </p>
        </div>
      )
    } else if (this.props.product.returnable === NO || ( this.props.product.returnable === NO_IN_ARABIC && isArabic ) ){
      return (
        <div>
          <p block="shippingAndFreeReturns" elem="infoShippingFee">
            {__("Item cannot be returned.")}
          </p>
        </div>
      )
    } 

    return (
      <div>
        <p block="shippingAndFreeReturns" elem="infoShippingFee">
          {__(
              "Returns are available through customer care within 15 days of receiving the order only if the product is not used, defective, damaged or wrong item has been delivered."
            )}
        </p>
      </div>
    )

  }

  renderShippingInfo() {
    let country = getCountryFromUrl();
      let txt = {
        AE: __(
          "*Free delivery for orders above AED 200."
        ),
        SA: __(
          "*Free delivery for orders above SAR 200."
        ),
        KW: __(
          "*Free delivery for orders above KWD 20."
        ),
        QA: __(
          "*Free delivery for orders above QAR 200."
        ),
        OM: __(
          "*Free delivery for orders above OMR 20."
        ),
        BH: __(
          "*Free delivery for orders above BHD 20."
        ),
      };
  
    return (
      <div>
        <p block="shippingAndFreeReturns" elem="infoShippingFee">
          <b block="shippingAndFreeReturns" elem="infoShippingFeeBold"
            >
              {txt[country]}
            </b>
          <br />
        </p>
        <div block="FindOutMore">
          <Link block="FindOutMore" elem="MoreButton" to={`/shipping-policy`}>
            <span block="FindOutMore" elem="ButtonText">
              {__("Find Out More")}
            </span>
          </Link>
        </div>
      </div>
    )
  }
  


  render() {
    const {
      product: { brand_name },
      pdpWidgetsAPIData= []
    } = this.props;
    const { isMobile } = this.state;
    return (
      <div block="PDPDetailsSection">
        {isMobile ? (
          <div block="MobileIcons">
            {this.renderSeperator()} {this.renderIconsSection()}
          </div>
        ) : (
          ""
        )}
        <div block="AccordionWrapper">
          <Accordion
            mix={{ block: "PDPDetailsSection", elem: "Accordion" }}
            title={isMobile ? __("Description") : __("PRODUCT DETAILS:")}
            is_expanded={this.state.isExpanded["0"]}
          >
            {!isMobile ? this.renderIconsSection() : ""}
            {this.renderDescription()}
          </Accordion>
          {this.renderAccordionSeperator()}
          {/* {this.renderShareButton()} */}
          {isMobile ? this.renderAboutBrand() : ""}
        </div>
        {isMobile ? null : this.renderSeperator()}

        {
          this.props?.product?.returnable ? (

            <div block="AccordionWrapper">
              <Accordion
                mix={{ block: "PDPDetailsSection", elem: "Accordion" }}
                title={isMobile ? __("Return Policy") : __("RETURN POLICY")}
                is_expanded={this.state.isExpanded["3"]}
              >
                {this.renderReturnInfo()}
                {this.renderShippingInfo()}
                {isMobile ? <br /> : null}
              </Accordion>
                {this.renderAccordionSeperator()}
            </div>
            
          ) : (
            null
          )
        }

        {pdpWidgetsAPIData?.length > 0 ? (
          <div block="PDPWidgets">{this.renderPdpWidgets()}</div>
        ) : null}
        {isMobile ? this.renderMoreFromTheBrand() : ""}
        {isMobile ? this.renderContactUsSection() : ""}
        {/* <div block="Seperator2" /> */}

        {/* <Accordion
            mix={ { block: 'PDPDetailsSection', elem: 'Accordion' } }
            title={ __('Size & Fit') }
            is_expanded={this.state.isExpanded["1"]}
          >
              { this.renderSizeAndFit() }
        </Accordion> */}
        {/*        <Accordion
                  mix={ { block: 'PDPDetailsSection', elem: 'Accordion' } }
                  title={ __('Click & Collect') }
                  is_expanded={this.state.isExpanded["2"]}
                >
                </Accordion>
                <Accordion
                  mix={ { block: 'PDPDetailsSection', elem: 'Accordion' } }
                  title={ __('Shipping & Free Returns') }
                  is_expanded={this.state.isExpanded["3"]}
                >
                </Accordion>
                <Accordion
                  mix={ { block: 'PDPDetailsSection', elem: 'Accordion' } }
                  title={ `${__('About')} ${brand_name}` }
                  is_expanded={this.state.isExpanded["4"]}
                >
                </Accordion>

                */}
      </div>
    );
  }
}

export default PDPDetailsSection;
