import { PureComponent } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getStoreAddress } from "../../util/API/endpoint/Product/Product.enpoint";

import AppConfigDispatcher from "Store/AppConfig/AppConfig.dispatcher";

import CheckoutAddressForm from "./CheckoutAddressForm.component";

export const mapStateToProps = (state) => ({
  countries: state.ConfigReducer.countries,
  default_country: state.ConfigReducer.default_country,
  addressCityData: state.MyAccountReducer.addressCityData,
});

class CheckoutAddressFormContainer extends PureComponent {
  static propTypes = {
    isClickAndCollect: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      storeAddress: null,
      clickNCollectStatus: false,
    };
  }

  componentDidMount() {
    const { isClickAndCollect } = this.props;
    if (isClickAndCollect) {
      this.getStoreAddress(isClickAndCollect);
    }
  }

  componentDidUpdate() {
    const { isClickAndCollect } = this.props;
    const { storeAddress } = this.state;
    if (isClickAndCollect && isClickAndCollect !== storeAddress?.store_no) {
      this.getStoreAddress(isClickAndCollect);
    }
  }

  async getStoreAddress(storeNo) {
    try {
      const getStoreAddressResponse = await getStoreAddress(storeNo);
      this.setState({
        storeAddress: getStoreAddressResponse.data,
      });
    } catch (err) {
      console.error(err);
    }
  }

  setClickAndCollect = (status) => {
    this.setState({ clickNCollectStatus: status });
  };
  
  render() {
    const { storeAddress, clickNCollectStatus } = this.state;
    return (
      <CheckoutAddressForm
        {...this.props}
        storeAddress={storeAddress}
        clickNCollectStatus={clickNCollectStatus}
        setClickAndCollect={this.setClickAndCollect}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  null
)(CheckoutAddressFormContainer);
