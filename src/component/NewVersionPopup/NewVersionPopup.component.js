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

import Popup from 'Component/Popup';
import { NEW_VERSION_POPUP_ID } from 'SourceComponent/NewVersionPopup//NewVersionPopup.config';
import SourceNewVersionPopup from 'SourceComponent/NewVersionPopup/NewVersionPopup.component';
import { isArabic } from 'Util/App';

import './NewVersionPopup.extended.style';

export class NewVersionPopup extends SourceNewVersionPopup {
    state = {
        isArabic: isArabic()
    };

    render() {
        const { isArabic } = this.state;

        return (
            <Popup
              id={ NEW_VERSION_POPUP_ID }
              clickOutside={ false }
              mix={ { block: 'NewVersionPopup', mods: { isArabic } } }
            >
                { this.renderContent() }
            </Popup>
        );
    }
}

export default NewVersionPopup;
