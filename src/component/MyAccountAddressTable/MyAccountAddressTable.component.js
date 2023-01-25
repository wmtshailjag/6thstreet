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
import Loader from "Component/Loader";
import { addressType } from "Type/Account";
import { MixType } from "Type/Common";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import Image from "Component/Image";

import pencil from "./icons/edit_btn.png";
import trash from "./icons/trash.png";

import "./MyAccountAddressTable.style";
import { EVENT_MOE_EDIT_ADDRESS_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export class MyAccountAddressTable extends KeyValueTable {
  static propTypes = {
    mix: MixType,
    getFormatedRegion: PropTypes.func.isRequired,
    address: addressType.isRequired,
    showActions: PropTypes.bool,
    showAdditionalFields: PropTypes.bool,
    onEditClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    countries: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        id: PropTypes.string,
        available_regions: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string,
            name: PropTypes.string,
            id: PropTypes.number,
          })
        ),
      })
    ).isRequired,
  };

  static defaultProps = {
    showAdditionalFields: false,
    showActions: false,
    mix: {},
  };

  onEdit = () => {
    const { onEditClick ,title } = this.props;
    onEditClick();
    Moengage.track_event(EVENT_MOE_EDIT_ADDRESS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: "Address Book",
      address_no: title || "",
      app6thstreet_platform: "Web",
    });
    if (!isMobile.any()) {
      const elmnts = document.getElementsByClassName(
        "MyAccountAddressBook-NewAddress"
      );

      if (elmnts && elmnts.length > 0) {
        elmnts[0].scrollIntoView();
      }
    }
  };

  renderActions() {
    const { onDeleteClick, showActions } = this.props;

    if (!showActions) {
      return null;
    }

    return (
      <>
        <button
          block="MyAccountAddressTable"
          elem="ActionBtn"
          onClick={this.onEdit}
        >
          <Image
            lazyLoad={true}
            block="MyAccountAddressTable"
            mix={{
              block: "MyAccountAddressTable",
              elem: "Edit",
            }}
            mods={{ pencil: true }}
            alt="pencil"
            src={pencil}
          />
        </button>
        <button
          block="MyAccountAddressTable"
          elem="ActionBtn"
          onClick={onDeleteClick}
        >
          <Image
            lazyLoad={true}
            block="MyAccountAddressTable"
            mix={{
              block: "MyAccountAddressTable",
              elem: "Trash",
            }}
            mods={{ trash: true }}
            alt="trash"
            src={trash}
          />
        </button>
      </>
    );
  }

  mobileEditAddress = () => {
    const { hideCards, onEditClick } = this.props;
    if (isMobile.any()) {
      onEditClick();
      hideCards();
    }
  };

  getPhone = () => {
    const {
      address: { phone = "" },
    } = this.props;
    const numbers = phone.slice(1);
    const code = numbers.slice(0, 3);
    const telephone = numbers.slice(3);

    if (isArabic()) {
      return `${telephone} ${code}+`;
    }

    return `+${code} ${telephone}`;
  };

  renderCard() {
    const {
      address: {
        default_billing,
        firstname,
        lastname,
        street,
        country_code,
        city,
        area
      },
    } = this.props;

    const def = default_billing === true ? __("default") : " ";
    const countryId = `(${country_code})`;

    return (
      <div block="MyAccountAddressCard" onClick={this.mobileEditAddress}>
        <div block="MyAccountAddressCard" elem="Default">
          {def}
        </div>
        <div block="MyAccountAddressCard" elem="Name">
          {firstname} {lastname}
        </div>
        <div block="MyAccountAddressCard" elem="Street">
          {street}
        </div>
        <div block="MyAccountAddressCard" elem="City">
          {area}
          {" - "}
          {city}
          {" - "}
          {countryId}
        </div>
        <div block="MyAccountAddressCard" elem="Phone">
          {this.getPhone()}
        </div>
      </div>
    );
  }

  render() {
    const { countries = [], mix } = this.props;

    return (
      <div block="MyAccountAddressTable" mix={mix}>
        <Loader isLoading={!countries.length} />
        {this.renderCard()}
        {this.renderActions()}
      </div>
    );
  }
}

export default MyAccountAddressTable;
