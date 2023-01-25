import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import CartDispatcher from 'Store/Cart/Cart.dispatcher';
import CartCouponList from "./CartCouponList.component";
// export const mapStateToProps = (state) => {
//     return ({
//         couponLists : state.CartReducer.cartCoupons
//     })
// };
// export const mapDispatchToProps = (dispatch) => ({
//     getCouponList : () => CartDispatcher.getCoupon(dispatch),
//     applyCouponToCart: (couponCode) => CartDispatcher.applyCouponCode(dispatch, couponCode),
//     removeCouponFromCart: () => CartDispatcher.removeCouponCode(dispatch)
// });
export class CartCouponListContainer extends PureComponent {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        //this.props.getCouponList();
    }
    
    render() {        
        return (
            <CartCouponList {...this.props}/>
        );
    }
}
export default connect(null, null)(CartCouponListContainer);