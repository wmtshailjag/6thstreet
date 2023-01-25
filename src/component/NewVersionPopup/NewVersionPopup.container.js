import { connect } from 'react-redux';

import {
    mapDispatchToProps,
    NewVersionPopupContainer as SourceNewVersionPopupContainer
} from 'SourceComponent/NewVersionPopup/NewVersionPopup.container';
import isMobile from 'Util/Mobile';

export class NewVersionPopupContainer extends SourceNewVersionPopupContainer {
    componentDidMount() {
        const { showPopup, goToPreviousHeaderState } = this.props;
        if(!document.cookie.includes("visit"))
        {
            const maxAge = 86400 * 90; // 1 Day * 90
            document.cookie = `visit=firstVisit; max-age=${maxAge}; path=/`;
            if ('serviceWorker' in navigator) {
    
                window.addEventListener('showNewVersionPopup', () => {
                    showPopup({
                        title: __('New version available!')
                    });
    
                    if (isMobile.any()) {
                        goToPreviousHeaderState();
                    }
                });
            }
        }
    }
    toggleNewVersion() {
        if(window.wb) {
            window.wb.addEventListener('controlling', () => {
                window.location.reload();
            });
    
            window.wb.messageSkipWaiting();
        }
    }
}

export default connect(null, mapDispatchToProps)(NewVersionPopupContainer);
