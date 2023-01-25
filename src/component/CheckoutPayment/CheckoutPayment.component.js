import PropTypes from "prop-types";
import { PureComponent } from "react";

import {
  CHECKOUT_APPLE_PAY,
  HIDDEN_PAYMENTS,
  TABBY_PAYMENT_CODES,
} from "Component/CheckoutPayments/CheckoutPayments.config";
import { paymentMethodType } from "Type/Checkout";
import { isArabic } from "Util/App";
import { getCountryFromUrl,getLanguageFromUrl } from "Util/Url/";
import Image from "Component/Image";
import {EVENT_MOE_ADD_PAYMENT_INFO} from "Util/Event"
import { PAYMENTS_DATA } from "./CheckoutPayment.config";
import tabbyAr from "./icons/tabby-logo-black-ar@2x.png";

import "./CheckoutPayment.style";

export class CheckoutPayment extends PureComponent {
  static propTypes = {
    method: paymentMethodType.isRequired,
    onClick: PropTypes.func.isRequired,
    setCashOnDeliveryFee: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
  };

  static defaultProps = {
    isSelected: false,
  };

  state = {
    isArabic: isArabic(),
  };

  sendMoeEvent(method) {
    const {
      totals: { currency_code, discount, subtotal, total },
    } = this.props;
    if (method) {
      const payment_Type =
      (method == "msp_cashondelivery")
          ? "Cash on Delivery"
          : (method == "checkoutcom_card_payment")
          ? "Card"
          : (method == ("checkout_apple_pay" || "APPLE_PAY"))
          ? "Apple Pay"
          : (method == "tabby_installments")
          ? "Tabby - Installments"
          : method;
      Moengage.track_event(EVENT_MOE_ADD_PAYMENT_INFO, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        subtotal_amount: subtotal,
        discounted_amount: discount,
        total_amount: total,
        currency: currency_code,
        payment_type: payment_Type,
        app6thstreet_platform: "Web",
      });
    }
  }

  onClick = () => {
    const {
      setCashOnDeliveryFee,
      onClick,
      method,
      method: { amount,m_code },
    } = this.props;
    setCashOnDeliveryFee(amount);
    onClick(method);
    this.sendMoeEvent(m_code);
  };
  

  renderContent() {
    const {
      method: { m_code },
    } = this.props;
    const { isArabic } = this.state;
    if (PAYMENTS_DATA[m_code]) {
      const { name, mod, paragraph, img } = PAYMENTS_DATA[m_code];

      const isTabby = TABBY_PAYMENT_CODES.includes(m_code);
      
      if(m_code === "checkout_qpay"){
        return (
          <div block="CheckoutPayment" elem="MethodQPay">
            <p>QPay</p>
          </div>
        );
      }

      return (
        <div block="CheckoutPayment" elem="Method" mods={mod}>
          {/* {isTabby ? (
            <img src={isArabic ? tabbyAr : img} alt={name} />
          ) : (
            <img src={img} alt={name} />
          )} */}
          <img src={img} alt={name} />
          {paragraph ? <p>{paragraph}</p> : null}
        </div>
      );
    }

    if(m_code === "checkout_knet"){
      return (
        <div block="CheckoutPayment" elem="Method">
          <p>KNET</p>
        </div>
      );
    }

    return (
      <div block="CheckoutPayment" elem="Method">
        <p>{m_code}</p>
      </div>
    );
  }

  render() {
    const {
      isSelected,
      method: { m_code },
    } = this.props;
    if (
      HIDDEN_PAYMENTS.includes(m_code) ||
      (m_code === CHECKOUT_APPLE_PAY && !window.ApplePaySession)
    ) {
      return null;
    }

    const isTabby = TABBY_PAYMENT_CODES.includes(m_code);

    return (
      <li block="CheckoutPayment" mods={{ isTabby }}>
        <button
          block="CheckoutPayment"
          mods={{ isSelected }}
          elem="Button"
          onClick={this.onClick}
          type="button"
        >
          {this.renderContent()}
        </button>
      </li>
    );
  }
}

export default CheckoutPayment;
