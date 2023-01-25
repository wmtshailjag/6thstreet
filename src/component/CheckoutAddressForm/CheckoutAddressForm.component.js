/* eslint-disable no-magic-numbers */
import FormPortal from "Component/FormPortal";
import { CheckoutAddressForm as SourceCheckoutAddressForm } from "SourceComponent/CheckoutAddressForm/CheckoutAddressForm.component";

import "./CheckoutAddressForm.style";

const objTabIndex = {
  city: "6",
  telephone: "9",
  street: "5",
  postcode: "11",
  phonecode: "8",
  firstname: "2",
  guest_email: "4",
  lastname: "3",
  country_id: "10",
  region_string: "7",
};
export class CheckoutAddressForm extends SourceCheckoutAddressForm {
  componentDidUpdate(_, prevState) {
    const { countryId, regionId, region, city, postcode, street, telephone } =
      this.state;

    const {
      countryId: prevCountryId,
      regionId: prevRegionId,
      region: prevRegion,
      city: prevCity,
      postcode: prevpostcode,
      street: prevStreet,
      telephone: prevTelephone,
    } = prevState;

    const streetValue = document.getElementById("street")?.value;

    if (streetValue !== street) {
      this.onChange("street", streetValue);
    }

    // if (
    //   (countryId !== prevCountryId ||
    //     streetValue !== street ||
    //     regionId !== prevRegionId ||
    //     city !== prevCity ||
    //     region !== prevRegion ||
    //     postcode !== prevpostcode ||
    //     street !== prevStreet ||
    //     telephone !== prevTelephone) &&
    //   (city, regionId, telephone) &&
    //   telephone.length > 7
    // ) {
    //   this.estimateShipping();
    // }
  }
  getFilteredFields(result) {
    let filterResult = Object.keys(result).filter((data) => {
      let returnValue;
      if (
        data !== "city" &&
        data !== "street" &&
        data !== "region_string" &&
        data !== "region_id" &&
        data !== "postcode"
      ) {
        returnValue = result[data];
      }
      return returnValue;
    });
    let finalResult = {};
    filterResult.map((data) => {
      return (finalResult[data] = result[data]);
    });
    return finalResult;
  }
  get fieldMap() {
    this.getCitiesAndRegionsData();

    const {
      isSignedIn,
      shippingAddress: { guest_email, phone = "" },
      isClickAndCollect,
      storeAddress,
      clickAndCollectStatus,
      setClickAndCollect,
      customer,
    } = this.props;

    const { telephone, street, ...fieldMap } = super.fieldMap;
    const phoneNumber = phone || customer?.phone
    const customerPhone = phoneNumber?.slice(4, phoneNumber);

    fieldMap.street = {
      ...street,
      onChange: (value) => this.onChange("street", value),
    };

    fieldMap.telephone = {
      ...telephone,
      onChange: (value) => this.onChange("telephone", value),
      type: "phone",
      value: customerPhone,
    };

    const fFieldMap = isSignedIn
      ? fieldMap
      : {
          guest_email: {
            placeholder: __("Email"),
            validation: ["notEmpty", "email"],
            type: "email",
            value: guest_email || customer?.email || "",
          },
          ...fieldMap,
        };

    if (!!isClickAndCollect && storeAddress) {
      const { store_name, address, city, area } = storeAddress;
      if (store_name && address) {
        const value = `${store_name}, ${address}`;
        Object.assign(fieldMap.street || {}, {
          value,
          disabled: true,
        });
        this.onChange("street", value);
      }
      if (city && fieldMap?.city?.selectOptions) {
        const value =
          fieldMap.city.selectOptions.filter(
            ({ label }) => label.toLowerCase() === city.toLowerCase()
          )[0]?.value || "";
        Object.assign(fieldMap.city || {}, {
          value,
          disabled: true,
        });
        this.onChange("city", value);
      }

      if (area && fieldMap?.region_id?.selectOptions) {
        const value =
          fieldMap.region_id.selectOptions.filter(
            ({ label }) => label.toLowerCase() === area.toLowerCase()
          )[0]?.value || "";
        Object.assign(fieldMap.region_id || {}, {
          value,
          disabled: true,
        });
        this.setState({ regionId: value });
      }
    }

    if (this.props.isSignedIn === false) {
      let result = {};
      for (const [key, value] of Object.entries(fFieldMap)) {
        if (!fFieldMap[key].tabIndex) {
          let o = Object.assign({}, value);
          o.tabIndex = objTabIndex[key];
          result[key] = o;
        }
      }
      let finalResult = this.getFilteredFields(result);
      if (clickAndCollectStatus) {
        setClickAndCollect(true);
        return finalResult;
      } else {
        setClickAndCollect(false);
        return result;
      }
    }
    let finalResult = this.getFilteredFields(fFieldMap);
    if (clickAndCollectStatus) {
      setClickAndCollect(true);
      return finalResult;
    } else {
      setClickAndCollect(false);
      return fFieldMap;
    }
  }

  estimateShipping() {
    const { onShippingEstimationFieldsChange } = this.props;

    const { countryId, regionId, city, telephone = "", street } = this.state;

    const streetValue = document.getElementById("street")?.value;

    onShippingEstimationFieldsChange({
      country_code: countryId,
      street: street || streetValue,
      region: regionId,
      area: regionId,
      city,
      postcode: regionId,
      phone: this.renderCurrentPhoneCode() + telephone,
      telephone: this.renderCurrentPhoneCode() + telephone,
    });
  }

  render() {
    const { id, isSignedIn, clickAndCollectStatus ,showCountry} = this.props;
    const { isArabic } = this.state;

    const isGuestForm = !isSignedIn;
    const ClickNCollect = clickAndCollectStatus;
    return (
      <FormPortal id={id} name="CheckoutAddressForm" >
        <div
          block="FieldForm"
          mix={{
            block: "CheckoutAddressForm",
            mods: { isGuestForm, ClickNCollect,showCountry },
          }}
          mods={{ isArabic}}
        >
          {this.renderFields()}
        </div>
      </FormPortal>
    );
  }
}

export default CheckoutAddressForm;
