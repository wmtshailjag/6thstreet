import Popup from '@scandipwa/scandipwa/src/component/Popup';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import HeaderBottomBar from 'Component/HeaderBottomBar';
import { isArabic } from 'Util/App';

import { MOBILE_MENU_SIDEBAR_ID } from './MoblieMenuSideBar.config';

import './MobileMenuSidebar.style';

class MobileMenuSidebar extends PureComponent {
    static propTypes = {
        activeOverlay: PropTypes.string.isRequired
    };

    constructor() {
        super();
        this.state = {
            isOpen: false,
            isArabic: isArabic()
        };
    }

    static getDerivedStateFromProps(nextProps) {
        const { activeOverlay } = nextProps;

        return ({
            isOpen: activeOverlay === MOBILE_MENU_SIDEBAR_ID
        });
    }

    renderModal() {
        const { isOpen } = this.state;
        const { isArabic } = this.state;

        return (
            <Popup
              mix={ { block: 'MobileMenuSidebar', elem: 'Modal', mods: { isArabic, isOpen } } }
              id={ MOBILE_MENU_SIDEBAR_ID }
              activeOverlay={ MOBILE_MENU_SIDEBAR_ID }
            >
                <HeaderBottomBar
                  navigationState="default"
                />
            </Popup>
        );
    }

    render() {
        const { isOpen } = this.state;
        return (
            <div block="MobileMenuSidebar">
                { isOpen ? this.renderModal() : this.renderButton() }
            </div>
        );
    }
}
export default MobileMenuSidebar;
