import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { hideActiveOverlay, toggleOverlayByKey } from 'Store/Overlay/Overlay.action';

import CreditCardPopup from './CreditCardPopup.component';
import { CC_POPUP_ID } from './CreditCardPopup.config';

export const mapDispatchToProps = (dispatch) => ({
    showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
    hideActiveOverlay: () => dispatch(hideActiveOverlay())
});

export class CreditCardPopupContainer extends PureComponent {
    static propTypes = {
        threeDsUrl: PropTypes.string.isRequired,
        showOverlay: PropTypes.func.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { showOverlay } = this.props;

        showOverlay(CC_POPUP_ID);
    }

    render() {
        return (
            <CreditCardPopup
              { ...this.props }
            />
        );
    }
}

export default connect(null, mapDispatchToProps)(CreditCardPopupContainer);
