/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/no-unused-prop-types */
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

import Link from "Component/Link";
import { PureComponent } from "react";
import isMobile from "Util/Mobile";
import "./SettingsScreen.style";
import CountrySwitcher from 'Component/CountrySwitcher';
import LanguageSwitcher from 'Component/LanguageSwitcher';

export class SettingsScreen extends PureComponent {
  static propTypes = {};

  static defaultProps = {
    payload: {},
  };

  state = {
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  getCountryConfigs() {
    const {
      config: { countries },
      country,
      language,
    } = this.props;
    const {
      currency,
      // toll_free: phone,
    } = countries[country];

    return {
      currency,
      // toll_free,
    };
  }

  render() {
    const { currency } = this.getCountryConfigs();
    return (
      <div block="Settings">
        <ul block="SettingsList">
          <li block="MyAccountTabListItem">
            <button block="MyAccountTabListItem" elem="Button" role="link">
              <div block="MyAccountTabListItem" elem="ButtonText">
                <div>{__("Language")}</div>
                <LanguageSwitcher />
              </div>
            </button>
          </li>
          <li block="MyAccountTabListItem">
            <button block="MyAccountTabListItem" elem="Button" role="link">
              <div block="MyAccountTabListItem" elem="ButtonText">
                <div>{__("Country")}</div>
                <CountrySwitcher />
              </div>
            </button>
          </li>
          <li block="MyAccountTabListItem">
            <button block="MyAccountTabListItem" elem="Button" role="link">
              <div block="MyAccountTabListItem" elem="ButtonText">
                <div>{__("Currency")}</div>
                <div>{currency}</div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default SettingsScreen;
