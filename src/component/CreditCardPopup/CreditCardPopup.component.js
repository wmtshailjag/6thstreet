import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import Iframe from 'react-iframe';
import Image from "Component/Image";

import Close from 'Component/HeaderSearch/icons/close-black.png';
import Popup from 'Component/Popup';

import { CC_POPUP_ID } from './CreditCardPopup.config';

import './CreditCardPopup.style.scss';

class CreditCardPopup extends PureComponent {
    static propTypes = {
        threeDsUrl: PropTypes.string.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired
    };

    renderContent() {
        const { threeDsUrl } = this.props;

        return (
            <Iframe
              src={ threeDsUrl }
              width="100%"
              height="100%"
              id={ CC_POPUP_ID }
              display="initial"
              position="fixed"
            />
        );
    }

    renderCloseButton() {
        const { hideActiveOverlay } = this.props;

        return (
            <div block="CreditCardPopup" elem="CloseButtonWrapper">
                <button
                  block="CreditCardPopup"
                  elem="Close"
                  onClick={ hideActiveOverlay }
                >
                    <img src={ Close } alt="Close button" />
                </button>
            </div>
        );
    }

    render() {
        return (
            <Popup
              id={ CC_POPUP_ID }
              mix={ { block: 'CreditCardPopup' } }
            >
                { this.renderCloseButton() }
                { this.renderContent() }
            </Popup>
        );
    }
}

export default CreditCardPopup;
