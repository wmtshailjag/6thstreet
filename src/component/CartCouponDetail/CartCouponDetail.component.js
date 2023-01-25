import { PureComponent } from "react";
import "./CartCouponDetail.style";

class CartCouponDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.couponDetailPopup = React.createRef();
    }
    
    componentDidMount() {
        window.addEventListener("mousedown", this.checkIfClickedOutside);
    }
    
    checkIfClickedOutside = e => {
        if (this.props.couponDetail.isCouponDetialPopupOpen && this.couponDetailPopup.current && !this.couponDetailPopup.current.contains(e.target)) {
            this.props.hideDetail(e);
            const bodyElt = document.querySelector("body");
            bodyElt.removeAttribute("style");
        }
    }
    
    hideCouponDetialPopup = (e) => {
        e.stopPropagation()
        this.props.hideDetail(e);
        if (!this.props.isCouponPopupOpen) {
          const bodyElt = document.querySelector("body");
          bodyElt.removeAttribute("style");
        }
      }


    render() {
        return (
            <div block="couponDetailPopup">
                <div block="couponDetailOverlay">
                    <div block="couponDetialPopupBlock" ref={this.couponDetailPopup}>                    
                        <p block="couponItemCode">
                            {this.props.couponDetail.couponCode}
                            <button onClick={(e)=>{this.hideCouponDetialPopup(e)}} block="closePopupbtn"><span>Close</span></button>
                        </p>
                        <p block="couponItemName">{this.props.couponDetail.couponName}</p>
                        <p block="couponItemDes">{this.props.couponDetail.couponDescription}</p>
                    </div>
                </div>
                
            </div>
        )
    }
}

// export default CartCouponDetail;
export default CartCouponDetail;
