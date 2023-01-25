import PropTypes from "prop-types";

import Link from "Component/Link";
import { MyAccountReturnCreate } from "Component/MyAccountReturnCreate/MyAccountReturnCreate.component";
import MyAccountReturnSuccessItem from "Component/MyAccountReturnSuccessItem";
import { customerType } from "Type/Account";
import { formatDate } from "Util/Date";

import "./MyAccountReturnSuccess.style";
import { EVENT_MOE_BACK_TO_ORDER_DETAILS } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class MyAccountReturnSuccess extends MyAccountReturnCreate {
  static propTypes = {
    orderId: PropTypes.string,
    returnNumber: PropTypes.string,
    orderNumber: PropTypes.string,
    customer: customerType.isRequired,
    date: PropTypes.string,
    displayDiscountPercentage: PropTypes.bool.isRequired,
    item: PropTypes.any, // TODO: Should be some specific type
  };

  static defaultProps = {
    orderId: null,
    returnNumber: null,
    orderNumber: null,
    date: null,
    displayDiscountPercentage: true,
  };

  renderHeading() {
    const { orderNumber, customer: { email } = {} } = this.props;

    return (
      <div block="MyAccountReturnSuccess" elem="Heading">
        <h3>{__("Order #%s", orderNumber)}</h3>
        <p>{__("We have received your request.")}</p>
        {!!email && (
          <p>
            {__("An email has been sent to ")}
            <span>{email}</span>
            {__(" with next steps.")}
          </p>
        )}
      </div>
    );
  }

  renderItems() {
    const { items = [], displayDiscountPercentage } = this.props;

    return (
      <div block="MyAccountReturnSuccess" elem="Items">
        {items.map((item) => (
          <MyAccountReturnSuccessItem
            key={item.id}
            item={item}
            displayDiscountPercentage={displayDiscountPercentage}
          />
        ))}
      </div>
    );
  }

  renderDetails() {
    const { returnNumber, orderNumber, date } = this.props;
    const dateObject = new Date(date.replace(/-/g, "/"));
    const dateString = formatDate("DD/MM/YY at hh:mm", dateObject);

    return (
      <div block="MyAccountReturnSuccess" elem="Details">
        <h3>{__("Request information")}</h3>
        <p>
          {__("ID: ")}
          <span>{returnNumber}</span>
        </p>
        <p>
          {__("Order ID: ")}
          <span>{orderNumber}</span>
        </p>
        <p>
          {__("Date requested ")}
          <span>{dateString}</span>
        </p>
      </div>
    );
  }
  sendMoeEvents(event) {
    const { pathname } = location;
    const pathLength = pathname.split("/").length;
    const isReturnSuccess = pathname.includes("/my-account/return-item/create/success/") && pathLength > 4;
    const isReturnDetail = pathname.includes("/my-account/return-item/") && pathLength < 5;
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      ...(isReturnSuccess  && {screen_name: "ReturnSuccess"}),
      ...(isReturnDetail  && {screen_name: "ReturnDetails"}),
      app6thstreet_platform: "Web",
    });
  }
  renderBackButton() {
    const { orderId } = this.props;

    if (!orderId) {
      return null;
    }

    return (
      <Link
        block="MyAccountReturnSuccess"
        elem="BackButton"
        onClick={()=> this.sendMoeEvents(EVENT_MOE_BACK_TO_ORDER_DETAILS)}
        to={`/my-account/my-orders/${orderId}`}
      >
        {__("Back to Order Detail")}
      </Link>
    );
  }

  renderContent() {
    const { isLoading, returnNumber } = this.props;

    if (isLoading) {
      return null;
    }

    if (!isLoading && !returnNumber) {
      return this.renderReturnNotPossible();
    }

    return (
      <>
        {this.renderHeading()}
        {this.renderItems()}
        {this.renderDetails()}
      </>
    );
  }

  render() {
    return (
      <div block="MyAccountReturnSuccess">
        {this.renderLoader()}
        {this.renderContent()}
        {this.renderBackButton()}
      </div>
    );
  }
}

export default MyAccountReturnSuccess;
