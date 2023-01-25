/* eslint-disable no-magic-numbers */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from "prop-types";

import KeyValueTable from "Component/KeyValueTable";
import { addressType } from "Type/Account";
import { MixType } from "Type/Common";
import { isArabic } from "Util/App";
import Image from "Component/Image";
import BrowserDatabase from "Util/BrowserDatabase";
import "./MyAccountWalletPaymentList.style";
import { MINI_CARDS } from "Component/CreditCard/CreditCard.config";

export class MyAccountWalletPaymentList extends KeyValueTable {
  static propTypes = {
    mix: MixType,
    getFormatedRegion: PropTypes.func.isRequired,
    address: addressType.isRequired,
    showActions: PropTypes.bool,
    showAdditionalFields: PropTypes.bool,
  };

  state = {
    isArabic: isArabic(),
  }
  static defaultProps = {
    showAdditionalFields: false,
    showActions: false,
    mix: {},
  };

  renderCard() {
    const {
      savedCard,
    } = this.props;
    const {isArabic} = this.state;
    const customer = BrowserDatabase.getItem("customer");
    const { details } = savedCard;
    const { maskedCC, expirationDate, scheme = "" } = details;
    const { visa, mastercard, amex } = MINI_CARDS;
    let cardNum = `**** **** **** ${maskedCC}`;

    if (isArabic) {
      cardNum = `${maskedCC} **** **** ****`;
    }
    let miniCardImg;
    switch (scheme.toLowerCase()) {
      case "visa":
        miniCardImg = visa;
        break;
      case "mastercard":
        miniCardImg = mastercard;
        break;
      default:
        miniCardImg = amex;
        break;
    }

    return (
      <div block="MyAccountPaymentCard">
        <div block="MyAccountPaymentCard" elem="DetailWrapper">
          <div>
            <Image
              lazyLoad={true}
              src={miniCardImg}
              mix={{
                block: "MyAccountPaymentCard",
                elem: "Picture",
                mods: { isArabic },
              }}
              ratio="custom"
              alt={scheme}
            />
          </div>
          <div block="MyAccountPaymentCard" elem="DetailBlock">
            {/* {customer ?
              <div block="MyAccountPaymentCard" elem="Name">
                {customer?.firstname} {customer?.lastname}
              </div> : null} */}
            <div block="MyAccountPaymentCard" elem="cardNum">
              {cardNum}
            </div>
          </div>
        </div>
        <div block="MyAccountPaymentCard" elem="DetailWrapper">
          <div block="MyAccountPaymentCard" elem="DetailBlock">
            <div block="MyAccountPaymentCard" elem="ExpDate">
              Exp.
            </div>
            <div block="MyAccountPaymentCard" elem="ExpDate">
              <span>{`${expirationDate.substr(0, 3)}${expirationDate.substr(5, 2)}`}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { savedCard = {}, mix } = this.props;
    return (
      <div block="MyAccountWalletPaymentList" mix={mix}>
        {this.renderCard()}
      </div>
    );
  }
}

export default MyAccountWalletPaymentList;
