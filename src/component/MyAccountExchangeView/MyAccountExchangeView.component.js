import { MyAccountExchangeCreate as SourceComponent } from "Component/MyAccountExchangeCreate/MyAccountExchangeCreate.component";
import MyAccountReturnSuccessItem from "Component/MyAccountReturnSuccessItem";
import { formatDate } from "Util/Date";
import Link from "Component/Link";

import {
  STATUS_DENIED,
  STATUS_TITLE_MAP,
} from "./MyAccountExchangeView.config";

import "./MyAccountExchangeView.style";

export class MyAccountExchangeView extends SourceComponent {
  getItemsFromGroup = () => {
    const { orderItemGroups } = this.props;
    const allItems = [
      ...orderItemGroups.reduce((acc, { items }) => [...acc, ...items], []),
    ];
    return allItems;
  };

  renderHeading() {
    const {
      orderNumber,
      exchangeSuccess = false,
      orderIncrementId,
    } = this.props;

    return (
      <div block="MyAccountReturnSuccess" elem="Heading">
        <h3>
          {exchangeSuccess
            ? __("Order #%s", orderIncrementId)
            : __("Order #%s", orderNumber)}
        </h3>
        {exchangeSuccess && this.renderRequestSuccessContent()}
      </div>
    );
  }
  renderRequestSuccessContent() {
    const { customer: { email } = {} ,orderNumber} = this.props;

    return (
      <>
        <p>{__("We have received your request.")}</p>
        {!!email && (
          <p>
            {__("An email has been sent to ")}
            <span>{email}</span>
            {__(" with next steps.")}
          </p>
        )}
      </>
    );
  }

  renderSuccessDetails() {
    const { returnNumber, orderIncrementId, date } = this.props;
    const dateObject = new Date(date.replace(/-/g, "/"));
    const dateString = formatDate('DD/MM/YY at hh:mm', dateObject);

    return (
        <div block="MyAccountReturnSuccess" elem="Details">
            <h3>{ __('Request information') }</h3>
            <p>
                { __('ID: ') }
                <span>{ returnNumber }</span>
            </p>
            <p>
                { __('Order ID: ') }
                <span>{ orderIncrementId }</span>
            </p>
            <p>
                { __('Date requested ') }
                <span>{dateString.split('at').join(__('at'))}</span>
            </p>
        </div>
    );
}
  renderDetails() {
    const {
      date,
      status,
      orderNumber,
      exchangeSuccess,
      returnNumber,
    } = this.props;
    const dateObject = new Date(date.replace(/-/g, "/"));
    const dateString = formatDate("DD/MM/YY at hh:mm", dateObject);
    const { [status]: title } = STATUS_TITLE_MAP;

    return (
      <div block="MyAccountExchangeView" elem="Details">
        <p block="MyAccountExchangeView" elem="DetailsDate">
          {__("Date Requested: ")}
          <span>{dateString.split('at').join(__('at'))}</span>
        </p>
        <div block="MyAccountExchangeView" elem="SubDetails">
          <p
            block="MyAccountExchangeView"
            elem="Status"
            mods={{ isDenied: status === STATUS_DENIED }}
          >
            {__("Status: ")}
            <span>{__(`${title || status.split("_").join(" ")}`)}</span>
          </p>
          {exchangeSuccess && (
            <p block="MyAccountExchangeView" elem="Order">
              {__("ID: ")}
              <span>{returnNumber}</span>
            </p>
          )}
          {!exchangeSuccess && (
            <p block="MyAccountExchangeView" elem="Order">
              {__("Order ID: ")}
              <span>{orderNumber}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  renderItems() {
    const { items = [], exchangeSuccess } = this.props;
    let finalItems = exchangeSuccess ? this.getItemsFromGroup() : items;
    return (
      <div
        block="MyAccountExchangeView"
        elem="Items"
        mix={{ block: "MyAccountReturnSuccess", elem: "Items" }}
      >
        {finalItems.map((item,index) => (
          <div key={index}>
            <MyAccountReturnSuccessItem item={item} key={index} />
            {!exchangeSuccess && (
              <div block="MyAccountExchangeView" elem="Reason">
                <h3>{__("Reason")}</h3>
                {!!(item.reason || []).length && <p>{item.reason[0].value}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
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
        to={`/my-account/my-orders/${orderId}`}
      >
        {__("Back to Order Detail")}
      </Link>
    );
  }
  renderContent() {
    const { isLoading, returnNumber,orderNumber,exchangeSuccess } =
      this.props;

    if (isLoading) {
      return null;
    }

    if (!isLoading) {
      if(exchangeSuccess && !returnNumber){
        return this.renderExchangeNotPossible();
      }else if(!exchangeSuccess && !orderNumber){
      return this.renderExchangeNotPossible();
      }
    }

    return (
      <>
        {this.renderHeading()}
        {exchangeSuccess && this.renderItems()}
        {exchangeSuccess ? this.renderSuccessDetails() : this.renderDetails()}
        {!exchangeSuccess && this.renderItems()}
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

export default MyAccountExchangeView;
