import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { setMinicartOpen } from "Store/Cart/Cart.action";
import CartDispatcher from "Store/Cart/Cart.dispatcher";
import { showNotification } from "Store/Notification/Notification.action";
import { hideActiveOverlay } from "Store/Overlay/Overlay.action";
import { TotalsType } from "Type/MiniCart";
import { checkProducts } from "Util/Cart/Cart";

import HeaderCart from "./HeaderCart.component";

export const mapStateToProps = (state) => ({
  totals: state.CartReducer.cartTotals,
  isMinicartOpen: state.CartReducer.isMinicartOpen,
});

export const mapDispatchToProps = (_dispatch) => ({
  hideActiveOverlay: () => _dispatch(hideActiveOverlay()),
  showNotification: (type, message) =>
    _dispatch(showNotification(type, message)),
  setMinicartOpen: (isMinicartOpen = false) =>
    _dispatch(setMinicartOpen(isMinicartOpen)),
  updateTotals: (cartId) => CartDispatcher.getCartTotals(_dispatch, cartId),
});

export class HeaderCartContainer extends PureComponent {
  static propTypes = {
    totals: TotalsType.isRequired,
    showNotification: PropTypes.func.isRequired,
    isSignedIn: PropTypes.bool,
    setMinicartOpen: PropTypes.func.isRequired,
    isMinicartOpen: PropTypes.bool.isRequired,
    updateTotals: PropTypes.func.isRequired,
    showCartPopUp: PropTypes.bool.isRequired,
  };

  state = {
    itemCountDiv: "",
    isCheckoutAvailable: false,
    prevIsMinicartOpen: false,
  };

  containerFunctions = {
    // getData: this.getData.bind(this)
  };

  static getDerivedStateFromProps(props, state) {
    const {
      totals: { items = [], discount = 0, subtotal, total, id, total_segments },
      showNotification,
      updateTotals,
      isMinicartOpen,
    } = props;
    const { prevIsMinicartOpen } = state;

    if (items.length !== 0 && isMinicartOpen === prevIsMinicartOpen) {
      const mappedItems = checkProducts(items) || [];

      if (total === 0) {
        const storeCredits = total_segments.find(
          ({ code }) => code === "customerbalance"
        );

        const clubApparelCredits = total_segments.find(
          ({ code }) => code === "clubapparel"
        );
        const { value: appliedStoreCredit = 0 } = storeCredits || {};
        const { value: appliedClubApparelCredit = 0 } = clubApparelCredits || {};

        if (subtotal > (Math.abs(appliedStoreCredit) + Math.abs(appliedClubApparelCredit) + Math.abs(discount))) {
          updateTotals(id);
        }
      }

      {/*if (mappedItems.length !== 0) {
        showNotification(
          "error",
          __("Some products or selected quantities are no longer available")
        );
      }*/}

      return {
        isCheckoutAvailable: mappedItems.length === 0,
      };
    }

    return {
      prevIsMinicartOpen: isMinicartOpen,
    };
  }

  containerProps = () => {
    // isDisabled: this._getIsDisabled()
  };

  render() {
    return (
      <HeaderCart
        {...this.containerFunctions}
        {...this.containerProps()}
        {...this.state}
        {...this.props}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderCartContainer);
