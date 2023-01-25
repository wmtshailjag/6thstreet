import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import { showNotification } from "Store/Notification/Notification.action";
import { HistoryType, MatchType } from "Type/Common";
import MagentoAPI from "Util/API/provider/MagentoAPI";

import MyAccountReturnCreate from "./MyAccountReturnCreate.component";
import {
  EVENT_MOE_SELECT_RETURN_RESOLUTION,
  EVENT_MOE_SELECT_RETURN_REASON,
  EVENT_MOE_SUBMIT_RETURN_REQUEST,
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = () => ({});

export const mapDispatchToProps = (dispatch) => ({
  showErrorMessage: (message) => dispatch(showNotification("error", message)),
});

export class MyAccountReturnCreateContainer extends PureComponent {
  static propTypes = {
    match: MatchType.isRequired,
    history: HistoryType.isRequired,
    showErrorMessage: PropTypes.func.isRequired,
  };

  containerFunctions = {
    onFormSubmit: this.onFormSubmit.bind(this),
    onItemClick: this.onItemClick.bind(this),
    onReasonChange: this.onReasonChange.bind(this),
    onResolutionChange: this.onResolutionChange.bind(this),
    handleDiscardClick: this.onDiscardClick.bind(this),
    onResolutionChangeValue: this.onResolutionChangeValue.bind(this),
    handleChangeQuantity: this.handleChangeQuantity.bind(this),
  };

  state = {
    selectedItems: {},
    isLoading: true,
    incrementId: "",
    items: [],
    resolutionId: null,
    reasonId: 0,
    quantityObj: {},
  };

  componentDidMount() {
    this.getReturnableItems();
  }

  containerProps = () => {
    const { history } = this.props;
    const {
      isLoading,
      incrementId,
      items,
      selectedItems = {},
      resolutions,
      resolutionId,
      reasonId,
      quantityObj,
    } = this.state;

    return {
      isLoading,
      incrementId,
      items,
      selectedNumber: Object.keys(selectedItems).length,
      history,
      resolutions,
      resolutionId,
      reasonId,
      quantityObj,
    };
  };
  onDiscardClick() {
    const { history } = this.props;
    const orderId = this.getOrderId();
    history.push(`/my-account/my-orders/${orderId}`);
  }

  getOrderId() {
    const { match: { params: { order } = {} } = {} } = this.props;

    return order;
  }

  getReturnableItems() {
    const { showErrorMessage } = this.props;
    const orderId = this.getOrderId();

    this.setState({ isLoading: true });

    MagentoAPI.get(`orders/${orderId}/returnable-items`)
      .then(({ data: { items, order_increment_id, resolution_options } }) => {
        this.setState({
          items,
          incrementId: order_increment_id,
          isLoading: false,
          resolutions: resolution_options,
        });
      })
      .catch(() => {
        showErrorMessage(__("Error appeared while fetching returnable items"));
        this.setState({ isLoading: false });
      });
  }

  onItemClick(itemId, isSelected) {
    this.setState(({ selectedItems }) => {
      if (!isSelected) {
        // eslint-disable-next-line no-unused-vars
        const { [itemId]: _, ...newSelectedItems } = selectedItems;
        return { selectedItems: newSelectedItems };
      }

      return { selectedItems: { ...selectedItems, [itemId]: false } };
    });
  }

  handleChangeQuantity(quantity, itemId) {
    const {
      quantityObj: { [itemId]: item },
    } = this.state;

    this.setState(({ quantityObj }) => ({
      quantityObj: { ...quantityObj, [itemId]: { ...item, quantity } },
    }));
  }

  sendMoeEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }

  onResolutionChange(itemId, resolutionId) {
    const {
      selectedItems: { [itemId]: item },
    } = this.state;
    this.setState(({ selectedItems }) => ({
      selectedItems: { ...selectedItems, [itemId]: { ...item, resolutionId } },
    }));
  }

  onReasonChange(itemId, reasonId) {
    const {
      selectedItems: { [itemId]: item },
    } = this.state;

    this.setState(({ selectedItems }) => ({
      selectedItems: { ...selectedItems, [itemId]: { ...item, reasonId } },
    }));

    this.setState({ reasonId: reasonId });

    this.onResolutionChangeValue({ resolutionId: false });
    const pagePathName = new URL(window.location.href).pathname;
    if (pagePathName.includes("/my-account/return-item/create/")) {
      this.sendMoeEvents(EVENT_MOE_SELECT_RETURN_REASON);
    }
  }

  onResolutionChangeValue(value) {
    const pagePathName = new URL(window.location.href).pathname;
    this.setState({ resolutionId: value });
    if (
      value.resolutionId !== false &&
      pagePathName.includes("/my-account/return-item/create/")
    ) {
      this.sendMoeEvents(EVENT_MOE_SELECT_RETURN_RESOLUTION);
    }
  }
  onFormSubmit() {
    const { history, showErrorMessage, location } = this.props;
    const { selectedItems = {}, items, resolutionId, quantityObj } = this.state;
    const {
      location: {
        state: { selectedAddressId = 0, orderDetails = {} },
      },
    } = history;
    const payload = {
      order_id: this.getOrderId(),
      address_id: selectedAddressId,
      items: Object.entries(selectedItems).map(
        ([order_item_id, { reasonId }]) => {
          const { qty_shipped = 0 } =
            items.find(({ item_id }) => item_id === order_item_id) || {};
          return {
            order_item_id,
            qty_requested:
              Object.keys(quantityObj).length > 0
                ? quantityObj[order_item_id].quantity
                : qty_shipped,
            resolution: {
              id: resolutionId,
              data: null,
            },
            reason: {
              id: reasonId,
              data: null,
            },
          };
        }
      ),
    };

    this.setState({ isLoading: true });
    MagentoAPI.post("returns/request", payload)
      .then(({ data: { id } }) => {
        this.sendMoeEvents(EVENT_MOE_SUBMIT_RETURN_REQUEST);
        history.push(`/my-account/return-item/create/success/${id}`);
      })
      .catch(() => {
        showErrorMessage(__("Error appeared while requesting a return"));
        this.setState({ isLoading: false });
      });
  }

  render() {
    return (
      <MyAccountReturnCreate
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnCreateContainer)
);
