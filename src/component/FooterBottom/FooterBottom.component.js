import PropTypes from "prop-types";
import { PureComponent } from "react";
import { withRouter } from "react-router";

import Link from "Component/Link";
import {
  TYPE_CATEGORY,
  TYPE_CMS_PAGE,
  TYPE_PRODUCT,
} from "Route/UrlRewrites/UrlRewrites.config";
import CA from "./icons/CA.svg";
import COD from "./icons/COD.svg";
import mastercard from "./icons/mastercard.svg";
import visa from "./icons/visa.svg";
import Image from "Component/Image";

import "./FooterBottom.style";

class FooterBottom extends PureComponent {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    FooterBottomHidden: true,
    type: "",
    delay: 300,
  };

  static getDerivedStateFromProps(props, state) {
    const { location } = props;
    const { type } = state;

    return location.pathname === "/" ||
      location.pathname === "/women.html" ||
      location.pathname === "/men.html" ||
      location.pathname === "/kids.html" ||
      location.pathname === "/home.html" ||
      TYPE_CMS_PAGE === type ||
      TYPE_CATEGORY === type ||
      TYPE_PRODUCT === type
      ? {
          FooterBottomHidden: false,
        }
      : {
          FooterBottomHidden: true,
        };
  }

  componentDidMount() {
    const { delay } = this.state;
    this.timer = setInterval(this.tick, delay);
  }

  componentDidUpdate(prevState) {
    const { delay } = this.state;
    if (prevState !== delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, delay);
    }
  }

  componentWillUnmount() {
    this.timer = null;
  }

  tick = () => {
    this.setState({ type: window.pageType });
  };

  getCurrentYear() {
    return new Date().getFullYear();
  }

  renderCopyright() {
    return (
      <div block="FooterBottom" elem="Copyright">
        {__("Copyright")}
        &nbsp;&#169;&nbsp;
        {this.getCurrentYear()}
        &nbsp;
        {__("6TH STREET. All rights reserved.")}
      </div>
    );
  }

  renderHyperlinks() {
    return (
      <div block="FooterBottom" elem="Hyperlinks">
        <Link to="/shipping-policy">{__("shipping")}</Link>/
        <Link to="/return-information">{__("returns")}</Link>/
        <Link to="/faq">{__("FAQs")}</Link>
      </div>
    );
  }

  renderPaymentIcons() {
    return (
      <div block="FooterBottom" elem="PaymentIcons">
        <Image lazyLoad={true}
          mix={{
            block: "FooterBottom",
            elem: "PaymentIcons-ClubApparel",
          }}
          src={CA}
          alt="ca"
        />
        <Image lazyLoad={true}
          mix={{
            block: "FooterBottom",
            elem: "PaymentIcons-CashOnDelivery",
          }}
          src={COD}
          alt="ca"
        />
        <Image lazyLoad={true}
          mix={{
            block: "FooterBottom",
            elem: "PaymentIcons-Mastercard",
          }}
          src={mastercard}
          alt="ca"
        />
        <Image lazyLoad={true}
          mix={{
            block: "FooterBottom",
            elem: "PaymentIcons-Visa",
          }}
          src={visa}
          alt="ca"
        />
      </div>
    );
  }

  render() {
    const { FooterBottomHidden } = this.state;

    return (
      <div block="FooterBottom" mods={{ FooterBottomHidden }}>
        <div block="FooterBottom" elem="Layout">
          {this.renderCopyright()}
          {this.renderHyperlinks()}
          {this.renderPaymentIcons()}
        </div>
      </div>
    );
  }
}

export default withRouter(FooterBottom);
