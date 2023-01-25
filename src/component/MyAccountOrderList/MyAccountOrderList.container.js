/* eslint-disable no-magic-numbers */
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { MyAccountReturnCreateListContainer as SourceComponent } from "Component/MyAccountReturnCreateList/MyAccountReturnCreateList.container";
import MyAccountDispatcher from "Store/MyAccount/MyAccount.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";

import MyAccountOrderList from "./MyAccountOrderList.component";

export const mapStateToProps = (state) => ({
  eddResponse: state.MyAccountReducer.eddResponse,
});

export const mapDispatchToProps = (dispatch) => ({
  showErrorNotification: (error) => dispatch(showNotification("error", error)),
  getOrders: (limit, offset) => MyAccountDispatcher.getOrders(limit, offset),
});

export class MyAccountOrderListContainer extends SourceComponent {
  static propTypes = {
    ...SourceComponent.propTypes,
    getOrders: PropTypes.func.isRequired,
  };

  state = {
    limit: 15,
    nextOffset: 0,
    orders: [],
    isGetNewOrders: true,
  };

  componentDidMount() {
    const { limit } = this.state;
    this.setState({ isLoading: true });

    this.getOrderList(limit);

    window.addEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const { isMobile, limit, isLoading, isGetNewOrders } = this.state;
    const windowHeight =
      "innerHeight" in window
        ? window.innerHeight
        : document.documentElement.offsetHeight;
    const { body } = document;
    const html = document.documentElement;
    const footerHeight = !isMobile ? 300 : 0;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    const windowBottom = windowHeight + window.pageYOffset;

    if (
      windowBottom + footerHeight >= docHeight &&
      !isLoading &&
      isGetNewOrders
    ) {
      this.setState({ isLoading: true }, () => this.getOrderList(limit));
    }
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  containerProps = () => {
    const { orders, isLoading, requestInProgress } = this.state;
    const { eddResponse } = this.props;
    return { orders, isLoading, requestInProgress, eddResponse };
  };

  getOrderList(limit = 15) {
    const { getOrders, showErrorNotification } = this.props;
    const { orders, nextOffset } = this.state;

    this.setState({ requestInProgress: true });

    getOrders(limit, nextOffset)
      .then(({ data, meta }) => {
        this.setState({
          orders: data ? [...orders, ...data] : orders,
          nextOffset: (meta && meta.next_offset) || 0,
          isLoading: false,
          requestInProgress: false,
          limit,
          isGetNewOrders: !!meta.next_offset,
        });
      })
      .catch(() => {
        showErrorNotification(__("Error appeared while fetching orders"));
        this.setState({
          isLoading: false,
          requestInProgress: false,
          isGetNewOrders: false,
        });
      });
  }

  render() {
    return <MyAccountOrderList {...this.containerProps()} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAccountOrderListContainer);
