/* eslint-disable react/prop-types */
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

import { PureComponent } from "react";

import CountryMiniFlag from "Component/CountryMiniFlag";
import Field from "Component/Field";
import Form from "Component/Form";
import { isArabic } from "Util/App";

import { PHONE_CODES } from "./MyAccountAddressFieldForm.config";

import "./MyAccountAddressFieldForm.style";
import isMobile from "Util/Mobile";
export class MyAccountAddressFieldForm extends PureComponent {
  onFormSuccess() {}

  get fieldMap() {
    return {};
  }

  componentDidMount() {
    if(window.location.pathname === "/checkout" && isMobile.any()) {
      document.body.classList.add('overflow-hidden');
    }
  }
  componentWillUnmount() {
    if(window.location.pathname === "/checkout" && isMobile.any()) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  getDefaultValues([key, props]) {
    const { type = "text", onChange = () => {}, ...otherProps } = props;

    return {
      ...otherProps,
      key,
      name: key,
      id: key,
      type,
      onChange,
    };
  }

  renderField = (fieldEntry) => (
    <Field {...this.getDefaultValues(fieldEntry)} />
  );

  renderCurrentPhoneCode(country_id) {
    const code = PHONE_CODES[country_id] || "";
    const arabicCode = `${code.slice(1)}+`;
    return isArabic() ? arabicCode : code;
  }

  renderFields() {
    const {
      default_billing,
      default_shipping,
      firstname,
      lastname,
      telephone,
      street,
      city,
      postcode,
      country_id,
      country_id: { value },
      region_id,
      region_string,
      default_common,
    } = this.fieldMap;

    this.getCitiesData();

    const { newForm } = this.props;
    const fromTitle = newForm ? __("New Address") : __("Edit Address");
    const region = region_id === undefined ? region_string : region_id;
    return (
      <div block="MyAccountAddressFieldForm" elem="Fields">
        <div block="MyAccountAddressFieldForm" elem="Header">
          <h2 block="MyAccountAddressFieldForm" elem="Title">
            {fromTitle}
          </h2>
        </div>
        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ hidden: true }}
        >
          {this.renderField(["default_billing", default_billing])}
          {this.renderField(["default_shipping", default_shipping])}
          {this.renderField(["postcode", postcode])}
          {this.renderField(["country_id", country_id])}
        </div>

        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ twoFields: true }}
        >
          {this.renderField(["firstname", firstname])}
          {this.renderField(["lastname", lastname])}
        </div>

        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ street: true }}
        >
          {this.renderField(["street", street])}
        </div>

        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ twoFields: true }}
        >
          {this.renderField(["city", city])}
          {this.renderField(["region_string", region])}
        </div>

        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ phone: true }}
        >
          {this.renderField(["telephone", telephone])}
          <div block="MyAccountAddressFieldForm" elem="PhoneCode">
            <CountryMiniFlag label={value} />
            {this.renderCurrentPhoneCode(value)}
          </div>
        </div>

        <div
          block="MyAccountAddressFieldForm"
          elem="FieldWrapper"
          mods={{ toggle: true }}
        >
          {this.renderField(["default_common", default_common])}
        </div>
      </div>
    );
  }

  renderActions() {
    return null;
  }

  render() {
    return (
      <Form
        onSubmitSuccess={this.onFormSuccess}
        mix={{ block: "MyAccountAddressFieldForm" }}
      >
        {this.renderFields()}
        {this.renderActions()}
        {this.renderDiscart()}
      </Form>
    );
  }
}

export default MyAccountAddressFieldForm;
