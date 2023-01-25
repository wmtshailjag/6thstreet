/* eslint-disable jsx-a11y/control-has-associated-label */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import CountrySwitcher from 'Component/CountrySwitcher';
import LanguageSwitcher from 'Component/LanguageSwitcher';
import Link from 'Component/Link';
import StoreCredit from 'Component/StoreCredit';
import { isArabic } from 'Util/App';

import './MyAccountMobileHeader.style.scss';

class MyAccountMobileHeader extends PureComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        isHiddenTabContent: PropTypes.bool.isRequired,
        alternativePageName: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    };

    state = {
        isArabic: isArabic(),
        isClubApparel: false
    };

    static getDerivedStateFromProps(props) {
        const { alternativePageName, name, isHiddenTabContent } = props;

        if (isHiddenTabContent) {
            return {
                isClubApparel: alternativePageName === 'Club Apparel Loyalty' || name === 'Club Apparel Loyalty'
            };
        }

        return {
            isClubApparel: false
        };
    }

    renderStoreCredits() {
        return (
            <>
                <Link
                  block="MyAccountMobileHeader"
                  elem="StoreCreditLink"
                  to="/my-account/storecredit/info"
                >
                    <StoreCredit />
                </Link>
                { this.renderChangeStore() }
            </>
        );
    }

    renderTabOptionHeader() {
        const { alternativePageName, name } = this.props;

        return (
            <div block="MyAccountMobileHeader" elem="TabOptionHeader">
                { this.renderCloseButton() }
                <h1 block="MyAccountMobileHeader" elem="Heading">{ alternativePageName || name }</h1>
            </div>
        );
    }

    renderCloseButton() {
        const { onClose } = this.props;
        const { isArabic, isClubApparel } = this.state;

        return (
            <button
              elem="Button"
              block="MyAccountMobileHeader"
              onClick={ onClose }
              mods={ { isArabic, isClubApparel } }
            />
        );
    }

    renderChangeStore() {
        return (
            <div block="MyAccountOverlay" elem="StoreSwitcher">
                <LanguageSwitcher />
                <CountrySwitcher />
            </div>
        );
    }

    render() {
        const { isHiddenTabContent } = this.props;
        const { isClubApparel } = this.state;

        return !isClubApparel ? (
            <div block="MyAccountMobileHeader">
                { isHiddenTabContent
                    ? this.renderTabOptionHeader()
                    : this.renderStoreCredits() }
                <div block="MyAccountMobileHeader" elem="Actions" />
            </div>
        ) : this.renderCloseButton();
    }
}

export default MyAccountMobileHeader;
