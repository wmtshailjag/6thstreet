import Accordion from "Component/Accordion";
import { MINI_CARDS } from "Component/CreditCard/CreditCard.config";
import Image from "Component/Image";
import Loader from "Component/Loader";
import {
  STATUS_BEING_PROCESSED,
  STATUS_EXCHANGE_PENDING,
  STATUS_CANCELED,
  STATUS_COMPLETE,
  STATUS_FAILED,
  STATUS_PAYMENT_ABORTED,
  STATUS_EXCHANGE_REJECTED,
  STATUS_SUCCESS,
  translateArabicStatus,
} from "Component/MyAccountOrderListItem/MyAccountOrderListItem.config";
import MyAccountOrderViewItem from "Component/MyAccountOrderViewItem";
import { getFinalPrice } from "Component/Price/Price.config";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { ExtendedOrderType } from "Type/API";
import { HistoryType } from "Type/Common";
import { getCurrency, isArabic } from "Util/App";
import { appendOrdinalSuffix } from "Util/Common";
import { formatDate, getDefaultEddDate } from "Util/Date";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { formatPrice } from "../../../packages/algolia-sdk/app/utils/filters";
import {
  APPLE_PAY,
  CASH_ON_DELIVERY,
  EXCHANGE_STORE_CREDIT,
  CHECKOUT_APPLE_PAY,
  CHECKOUT_QPAY,
  CHECK_MONEY,
  TABBY_ISTALLMENTS,
} from "../CheckoutPayments/CheckoutPayments.config";
import Event, { EVENT_GTM_EDD_VISIBILITY } from "Util/Event";
import Applepay from "./icons/apple.png";
import CancelledImage from "./icons/cancelled.png";
import CloseImage from "./icons/close.png";
import PackageImage from "./icons/package.png";
import QPAY from "./icons/qpay.png";
import TimerImage from "./icons/timer.png";
import isMobile from "Util/Mobile";
import TruckImage from "./icons/truck.png";
import WarningImage from "./icons/warning.png";
import { Store } from "../Icons";
import ContactHelpContainer from "Component/ContactHelp/ContactHelp.container";
import {
  CANCEL_ITEM_LABEL,
  DELIVERY_FAILED,
  DELIVERY_SUCCESSFUL,
  RETURN_ITEM_LABEL,
  STATUS_IN_TRANSIT,
  EXCHANGE_ITEM_LABEL,
  CANCEL_ORDER_LABEL,
  NEW_STATUS_LABEL_MAP,
  NEW_EXCHANGE_STATUS_LABEL_MAP,
  STATUS_DISPATCHED,
  PICKUP_FAILED,
  PICKEDUP,
  READY_TO_PICK,
} from "./MyAccountOrderView.config";
import "./MyAccountOrderView.style";
import Link from "Component/Link";
import { isObject } from "Util/API/helper/Object";
import {
  SPECIAL_COLORS,
  DEFAULT_SPLIT_KEY,
  DEFAULT_READY_SPLIT_KEY,
} from "../../util/Common";
import {
  EVENT_MOE_RETURN_AN_ITEM_CLICK,
  EVENT_MOE_CANCEL_AN_ITEM_CLICK,
} from "Util/Event";

class MyAccountOrderView extends PureComponent {
  static propTypes = {
    order: ExtendedOrderType,
    isLoading: PropTypes.bool.isRequired,
    getCountryNameById: PropTypes.func.isRequired,
    openOrderCancelation: PropTypes.func.isRequired,
    history: HistoryType.isRequired,
    displayDiscountPercentage: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    order: null,
    displayDiscountPercentage: true,
  };

  state = {
    isArabic: isArabic(),
    eddEventSent: false,
  };

  renderAddress = (title, address) => {
    const { getCountryNameById } = this.props;
    const {
      firstname,
      middlename,
      lastname,
      street,
      postcode,
      city,
      country_id,
      telephone,
    } = address;

    return (
      <div block="MyAccountOrderView" elem="Address">
        <h3>{title}</h3>
        <p>{`${firstname} ${middlename || ""} ${lastname}`.trim()}</p>
        <p block="Address" elem="Street">{`${street} ${postcode}`}</p>
        <p>{`${city} - ${getCountryNameById(country_id)}`}</p>
        <p>{`${telephone}`}</p>
      </div>
    );
  };

  setEddEventSent = () => {
    this.setState({ eddEventSent: true });
  };

  renderItem = (item, eddItem) => {
    const {
      order: { order_currency_code: currency, status },
      displayDiscountPercentage,
      eddResponse,
      edd_info,
    } = this.props;
    const { eddEventSent } = this.state;
    let finalEdd =
      item.status === "Processing" || item.status === "processing"
        ? eddItem?.edd
        : item?.edd;
    return (
      <MyAccountOrderViewItem
        key={item.item_id}
        item={item}
        setEddEventSent={this.setEddEventSent}
        eddEventSent={eddEventSent}
        status={status}
        myOrderEdd={finalEdd}
        compRef={"myOrder"}
        eddResponse={eddResponse}
        edd_info={edd_info}
        currency={currency}
        displayDiscountPercentage={displayDiscountPercentage}
      />
    );
  };

  renderTitle() {
    const { isArabic } = this.state;
    const {
      order: { increment_id },
    } = this.props;
    return (
      <div block="MyAccountOrderView" elem="Heading" mods={{ isArabic }}>
        <h3 block="Heading" elem="HeadingText">
          {__("Order #%s", increment_id)}
        </h3>
      </div>
    );
  }
  sendMoeEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: "OrderDetails",
      app6thstreet_platform: "Web",
    });
  }
  renderStatus() {
    const {
      openOrderCancelation,
      order: {
        status,
        created_at,
        is_returnable,
        is_cancelable,
        is_exchangeable,
        is_exchange_order = 0
      },
      is_exchange_enabled = false
    } = this.props;

    const modifiedStatus =  is_exchange_order=== 1 && status === 'complete' ? 'exchange_complete':status
    const finalStatus = isArabic()
      ? translateArabicStatus(modifiedStatus)
      : modifiedStatus
        ? modifiedStatus.split("_").join(" ")
        : "";
    if (STATUS_FAILED.includes(status)) {
      const title =
        status === STATUS_PAYMENT_ABORTED
          ? __("Payment Failed")
          : status === STATUS_EXCHANGE_REJECTED
          ? __("Exchange Rejected")
          : __("Order Cancelled");
      const StatusImage =
        status === STATUS_PAYMENT_ABORTED ? WarningImage : CloseImage;
      return (
        <div block="MyAccountOrderView" elem="StatusFailed">
          <Image
            src={StatusImage}
            mix={{ block: "MyAccountOrderView", elem: "WarningImage" }}
            alt={title ? title : "Warning-image"}
          />
          <p>{title}</p>
        </div>
      );
    }
    return (
      <div block="MyAccountOrderView" elem="Status">
        <div>
          <p
            block="MyAccountOrderView"
            elem="StatusTitle"
            mods={{ isSuccess: STATUS_SUCCESS.includes(status) }}
          >
            {__("Status: ")}
            <span>{`- ${finalStatus}`}</span>
          </p>
          <p block="MyAccountOrderView" elem="StatusDate">
            {__("Order placed: ")}
            <span>
              {formatDate(
                "DD MMM YYYY",
                new Date(created_at.replace(/-/g, "/"))
              )}
            </span>
          </p>
        </div>
        {
          <div block="MyAccountOrderView" elem="HeadingButtons">
            {is_returnable && (
              <button
                onClick={() => {
                  openOrderCancelation(RETURN_ITEM_LABEL);
                  this.sendMoeEvents(EVENT_MOE_RETURN_AN_ITEM_CLICK);
                }}
              >
                {RETURN_ITEM_LABEL}
              </button>
            )}
            {
              is_exchangeable && is_exchange_enabled &&
              <button onClick={() => openOrderCancelation(EXCHANGE_ITEM_LABEL)}>
                {EXCHANGE_ITEM_LABEL}
              </button>
            }
            {status === STATUS_EXCHANGE_PENDING && is_cancelable ? (
              <div block="MyAccountOrderView" elem="HeadingButton">
                <button
                  onClick={() => openOrderCancelation(CANCEL_ORDER_LABEL)}
                >
                  {CANCEL_ORDER_LABEL}
                </button>
              </div>
            ) : is_cancelable ? (
              <button
                onClick={() => {
                  openOrderCancelation(CANCEL_ITEM_LABEL);
                  this.sendMoeEvents(EVENT_MOE_CANCEL_AN_ITEM_CLICK);
                }}
              >
                {CANCEL_ITEM_LABEL}
              </button>
            ) : null}
          </div>
        }
      </div>
    );
  }

  renderPackagesMessage() {
    const {
      order: { groups: shipped = [] },
    } = this.props;
    const { isArabic } = this.state;

    const isPackageMessageVisible = shipped.some((order) => {
      return (
        order.status === STATUS_IN_TRANSIT || order.status === STATUS_DISPATCHED
      );
    });
    if (!isPackageMessageVisible) {
      return null;
    }

    // if (STATUS_FAILED.includes(status) || shipped.length < 1) {
    //   return null;
    // }
    return (
      <div
        block="MyAccountOrderView"
        elem="PackagesMessage"
        mods={{ isArabic }}
      >
        <Image
          src={TruckImage}
          mix={{ block: "MyAccountOrderView", elem: "TruckImage" }}
          alt={"Truckimage"}
        />
        <p>
          {
            shipped.length <= 1
              ? __(
                  "Your order has been shipped in a single package, please find the package details below."
                )
              : __(
                  "Your order has been shipped in multiple packages, please find the package details below."
                )
            // eslint-disable-next-line
          }
        </p>
      </div>
    );
  }

  formatGroupStatus = (status) => {
    // use toLowerCase because sometimes the response from backend is not consistent
    switch (status?.toLowerCase()) {
      case "courier_dispatched": {
        return __("Shipped");
      }
      case "courier_in_transit": {
        return __("In Transit");
      }
      case "delivery_successful": {
        return __("Delivered");
      }
      case "delivery_failed": {
        return __("Delivery Failed");
      }
      case "cancelled": {
        return __("Order Cancelled");
      }
      case "readytopick": {
        return __("Ready for Pick up");
      }
      case "pickedup": {
        return __("Items Picked Up");
      }
      case "pickupfailed": {
        return __("Pick up Failed");
      }
      default: {
        return null;
      }
    }
  };

  renderAccordionTitle(title, image, status = null, deliveryDate = null) {
    const packageStatus = /\d/.test(title)
      ? this.formatGroupStatus(status)
      : null;
    return (
      <div block="MyAccountOrderView" elem="AccordionTitle">
        <Image
          src={image}
          mix={{
            block: "MyAccountOrderView",
            elem: "AccordionTitleImage",
            mods: { isArabic: isArabic() },
          }}
          alt={title ? title : "AccordionTitleImage"}
        />
        <h3>
          {title}
          {!!packageStatus && <span>{` - ${packageStatus}`}</span>}
          {/* {status === DELIVERY_SUCCESSFUL && deliveryDate ?
          <span>: &nbsp;{formatDate(
            "DD MMMM YYYY",
            new Date(deliveryDate.replace(/-/g, "/"))
          )}</span>: null } */}
        </h3>
      </div>
    );
  }

  shouldDisplayBar = (status) => {
    switch (status) {
      case STATUS_DISPATCHED:
      case STATUS_IN_TRANSIT:
      case DELIVERY_SUCCESSFUL: {
        return true;
      }

      default: {
        return false;
      }
    }
  };

  renderAccordionProgress(status, item) {
    const displayStatusBar = this.shouldDisplayBar(status);
    const {
      order: { is_exchange_order: exchangeCount },
    } = this.props;
    if (!displayStatusBar) {
      return null;
    }
    let finalEdd =
      item.status === "Processing" || item.status === "processing"
        ? item.items[0]?.edd
        : item?.edd;
    let colorCode =
      item.status === "Processing" || item.status === "processing"
        ? item.items[0]?.edd_msg_color
        : item?.edd_msg_color;
    let crossBorder =
      item.cross_border && item.cross_border === 1 ? true : false;
    const STATUS_LABELS =
      exchangeCount === 1
        ? Object.assign({}, NEW_EXCHANGE_STATUS_LABEL_MAP)
        : Object.assign({}, NEW_STATUS_LABEL_MAP);
    return (
      <div
        block="MyAccountOrderView"
        elem="AccordionStatus"
        mix={{ block: "MyAccountOrderListItem", elem: "Status" }}
      >
        <div block="MyAccountOrderListItem" elem="ProgressBar">
          <div
            block="MyAccountOrderListItem"
            elem="ProgressCurrent"
            mods={{
              isShipped: status === STATUS_DISPATCHED,
              inTransit: status === STATUS_IN_TRANSIT,
              isDelivered: status === DELIVERY_SUCCESSFUL,
            }}
          />
          <div
            block="MyAccountOrderListItem"
            elem="ProgressCheckbox"
            mods={{
              isShipped: status === STATUS_DISPATCHED,
              inTransit: status === STATUS_IN_TRANSIT,
              isDelivered: status === DELIVERY_SUCCESSFUL,
            }}
          />
        </div>
        <div block="MyAccountOrderListItem" elem="StatusList">
          {Object.values(STATUS_LABELS).map((label, index) => (
            <div block={index === 2 ? "EddDiv" : ""} key={index}>
              <p block="MyAccountOrderListItem" elem="StatusTitle">
                {label}
              </p>
              {index === 2 &&
                !crossBorder &&
                this.renderEdd(finalEdd, colorCode)}
              {/* <p block="MyAccountOrderListItem" elem="StatusTitle">
                {label === STATUS_DISPATCHED && item?.courier_shipped_date ? formatDate(
                  "DD MMM",
                  new Date(item?.courier_shipped_date?.replace(/-/g, "/"))
                )
                  : label === STATUS_IN_TRANSIT && item?.courier_in_transit_date ? formatDate(
                    "DD MMM",
                    new Date(item?.courier_in_transit_date?.replace(/-/g, "/"))
                  ) : item.courier_deliver_date ? formatDate(
                    "DD MMM",
                    new Date(item?.courier_deliver_date?.replace(/-/g, "/"))
                  ): null}
              </p> */}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderEdd = (finalEdd, colorCode) => {
    let actualEddMess = finalEdd;
    const { eddEventSent } = this.state;
    const { edd_info } = this.props;
    if (!actualEddMess) {
      return null;
    }
    if (actualEddMess && !eddEventSent) {
      Event.dispatch(EVENT_GTM_EDD_VISIBILITY, {
        edd_details: {
          edd_status: edd_info.has_order_detail,
          default_edd_status: null,
          edd_updated: null,
        },
        page: "my_order",
      });
      this.setEddEventSent();
    }
    let splitKey = DEFAULT_SPLIT_KEY;
    let splitReadyByKey = DEFAULT_READY_SPLIT_KEY;
    const splitByReadyInclude = actualEddMess.includes(splitReadyByKey);

    let finalColorCode = colorCode ? colorCode : SPECIAL_COLORS["shamrock"];
    const idealFormat =
      splitByReadyInclude || actualEddMess.includes(splitKey) ? true : false;
    let commonSplitKey = splitByReadyInclude ? splitReadyByKey : splitKey;

    return (
      <div block="AreaText">
        <span
          style={{
            color: !idealFormat ? finalColorCode : SPECIAL_COLORS["nobel"],
          }}
        >
          {splitByReadyInclude
            ? `${splitReadyByKey}`
            : idealFormat
            ? `${actualEddMess.split(splitKey)[0]} ${splitKey}`
            : null}{" "}
        </span>
        <span style={{ color: finalColorCode }}>
          {idealFormat
            ? `${actualEddMess.split(commonSplitKey)[1]}`
            : actualEddMess}
        </span>
      </div>
    );
  };
  renderProcessingItems() {
    const {
      order: { status, groups: unship = [] },
    } = this.props;
    if (STATUS_FAILED.includes(status) || !unship.length) {
      return null;
    }
    const processingItems = unship
      .reduce((acc, { items }) => [...acc, ...items], [])
      .filter(({ qty_canceled, qty_ordered }) => +qty_canceled < +qty_ordered);
    if (processingItems.length > 0) {
      return (
        <div block="MyAccountOrderView" elem="AccordionWrapper">
          <Accordion
            mix={{ block: "MyAccountOrderView", elem: "Accordion" }}
            title={this.renderAccordionTitle(
              __("Items under processing"),
              TimerImage
            )}
            is_expanded
            MyAccountSection={true}
          >
            {processingItems.map((item) => this.renderItem(item, ""))}
          </Accordion>
        </div>
      );
    }
  }

  renderCanceledAccordion() {
    const {
      order: { status, groups: shipped = [] },
    } = this.props;
    const allItems = [
      ...shipped.reduce((acc, { items }) => [...acc, ...items], []),
    ];
    if (STATUS_CANCELED === status) {
      return (
        <div block="MyAccountOrderView" elem="AccordionWrapper">
          <Accordion
            mix={{ block: "MyAccountOrderView", elem: "Accordion" }}
            title={this.renderAccordionTitle(
              __("Cancelled items"),
              CancelledImage
            )}
            MyAccountSection={true}
          >
            {allItems.map((item) => this.renderItem(item, ""))}
          </Accordion>
        </div>
      );
    }

    const canceledItems = allItems.filter(
      ({ qty_partial_canceled }) => +qty_partial_canceled > 0
    );

    if (!canceledItems.length) {
      return null;
    }

    return (
      <div block="MyAccountOrderView" elem="AccordionWrapper">
        <Accordion
          mix={{ block: "MyAccountOrderView", elem: "Accordion" }}
          title={this.renderAccordionTitle(
            __("Cancelled items"),
            CancelledImage
          )}
          MyAccountSection={true}
        >
          {canceledItems.map((item) => this.renderItem(item, ""))}
        </Accordion>
      </div>
    );
  }

  renderAccordion(item, index) {
    const {
      order: { groups: shipped = [] },
    } = this.props;
    const { isArabic } = this.state;
    const itemNumber = shipped.length;
    const suffixNumber = appendOrdinalSuffix(itemNumber - index);
    const getIcon =
      item.status === "Cancelled" || item.status === "cancelled"
        ? CancelledImage
        : item.status === "Processing" || item.status === "processing"
        ? TimerImage
        : PackageImage;
    return (
      <div
        key={item.shipment_number}
        block="MyAccountOrderView"
        elem="AccordionWrapper"
        mods={{ isArabic }}
      >
        <Accordion
          mix={{ block: "MyAccountOrderView", elem: "Accordion" }}
          is_expanded={index === 0}
          shortDescription={this.renderAccordionProgress(item.status, item)}
          title={this.renderAccordionTitle(
            item.label,
            getIcon,
            item.status,
            item.courier_deliver_date
          )}
          MyAccountSection={true}
        >
          {item.status !== DELIVERY_SUCCESSFUL &&
            item.status !== DELIVERY_FAILED &&
            item.status !== PICKUP_FAILED &&
            item.status !== PICKEDUP &&
            item.status !== READY_TO_PICK &&
            this.renderShipmentTracking(
              item.courier_name,
              item.courier_logo,
              item.courier_tracking_link
            )}
          {!!item?.ctc_store_name && (
            <div block="MyAccountOrderView" elem="ClickAndCollect">
              <Store />
              <div block="MyAccountOrderView-ClickAndCollect" elem="StoreName">
                {item?.ctc_store_name}
              </div>
            </div>
          )}
          <p>
            {__(
              "Package contains %s %s",
              item.items.length,
              item.items.length === 1 ? __("item") : __("items")
            )}
          </p>
          <div></div>
          {item.items.map((data) => this.renderItem(data, item))}
        </Accordion>
      </div>
    );
  }

  renderAccordions() {
    const {
      order: { status, groups: shipped = [] },
    } = this.props;
    if (STATUS_FAILED.includes(status)) {
      return null;
    }

    return (
      <div block="MyAccountOrderView" elem="Accordions">
        {shipped.map((item, index) => this.renderAccordion(item, index))}
        {/* {this.renderProcessingItems()}
        {this.renderCanceledAccordion()} */}
      </div>
    );
  }

  renderFailedOrderDetails() {
    const {
      order: { status, groups: unship = [] },
    } = this.props;
    const itemsArray = unship.reduce(
      (acc, { items }) => [...acc, ...items],
      []
    );

    if (!STATUS_FAILED.includes(status)) {
      return null;
    }

    return (
      <div
        block="MyAccountOrderView"
        elem="OrderDetails"
        mods={{ failed: true }}
      >
        <h3>{__("Order detail")}</h3>
        {itemsArray.map((item) => this.renderItem(item, ""))}
      </div>
    );
  }

  renderSummary() {
    const {
      order: {
        status,
        subtotal,
        grand_total,
        order_currency_code,
        msp_cod_amount,
      },
    } = this.props;

    if (status !== STATUS_PAYMENT_ABORTED) {
      return null;
    }

    return (
      <div block="MyAccountOrderView" elem="Summary">
        <p block="MyAccountOrderView" elem="SummaryItem">
          <span>{__("Subtotal")}</span>
          <span>{formatPrice(+subtotal, order_currency_code)}</span>
        </p>
        {!!msp_cod_amount && (
          <p block="MyAccountOrderView" elem="SummaryItem">
            <span>
              {getCountryFromUrl() === "QA"
                ? __("Cash on Receiving Fee")
                : __("Cash on Delivery Fee")}
            </span>
            <span>{formatPrice(+msp_cod_amount, order_currency_code)}</span>
          </p>
        )}
        <p
          block="MyAccountOrderView"
          elem="SummaryItem"
          mods={{ grandTotal: true }}
        >
          <span>{__("Total")}</span>
          <span>{formatPrice(+grand_total, order_currency_code)}</span>
        </p>
      </div>
    );
  }

  renderMiniCard(miniCard) {
    const img = MINI_CARDS[miniCard];
    if (img) {
      return <img src={img} alt="card icon" />;
    }
    return null;
  }

  renderCardPaymentType() {
    const {
      order: {
        payment: {
          cc_type,
          method,
          // cc_last_4,
          additional_information: {
            source: { last4, scheme },
          },
        },
      },
    } = this.props;
    if (!!!scheme) {
      return null;
    }
    return (
      <div block="MyAccountOrderView" elem="CardPaymentType">
        <div block="MyAccountOrderView" elem="TypeLogo">
          {method === CHECKOUT_APPLE_PAY ? (
            <img src={Applepay} alt="Apple pay" />
          ) : method === CHECKOUT_QPAY ? (
            <img src={QPAY} alt="Apple pay" />
          ) : (
            this.renderMiniCard(scheme?.toLowerCase())
          )}
        </div>
        <div block="MyAccountOrderView" elem="Number">
          <div block="MyAccountOrderView" elem="Number-Dots">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div block="MyAccountOrderView" elem="Number-Value">
            {/* {cc_last_4} */}
            {last4 ? last4 : ""}
          </div>
        </div>
      </div>
    );
  }

  renderPaymentTypeText(paymentTitle) {
    return (
      <div block="MyAccountOrderView" elem="TypeTitle">
        {__(paymentTitle)}
      </div>
    );
  }

  renderOrderPaymentType() {
    const {
      order: {
        status,
        payment,
        payment: { method },
        club_apparel_amount = 0,
        store_credit_amount = 0,
      },
    } = this.props;

    if (!!!payment) {
      return null;
    }

    switch (method) {
      case "checkout":
        if (!payment?.additional_information?.source?.last4) {
          return this.renderPaymentTypeText(__("Credit Card"));
        }
        return this.renderCardPaymentType();
      case TABBY_ISTALLMENTS:
        return this.renderPaymentTypeText(__("Tabby: Pay in installments"));
      case CHECK_MONEY:
      case CASH_ON_DELIVERY:
        return this.renderPaymentTypeText(
          getCountryFromUrl() === "QA"
            ? __("Cash on Receiving")
            : __("Cash on Delivery")
        );
      case APPLE_PAY:
      case CHECKOUT_APPLE_PAY:
        if (!this.props?.additional_information?.source?.last4) {
          return this.renderPaymentTypeText(__("Apple Pay"));
        }
        return this.renderCardPaymentType();
      case CHECKOUT_QPAY:
        if (!payment?.additional_information?.source?.last4) {
          return this.renderPaymentTypeText(__("QPAY"));
        }
        return this.renderCardPaymentType();
      case EXCHANGE_STORE_CREDIT:
        return this.renderPaymentTypeText(__("Exchange Store Credit"));
      case "free":
        if (parseFloat(club_apparel_amount) !== 0) {
          return this.renderPaymentTypeText(__("Club Apparel"));
        } else if (store_credit_amount !== 0) {
          return this.renderPaymentTypeText(__("Store Credit"));
        }
        return;
      case "checkout_knet":
        return this.renderPaymentTypeText("KNET");
      default:
        return null;
    }
  }

  renderPaymentType() {
    return (
      <div block="MyAccountOrderView" elem="PaymentType">
        <h3>{__("Payment")}</h3>
        {this.renderOrderPaymentType()}
      </div>
    );
  }

  renderPriceLine(price, name, mods = {}, allowZero = false) {
    if (!price && !allowZero) {
      return null;
    }
    const { isTotal, isStoreCredit, isClubApparel } = mods;
    const formatPrice =
      isStoreCredit || isClubApparel ? parseFloat(-price) : parseFloat(price);

    const {
      order: { order_currency_code: currency_code = getCurrency() },
    } = this.props;
    const finalPrice = getFinalPrice(formatPrice, currency_code);

    return (
      <li block="MyAccountOrderView" elem="SummaryItem" mods={mods}>
        <strong block="MyAccountOrderView" elem="Text">
          {name}
          {isTotal && (
            <>
              {" "}
              <span>{__("(Taxes included)")}</span>
            </>
          )}
        </strong>
        <strong block="MyAccountOrderView" elem="Price">
          {currency_code} {finalPrice}
        </strong>
      </li>
    );
  }

  renderContact() {
    return (
      <>
        {isMobile.any() ? (
          <h3 style={{ textAlign: "center", padding: "12px 0px" }}>
            Questions about this order?
          </h3>
        ) : (
          ""
        )}
        <ContactHelpContainer accountPage={true} />
      </>
    );
  }
  renderPaymentSummary() {
    const {
      order: {
        subtotal = 0,
        grand_total = 0,
        shipping_amount = 0,
        discount_amount = 0,
        msp_cod_amount = 0,
        tax_amount = 0,
        customer_balance_amount = 0,
        store_credit_amount = 0,
        club_apparel_amount = 0,
        currency_code = getCurrency(),
      },
    } = this.props;
    const grandTotal = getFinalPrice(grand_total, currency_code);
    const subTotal = getFinalPrice(subtotal, currency_code);

    return (
      <div block="MyAccountOrderView" elem="OrderTotals">
        <ul>
          <div block="MyAccountOrderView" elem="Subtotals">
            {this.renderPriceLine(subTotal, __("Subtotal"))}
            {this.renderPriceLine(shipping_amount, __("Shipping"), {
              divider: true,
            })}
            {store_credit_amount !== 0
              ? this.renderPriceLine(store_credit_amount, __("Store Credit"), {
                  isStoreCredit: true,
                })
              : null}
            {parseFloat(club_apparel_amount) !== 0
              ? this.renderPriceLine(
                  club_apparel_amount,
                  __("Club Apparel Redemption"),
                  { isClubApparel: true }
                )
              : null}
            {parseFloat(discount_amount) !== 0
              ? this.renderPriceLine(discount_amount, __("Discount"))
              : null}
            {parseFloat(tax_amount) !== 0
              ? this.renderPriceLine(tax_amount, __("Tax"))
              : null}
            {parseFloat(msp_cod_amount) !== 0
              ? this.renderPriceLine(
                  msp_cod_amount,
                  getCountryFromUrl() === "QA"
                    ? __("Cash on Receiving Fee")
                    : __("Cash on Delivery Fee")
                )
              : null}
            {this.renderPriceLine(
              grandTotal,
              __("Total"),
              { isTotal: true },
              true
            )}
          </div>
        </ul>
      </div>
    );
  }

  goBack = () => {
    const { history } = this.props;

    history.goBack();
  };

  renderBackButton() {
    const { isArabic } = this.state;
    // eslint-disable-next-line jsx-a11y/control-has-associated-label
    return (
      <Link to="/my-account/my-orders">
        <button
          block="MyAccountOrderView"
          elem="BackButton"
          mods={{ isArabic }}
        />
      </Link>
    );
  }

  renderShipmentTracking(name, logo, link) {
    if (name && link) {
      return (
        <div block="ShipmentTracking">
          <div block="ShipmentTracking" elem="Courier">
            <div>Shipped via:</div>
            {logo ? (
              <div block="ShipmentTracking-Courier" elem="LogoContainer">
                <img src={logo} alt="name" />
              </div>
            ) : null}
          </div>
          <div block="ShipmentTracking" elem="Link">
            <a href={link} rel="noopener" target="_blank">
              Track Package
            </a>
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { isLoading, order } = this.props;
    if (isLoading || !order) {
      return (
        <div block="MyAccountOrderView">
          <Loader isLoading={isLoading} />
        </div>
      );
    }
    const { shipping_address } = order;
    return (
      <div block="MyAccountOrderView">
        <Loader isLoading={isLoading} />
        <div block="MyAccountOrderView" elem="Header">
          {this.renderBackButton()}
          {this.renderTitle()}
        </div>
        {this.renderStatus()}
        {this.renderPackagesMessage()}
        {this.renderAccordions()}
        {this.renderFailedOrderDetails()}
        {this.renderSummary()}
        {this.renderAddress(__("Delivering to"), shipping_address)}
        {this.renderPaymentType()}
        {this.renderPaymentSummary()}
        {this.renderContact()}
      </div>
    );
  }
}

export default MyAccountOrderView;
