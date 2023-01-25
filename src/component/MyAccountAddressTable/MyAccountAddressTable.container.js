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
import { PureComponent } from "react";
import { connect } from "react-redux";

import {
  ADDRESS_POPUP_ID,
  DELETE_ADDRESS,
  EDIT_ADDRESS,
} from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import { showPopup } from "Store/Popup/Popup.action";
import { addressType } from "Type/Account";
import { countriesType } from "Type/Config";

import MyAccountAddressTable from "./MyAccountAddressTable.component";

export const mapStateToProps = (state) => ({
  countries: state.ConfigReducer.countries,
});

export const mapDispatchToProps = (dispatch) => ({
  showEditPopup: (payload) => dispatch(showPopup(ADDRESS_POPUP_ID, payload)),
});

export class MyAccountAddressTableContainer extends PureComponent {
  static propTypes = {
    address: addressType.isRequired,
    showEditPopup: PropTypes.func.isRequired,
    openForm: PropTypes.func.isRequired,
    countries: countriesType.isRequired,
  };

  containerFunctions = {
    getFormatedRegion: this.getFormatedRegion.bind(this),
    onEditClick: this.onEditClick.bind(this),
    onDeleteClick: this.onDeleteClick.bind(this),
  };

  onEditClick() {
    const { showEditPopup, address, openForm } = this.props;
    openForm();
    showEditPopup({
      action: EDIT_ADDRESS,
      title: __("Edit address"),
      address,
    });
  }

  onDeleteClick() {
    const { showEditPopup, address, openForm } = this.props;

    openForm();
    showEditPopup({
      action: DELETE_ADDRESS,
      title: __("Confirm delete"),
      address,
    });
  }

  getFormatedRegion(address) {
    const { countries } = this.props;
    const {
      country_id,
      area,
      //  region: { region_id, region }
    } = address;

    const country = countries.find(({ id }) => id === country_id);
    if (!country) {
      return {};
    }

    const { label, available_regions } = country;
    const regions = available_regions || [];
    // const { name } = regions.find(({ id }) => id === region_id) || { name: region };

    return {
      country: label,
      region: area,
    };
  }

  render() {
    return (
      <MyAccountAddressTable {...this.props} {...this.containerFunctions} />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAccountAddressTableContainer);
