import Loader from "Component/Loader";
import MyAccountOrderListItem from "Component/MyAccountOrderListItem";
import { MyAccountReturnCreateList as SourceComponent } from "Component/MyAccountReturnCreateList/MyAccountReturnCreateList.component";

import "./MyAccountOrderList.style";

class MyAccountOrderList extends SourceComponent {
  renderOrder = (order) => {
    const { increment_id } = order;
    const { eddResponse } = this.props;
    return (
      <MyAccountOrderListItem
        order={order}
        eddResponse={eddResponse}
        key={increment_id}
      />
    );
  }

  renderNoOrders() {
    return <p>{__("No orders")}</p>;
  }

  renderOrders() {
    const { orders = [], isLoading } = this.props;

    if (!orders.length && isLoading) {
      return null;
    }

    if (!orders.length && !isLoading) {
      return this.renderNoOrders();
    }

    return orders.map(this.renderOrder);
  }

  renderLoader() {
    const { isLoading } = this.props;

    return <Loader isLoading={isLoading} />;
  }

  renderMoreItems() {
    const { requestInProgress } = this.props;

    if (requestInProgress) {
      return (
        <div block="MyAccountOrderList" elem="MoreOrders">
          Loading more orders...
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <div block="MyAccountOrderList">
        {this.renderOrders()}
        {this.renderLoader()}
        {this.renderMoreItems()}
      </div>
    );
  }
}

export default MyAccountOrderList;
