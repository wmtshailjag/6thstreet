import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  ADD_ADDRESS,
  ADDRESS_POPUP_ID,
} from "Component/MyAccountAddressPopup/MyAccountAddressPopup.config";
import {
  CheckoutAddressBookContainer as SourceCheckoutAddressBookContainer,
  mapStateToProps,
} from "SourceComponent/CheckoutAddressBook/CheckoutAddressBook.container";
import { showPopup } from "Store/Popup/Popup.action";
import { customerType } from "Type/Account";
import CheckoutAddressBook from "./CheckoutAddressBook.component";
import { isArabic } from "Util/App";

export const MyAccountDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/MyAccount/MyAccount.dispatcher"
);

export const mapDispatchToProps = (dispatch) => ({
  showPopup: (payload) => dispatch(showPopup(ADDRESS_POPUP_ID, payload)),
  requestCustomerData: () =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.requestCustomerData(dispatch)
    ),
  estimateEddResponse: (request, type) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.estimateEddResponse(dispatch, request, type)
    ),
});

export class CheckoutAddressBookContainer extends SourceCheckoutAddressBookContainer {
  static propTypes = {
    isSignedIn: PropTypes.bool.isRequired,
    requestCustomerData: PropTypes.func.isRequired,
    onShippingEstimationFieldsChange: PropTypes.func,
    onAddressSelect: PropTypes.func,
    customer: customerType.isRequired,
    isBilling: PropTypes.bool,
    showPopup: PropTypes.func.isRequired,
    shippingAddress: PropTypes.object.isRequired,
    isClickAndCollect: PropTypes.string.isRequired,
  };

  containerFunctions = {
    onAddressSelect: this.onAddressSelect.bind(this),
    showCreateNewPopup: this.showCreateNewPopup.bind(this),
  };

  static _getDefaultAddressId(props) {
    const { customer, isBilling } = props;
    const defaultKey = isBilling ? "default_billing" : "default_shipping";
    const { [defaultKey]: defaultAddressId, addresses } = customer;

    if (defaultAddressId) {
      return +defaultAddressId;
    }
    if (addresses && addresses.length) {
      return addresses[0].id;
    }

    return 0;
  }

  componentDidMount() {
    const { onAddressSelect } = this.props;
    const {selectedAddressId} = this.state
    onAddressSelect(selectedAddressId);
  }

  static getDerivedStateFromProps(props, state) {
    const { prevDefaultAddressId } = state;
    const { selectedAddressId } = props;
    const defaultAddressId = selectedAddressId
      ? selectedAddressId
      : CheckoutAddressBookContainer._getDefaultAddressId(props);

    if (defaultAddressId !== prevDefaultAddressId) {
      return {
        selectedAddressId: defaultAddressId,
        prevDefaultAddressId: defaultAddressId,
      };
    }

    return null;
  }

  onAddressSelect(address) {
    const { id = 0, city, area, country_code } = address;
    const {
      estimateEddResponse,
      edd_info,
      addressCityData,
      isExchange = false,
      onExchangeAddressSelect,
    } = this.props;
    let finalArea = area;
    let finalCity = city;
    this.setState({ selectedAddressId: id });
    if (!isExchange) {
      if (isArabic()) {
        let finalResp = Object.values(addressCityData).filter((cityData) => {
          return cityData.city === city;
        });

        let engAreaIndex = Object.keys(finalResp[0].areas).filter((key) => {
          if (finalResp[0].areas[key] === area) {
            return key;
          }
        });
        let arabicArea = Object.values(finalResp[0].areas_ar).filter(
          (area, index) => {
            if (index === parseInt(engAreaIndex[0])) {
              return area;
            }
          }
        );
        finalArea = arabicArea[0];
        finalCity = finalResp[0].city_ar;
      }
      if (edd_info && edd_info.is_enable) {
        let request = {
          country: country_code,
          city: finalCity,
          area: finalArea,
          courier: null,
          source: null,
        };
        estimateEddResponse(request, false);
      }
    } else {
      onExchangeAddressSelect(id);
    }
  }

  showCreateNewPopup() {
    const { showPopup } = this.props;

    this.openForm();
    showPopup({
      action: ADD_ADDRESS,
      title: __("Add new address"),
      address: {},
    });
  }

  estimateShipping(addressId) {
    const { onShippingEstimationFieldsChange, addresses } = this.props;

    const address = addresses.find(({ id }) => id === addressId);
    if (!address) {
      return;
    }

    const { city, country_code, area, street, phone } = address;

    if (!country_code) {
      return;
    }

    onShippingEstimationFieldsChange({
      city,
      country_code,
      region_id: null,
      area,
      postcode: area,
      phone,
      street,
      telephone: phone.substring("4"),
    });
  }
  render() {
    return (
      <CheckoutAddressBook
        {...this.props}
        {...this.state}
        {...this.containerFunctions}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutAddressBookContainer);
