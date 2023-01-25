import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CartItemQuantityPopup from './CartItemQuantityPopup.component';

export class CartItemQuantityPopupContainer extends PureComponent {

  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    toggle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };

  render() {
    return (
      <CartItemQuantityPopup { ...this.props } />
    );
  }
}

export default CartItemQuantityPopupContainer;
