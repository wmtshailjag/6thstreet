import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import ChangePhonePopup from './ChangePhonePopup.component';

export class ChangePhonePopupContainer extends PureComponent {
    static propTypes = {
        isChangePhonePopupOpen: PropTypes.bool.isRequired,
        closeChangePhonePopup: PropTypes.func.isRequired,
        changePhone: PropTypes.func.isRequired,
        countryId: PropTypes.string.isRequired
    };

    render() {
        return (
            <ChangePhonePopup
              { ...this.props }
            />
        );
    }
}

export default ChangePhonePopupContainer;
