import { MyAccountReturnSuccessItem as SourceComponent } from "Component/MyAccountReturnSuccessItem/MyAccountReturnSuccessItem.component";

import { formatPrice } from "../../../packages/algolia-sdk/app/utils/filters";
import { isArabic } from "Util/App";
import "./MyAccountOrderViewItem.style";
import { isObject } from "Util/API/helper/Object";
import { getDefaultEddDate, getDefaultEddMessage } from "Util/Date/index";
import {
  DEFAULT_MESSAGE,
  DEFAULT_READY_MESSAGE,
  EDD_MESSAGE_ARABIC_TRANSLATION,
  INTL_BRAND,
  DEFAULT_SPLIT_KEY,
  DEFAULT_READY_SPLIT_KEY,
} from "../../util/Common/index";
import { SPECIAL_COLORS } from "../../util/Common";
import Event, { EVENT_GTM_EDD_VISIBILITY } from "Util/Event";
import { Store } from "../Icons";

export class MyAccountOrderViewItem extends SourceComponent {
  renderDetails() {
    let {
      currency,
      edd_info,
      compRef,
      displayDiscountPercentage,
      isFailed,
      item: {
        brand_name = "",
        name,
        color,
        price,
        size: { value: size = "" } = {},
        qty,
        cross_border = 0,
        ctc_store_name = "",
        int_shipment = "0",
      } = {},
      status,
      paymentMethod,
    } = this.props;
    const isIntlBrand =
      (((INTL_BRAND.includes(brand_name.toString().toLowerCase()) &&
        parseInt(cross_border) === 1) ||
        parseInt(cross_border) === 1) &&
        edd_info &&
        edd_info.has_cross_border_enabled) ||
      int_shipment === "1";
    const orderEddDetails = JSON.parse(localStorage.getItem("ORDER_EDD_ITEMS"));
    const renderOtherEdd =
      paymentMethod?.code === "checkout_qpay" ||
      paymentMethod?.code === "tabby_installments";
    return (
      <div block="MyAccountReturnSuccessItem" elem="Details">
        <h2>{brand_name}</h2>
        <div block="MyAccountOrderViewItem" elem="Name">
          {name}
        </div>
        
        <div block="MyAccountReturnSuccessItem" elem="DetailsOptions">
          {!!color && (
            <p>
              {__("Color: ")}
              <span>{color}</span>
            </p>
          )}
          {!!qty && (
            <p>
              {__("Qty: ")}
              <span>{+qty}</span>
            </p>
          )}
          {!!size && (
            <p>
              {__("Size: ")}
              <span>{size}</span>
            </p>
          )}
        </div>
        <p block="MyAccountReturnSuccessItem" elem="Price">
          <span block="MyAccountReturnSuccessItem" elem="PriceRegular">
            {`${formatPrice(+price, currency)}`}
          </span>
        </p>
        {!!ctc_store_name && (
          <div block="MyAccountOrderViewItem" elem="ClickAndCollect">
            <Store />
            <div
              block="MyAccountOrderViewItem-ClickAndCollect"
              elem="StoreName"
            >
              {ctc_store_name}
            </div>
          </div>
        )}
        {((renderOtherEdd &&
          orderEddDetails &&
          edd_info &&
          edd_info.is_enable) ||
          (edd_info && edd_info.is_enable)) &&
          (isIntlBrand || parseInt(cross_border) === 0) &&
          !isFailed &&
          status !== "payment_failed" &&
          status !== "payment_aborted" &&
          this.renderEdd(parseInt(cross_border) === 1, orderEddDetails)}
        {isIntlBrand &&
          edd_info &&
          edd_info.is_enable &&
          !isFailed &&
          status !== "payment_failed" &&
          status !== "payment_aborted" &&
          this.renderIntlTag()}
      </div>
    );
  }

  renderIntlTag() {
    return (
      <span block="AdditionShippingInformation">
        {__("International Shipment")}
      </span>
    );
  }

  renderEdd = (crossBorder, orderEddDetails) => {
    const {
      eddResponse,
      compRef,
      myOrderEdd,
      setEddEventSent,
      eddEventSent,
      edd_info,
      item: { edd_msg_color, brand_name = "", ctc_store_name },
      intlEddResponse,
    } = this.props;
    let actualEddMess = "";
    let actualEdd = "";
    const defaultDay = ctc_store_name
      ? edd_info.ctc_message
      : edd_info.default_message;

    const paymentInformation = JSON.parse(localStorage.getItem("PAYMENT_INFO"));
    const { defaultEddDay, defaultEddMonth, defaultEddDat } =
      getDefaultEddDate(defaultDay);

    if (compRef === "checkout") {
      let customDefaultMess = isArabic()
        ? EDD_MESSAGE_ARABIC_TRANSLATION[DEFAULT_READY_MESSAGE]
        : DEFAULT_READY_MESSAGE;
      const isIntlBrand =
        ((INTL_BRAND.includes(brand_name.toString().toLowerCase()) && crossBorder) ||
          crossBorder) &&
        edd_info &&
        edd_info.has_cross_border_enabled;
      const intlEddObj = intlEddResponse["thankyou"]?.find(
        ({ vendor }) => vendor.toLowerCase() === brand_name.toString().toLowerCase()
      );
      const intlEddMess = intlEddObj
        ? isArabic()
          ? intlEddObj["edd_message_ar"]
          : intlEddObj["edd_message_en"]
        : isIntlBrand
        ? isArabic()
          ? intlEddResponse["thankyou"][0]["edd_message_ar"]
          : intlEddResponse["thankyou"][0]["edd_message_en"]
        : "";

      if (isIntlBrand) {
        actualEddMess = intlEddMess;
      } else {
        if (ctc_store_name) {
          actualEddMess = `${customDefaultMess} ${defaultEddDat} ${defaultEddMonth}, ${defaultEddDay}`;
        } else {
          actualEddMess = paymentInformation["finalEddString"];
        }
      }
    } else {
      actualEddMess = myOrderEdd;
      actualEdd = myOrderEdd;
      if (myOrderEdd && !eddEventSent && edd_info) {
        Event.dispatch(EVENT_GTM_EDD_VISIBILITY, {
          edd_details: {
            edd_status: edd_info.has_order_detail,
            default_edd_status: null,
            edd_updated: null,
          },
          page: "my_order",
        });
        setEddEventSent();
      }
    }

    if (!actualEddMess) {
      return null;
    }

    let colorCode =
      compRef === "checkout" ? SPECIAL_COLORS["shamrock"] : edd_msg_color;
    let splitKey = DEFAULT_SPLIT_KEY;
    let splitReadyByKey = DEFAULT_READY_SPLIT_KEY;
    const splitByInclude = actualEddMess.includes(splitKey);
    const splitByReadyInclude =
      splitReadyByKey && actualEddMess.includes(splitReadyByKey);
    const idealFormat = splitByInclude || splitByReadyInclude ? true : false;
    let splitBy = actualEddMess.split(splitKey);

    if (idealFormat) {
      if (splitByReadyInclude) {
        splitBy = actualEddMess.split(splitReadyByKey);
        splitKey = splitReadyByKey;
      } else {
        splitBy = actualEddMess.split(splitKey);
        splitKey = splitKey;
      }
    }

    return (
      <div block="AreaText" mods={{ isArabic: isArabic() ? true : false }}>
        <span
          style={{ color: !idealFormat ? colorCode : SPECIAL_COLORS["nobel"] }}
        >
          {idealFormat ? `${splitBy[0]} ${splitKey}` : null}{" "}
        </span>
        <span style={{ color: colorCode }}>
          {idealFormat ? `${splitBy[1]}` : actualEddMess}
        </span>
      </div>
    );
  };
  render() {
    return (
      <div
        block="MyAccountOrderViewItem"
        mix={{ block: "MyAccountReturnSuccessItem" }}
      >
        <div block="MyAccountReturnSuccessItem" elem="Content">
          {this.renderImage()}
          {this.renderDetails()}
        </div>
      </div>
    );
  }
}

export default MyAccountOrderViewItem;
