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
import Image from "Component/Image";

import LoaderImg from "./images/loader-1.gif";

import "./Loader.style";

/**
 * Loader component
 * Loaders overlay to identify loading
 * @class Loader
 */
export class Loader extends PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
  };

  renderMain() {
    return <img block="Loader" elem="Main" src={LoaderImg} alt="Loader" />;
  }
  renderCSSLoader() {
    return <div block="Loader" elem="SpinningLoader"></div>;
  }

  render() {
    const { isLoading } = this.props;
    if (!isLoading) {
      return null;
    }

    return (
      <div block="Loader">
        <div block="Loader" elem="Scale">
          {/* {this.renderMain()} */}
          {this.renderCSSLoader()}
        </div>
      </div>
    );
  }
}

export default Loader;
