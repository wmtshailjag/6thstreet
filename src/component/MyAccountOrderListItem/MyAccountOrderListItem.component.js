import { withRouter } from "react-router";
import Image from "Component/Image";
import { MyAccountReturnCreateListItem as SourceComponent } from "Component/MyAccountReturnCreateListItem/MyAccountReturnCreateListItem.component";
import { isArabic } from "Util/App";
import { formatDate } from "Util/Date";

import { formatPrice } from "../../../packages/algolia-sdk/app/utils/filters";
import PackageIcon from "./icons/box.png";
import {
  ARABIC_MONTHS,
  STATUS_BEING_PROCESSED,
  STATUS_FAILED,
  STATUS_HIDE_BAR,
  STATUS_SUCCESS,
  translateArabicStatus,
} from "./MyAccountOrderListItem.config";

import "./MyAccountOrderListItem.style";
import { EVENT_MOE_ORDER_ITEM_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class MyAccountOrderListItem extends SourceComponent {
  handleClick = () => {
    const {
      history,
      order: { id },
    } = this.props;

    history.push(`/my-account/my-orders/${id}`);
    Moengage.track_event(EVENT_MOE_ORDER_ITEM_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  };

  renderHeading() {
    const {
      order: { increment_id, status,is_exchange_order = 0 },
    } = this.props;
    const statusMods = {
      isSuccess: STATUS_SUCCESS.includes(status),
      isFailed: STATUS_FAILED.includes(status),
    };
    const modifiedStatus =  is_exchange_order === 1 && status === 'complete' ? 'exchange_complete':status
    const finalStatus = isArabic()
      ? translateArabicStatus(modifiedStatus)
      : modifiedStatus
        ? modifiedStatus.split("_").join(" ")
        : "";

    return (
      <p
        block="MyAccountOrderListItem"
        elem="Heading"
        mods={statusMods}
        mix={{ block: "MyAccountReturnCreateListItem", elem: "Heading" }}
      >
        {__("Order #%s ", increment_id)}
        <span>
          {/* Some statuses are written with _ so they need to be splitted and joined */}
          {`- ${finalStatus}`}
        </span>
      </p>
    );
  }

  renderContent() {
    const {
      order: {
        thumbnail,
        currency_code,
        grand_total,
        packages_count,
        items_count,
        created_at,
        status,
        brand_name
      },
    } = this.props;
    const date = new Date(created_at.replace(/-/g, "/"));
    const arabicDate = `${date.getDate()} ${
      ARABIC_MONTHS[date.getMonth()]
    } ${date.getFullYear()}`;

    return (
      <div block="MyAccountReturnCreateListItem" elem="Content">
        <Image
          mix={{ block: "MyAccountOrderListItem", elem: "Image" }}
          src={thumbnail}
          alt={brand_name ? brand_name : "MyAccountOrderListItemImages"}
        />
        <div
          block="MyAccountOrderListItem"
          elem="Details"
          mix={{ block: "MyAccountReturnCreateListItem", elem: "Details" }}
        >
          <p
            block="MyAccountOrderListItem"
            elem="DetailsPrice"
            mods={{ isFailed: STATUS_FAILED.includes(status) }}
            mix={{
              block: "MyAccountReturnCreateListItem",
              elem: "DetailsPrice",
            }}
          >
            {__("Total: ")}
            <span>{formatPrice(+grand_total, currency_code)}</span>
          </p>
          <div
            block="MyAccountOrderListItem"
            elem="SubDetails"
            mix={{ block: "MyAccountReturnCreateListItem", elem: "SubDetails" }}
          >
            {!!packages_count && (
              <>
                <Image
                  src={PackageIcon}
                  mix={{
                    block: "MyAccountOrderListItem",
                    elem: "PackageImage",
                  }}
                  alt={"Package-box"}
                />
                <p
                  block="MyAccountOrderListItem"
                  elem="DetailsPackages"
                  mix={{
                    block: "MyAccountReturnCreateListItem",
                    elem: "DetailsProp",
                  }}
                >
                  <span>{packages_count}</span>
                  {packages_count !== 1 ? __(" Packages") : __(" Package")}
                </p>
              </>
            )}
            <p
              block="MyAccountReturnCreateListItem"
              elem="DetailsQty"
              mix={{
                block: "MyAccountReturnCreateListItem",
                elem: "DetailsProp",
              }}
            >
              <span>{items_count}</span>
              {items_count !== 1 ? __(" Items") : __(" Item")}
            </p>
          </div>
          <p block="MyAccountReturnCreateListItem" elem="DetailsDate">
            <span>{__("Order placed: ")}</span>
            <span>
              {isArabic()
                ? arabicDate
                : formatDate(
                    "DD MMM YYYY",
                    new Date(created_at.replace(/-/g, "/"))
                  )}
            </span>
          </p>
        </div>
      </div>
    );
  }

  renderOrderStatus() {
    const {
      order: { status },
    } = this.props;
    if (STATUS_HIDE_BAR.includes(status)) {
      return null;
    }

    return (
      <div block="MyAccountOrderListItem" elem="Status">
        <div block="MyAccountOrderListItem" elem="ProgressBar">
          <div
            block="MyAccountOrderListItem"
            elem="ProgressCurrent"
            mods={{
              isProcessing: STATUS_BEING_PROCESSED.includes(status),
              isArabic: isArabic(),
            }}
          />
          <div
            block="MyAccountOrderListItem"
            elem="ProgressCheckbox"
            mods={{
              isProcessing: STATUS_BEING_PROCESSED.includes(status),
              isArabic: isArabic(),
            }}
          />
        </div>
        <div block="MyAccountOrderListItem" elem="StatusList">
          <p block="MyAccountOrderListItem" elem="StatusTitle">
            {__("Ordered")}
          </p>
          <p block="MyAccountOrderListItem" elem="StatusTitle">
            {__("Processing")}
          </p>
          <p block="MyAccountOrderListItem" elem="StatusTitle">
            {__("Completed")}
          </p>
        </div>
      </div>
    );
  }

  render() {
    const { order } = this.props;

    if (!order) {
      return null;
    }

    return (
      <button block="MyAccountOrderListItem" onClick={this.handleClick}>
        {this.renderHeading()}
        {this.renderContent()}
        {this.renderOrderStatus()}
      </button>
    );
  }
}

export default withRouter(MyAccountOrderListItem);
