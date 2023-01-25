import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { customerType } from "Type/Account";
import { isSignedIn } from "Util/Auth";

import HeaderAccount from "./HeaderAccount.component";

export const MyAccountDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/MyAccount/MyAccount.dispatcher"
);

export const mapStateToProps = (state) => ({
  language: state.AppState.language,
  customer: state.MyAccountReducer.customer,
});

export class HeaderAccountContainer extends PureComponent {
  static propTypes = {
    isBottomBar: PropTypes.bool,
    isAccount: PropTypes.bool,
    language: PropTypes.string.isRequired,
    customer: customerType,
    requestCustomerData: PropTypes.func,
    handleFooterIsAccountOpen: PropTypes.func,
    isFooter: PropTypes.bool,
  };

  static defaultProps = {
    isBottomBar: false,
    isAccount: false,
    isFooter: false,
    customer: null,
    handleFooterIsAccountOpen: () => {},
  };

  containerFunctions = {
    requestCustomerData: this.requestCustomerData.bind(this),
  };

  containerProps = () => ({
    customer: this._getCustomerInformation(),
    isSignedIn: isSignedIn(),
  });

  requestCustomerData() {
    const { requestCustomerData } = this.props;

    requestCustomerData();
  }

  _getCustomerInformation() {
    const { customer } = this.props;

    if (!isSignedIn()) {
      return null;
    }

    return customer;
  }

  render() {
    return (
      <HeaderAccount
        {...this.props}
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(mapStateToProps, null)(HeaderAccountContainer);
