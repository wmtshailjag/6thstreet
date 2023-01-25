import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import MyAccountQuery from "Query/MyAccount.query";
import { showNotification } from "Store/Notification/Notification.action";
import { fetchMutation } from "Util/Request";

import MyAccountPasswordForm from "./MyAccountPasswordForm.component";
export const MyAccountDispatcher = import(
  "Store/MyAccount/MyAccount.dispatcher"
);
export const mapStateToProps = (_state) => ({
  // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (dispatch) => ({
  showSuccessNotification: (message) =>
    dispatch(showNotification("success", message)),
  showErrorNotification: (message) =>
    dispatch(showNotification("error", message)),
  resetUserPassword: (options) =>
    MyAccountDispatcher.then(({ default: dispatcher }) =>
      dispatcher.resetUserPassword(options, dispatch)
    ),
});

export class MyAccountPasswordFormContainer extends PureComponent {
  static propTypes = {
    showSuccessNotification: PropTypes.func.isRequired,
    showErrorNotification: PropTypes.func.isRequired,
  };

  state = {
    isLoading: false,
  };

  containerFunctions = {
    onPasswordChange: this.onPasswordChange.bind(this),
  };

  async onPasswordChange(passwords) {
    const {
      showSuccessNotification,
      showErrorNotification,
      resetUserPassword,
    } = this.props;
    const { currentPassword, newPassword } = passwords;
    let options = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    this.setState({ isLoading: true });

    try {
      const response = await resetUserPassword(options);
      if (response && response.success) {
        showSuccessNotification(__("Your password was successfully updated!"));
      } else {
        showErrorNotification(response);
      }
    } catch (e) {
      Logger.log(e);
    }

    this.setState({ isLoading: false });
  }

  containerProps = () => {
    const { isLoading } = this.state;
    return { isLoading };
  };

  render() {
    return (
      <MyAccountPasswordForm
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAccountPasswordFormContainer);
