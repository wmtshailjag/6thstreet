import { connect } from 'react-redux';

import { CartCouponContainer as SourceCartCouponContainer } from 'SourceComponent/CartCoupon/CartCoupon.container';
import CartDispatcher from 'Store/Cart/Cart.dispatcher';

export const mapDispatchToProps = (dispatch) => ({
    applyCouponToCart: (couponCode) => CartDispatcher.applyCouponCode(dispatch, couponCode),
    removeCouponFromCart: () => CartDispatcher.removeCouponCode(dispatch)
});

export default connect(null, mapDispatchToProps)(SourceCartCouponContainer);
