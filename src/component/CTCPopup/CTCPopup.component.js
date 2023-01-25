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

import "./CTCPopup.style";

import PropTypes from "prop-types";
import { createPortal } from "react-dom";

import ClickOutside from "Component/ClickOutside";
import Overlay from "Component/Overlay/Overlay.component";

import { ESCAPE_KEY } from "./CTCPopup.config";


export class CTCPopup extends Overlay {
  static propTypes = {
    ...Overlay.propTypes,
    clickOutside: PropTypes.bool,
    title: PropTypes.string,
  };

  static defaultProps = {
    ...Overlay.defaultProps,
    clickOutside: true,
    title: "",
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.freezeScroll();
    window.addEventListener('popstate', this.hidePopUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.unfreezeScroll()
    window.removeEventListener('popstate', this.hidePopUp);
  }

  onVisible() {
    const { onVisible } = this.props;
    // this.freezeScroll();
    this.overlayRef.current.focus();

    // window.addEventListener('popstate', this.hidePopUp);

    window.history.pushState(
      {
        popupOpen: true,
      },
      "",
      location.pathname
    );

    onVisible();
  }

  // onHide() {
  //     // window.removeEventListener('popstate', this.hidePopUp);
  //     // this.unfreezeScroll();

  //     // onHide();
  // }

  hidePopUp = () => {
    const { hideActiveOverlay, goToPreviousNavigationState, open, onClose } =
      this.props;
    if (open) {
      onClose();
      goToPreviousNavigationState();
    }
  };

  // Same with click outside
  handleClickOutside = () => {
    const { clickOutside } = this.props;
    if (!clickOutside) {
      return;
    }
    this.hidePopUp();
  };

  handleKeyDown = (e) => {
    switch (e.keyCode) {
      case ESCAPE_KEY:
        this.hidePopUp();
        break;
      default:
        break;
    }
  };

  renderTitle() {
    const { title } = this.props;
    if (!title) {
      return null;
    }

    return (
      <h3 block="CTCPopup" elem="Heading">
        {title}
      </h3>
    );
  }

  renderCloseButton() {
    return (
      <button
        block="CTCPopup"
        elem="CloseBtn"
        aria-label={__("Close")}
        onClick={this.hidePopUp}
      /> 
    );
  }

  renderContent() {
    const { children, open } = this.props;
    if (!open) {
      return null;
    }

    return (
      <ClickOutside onClick={this.handleClickOutside}>
        <div block="CTCPopup" elem="Content">
          <header block="CTCPopup" elem="Header">
            {this.renderTitle()}
            {this.renderCloseButton()}
          </header>
          {children}
        </div>
      </ClickOutside>
    );
  }

  render() {
    const { mix, areOtherOverlaysOpen, open } = this.props;
    return createPortal(
      <div
        ref={this.overlayRef}
        block="CTCPopup"
        mods={{ isVisible: open, isInstant: areOtherOverlaysOpen }}
        mix={{ ...mix, mods: { ...mix.mods, isVisible: open } }}
      >
        {this.renderContent()}
      </div>,
      document.body
    );
  }
}

export default CTCPopup;
