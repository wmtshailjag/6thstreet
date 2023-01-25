/* eslint-disable react/no-unused-state */
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
import { connect } from "react-redux";
import ContactHelp from "./ContactHelp.component";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  country: state.AppState.country,
  language: state.AppState.language,
});

export const mapDispatchToProps = (dispatch) => ({});

export class ContactHelpContainer extends PureComponent {
  containerFunctions = {};
  state;
  render() {
    return (
      <ContactHelp
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
)(ContactHelpContainer);
