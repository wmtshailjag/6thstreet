import { PureComponent } from "react";
import { withRouter } from "react-router";

import Image from "Component/Image";
import { OrderType } from "Type/API";
import { HistoryType } from "Type/Common";
import { formatDate } from "Util/Date";
import isMobile from "Util/Mobile";

import { formatPrice } from "../../../packages/algolia-sdk/app/utils/filters";

import "./MyAccountReturnCreateListItem.style";

export class MyAccountReturnCreateListItem extends PureComponent {
  static propTypes = {
    order: OrderType.isRequired,
    history: HistoryType.isRequired,
  };

  handleClick = () => {
    const {
      history,
      order: { id },
    } = this.props;

    history.push(`/my-account/return-item/create/${id}`);
  };

  renderHeading() {
    const {
      order: { increment_id, status },
    } = this.props;

    return (
      <p block="MyAccountReturnCreateListItem" elem="Heading">
        {__("Order #%s ", increment_id)}
        <span>
          {/* Some statuses are written with _ so they need to be splitted and joined */}
          {status && `- ${status.split("_").join(" ")}`}
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
        items_count,
        courier_deliver_date,
        brand_name,
      },
    } = this.props;
    return (
      <div block="MyAccountReturnCreateListItem" elem="Content">
        <Image
          lazyLoad={true}
          mix={{ block: "MyAccountReturnCreateListItem", elem: "Image" }}
          src={thumbnail}
          alt={brand_name? brand_name : "MyAccountReturnCreateListItemImage"}
        />
        <div block="MyAccountReturnCreateListItem" elem="Details">
          {!(isMobile.any() || isMobile.tablet()) && this.renderHeading()}
          <p block="MyAccountReturnCreateListItem" elem="DetailsPrice">
            {__("Total: ")}
            <span>{formatPrice(+grand_total, currency_code)}</span>
          </p>
          <div block="MyAccountReturnCreateListItem" elem="SubDetails">
            <p
              block="MyAccountReturnCreateListItem"
              elem="DetailsQty"
              mix={{
                block: "MyAccountReturnCreateListItem",
                elem: "DetailsProp",
              }}
            >
              {__("Products: ")}
              <span>{items_count}</span>
            </p>
            {!!courier_deliver_date && (
              <p
                block="MyAccountReturnCreateListItem"
                elem="DetailsDate"
                mix={{
                  block: "MyAccountReturnCreateListItem",
                  elem: "DetailsProp",
                }}
              >
                {__("Delivered on ")}
                <span>
                  {formatDate(
                    "DD MMM YYYY",
                    new Date(courier_deliver_date.replace(/-/g, "/"))
                  )}
                </span>
              </p>
            )}
          </div>
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
      <button block="MyAccountReturnCreateListItem" onClick={this.handleClick}>
        {(isMobile.any() || isMobile.tablet()) && this.renderHeading()}
        {this.renderContent()}
      </button>
    );
  }
}

export default withRouter(MyAccountReturnCreateListItem);
