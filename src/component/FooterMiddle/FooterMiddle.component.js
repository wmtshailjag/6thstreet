import PropTypes from 'prop-types';
import { Fragment, PureComponent } from 'react';

import CountrySwitcher from 'Component/CountrySwitcher';
import HeaderAccount from 'Component/HeaderAccount';
import InlineCustomerSupport from 'Component/InlineCustomerSupport';
import LanguageSwitcher from 'Component/LanguageSwitcher';
import { DEFAULT_STATE_NAME } from 'Component/NavigationAbstract/NavigationAbstract.config';

import './FooterMiddle.style';

class FooterMiddle extends PureComponent {
    static propTypes = {
        handleFooterIsAccountOpen: PropTypes.func
    };

    static defaultProps = {
        handleFooterIsAccountOpen: () => {}
    };

    state = {
        isCheckout: false
    };

    stateMap = {
        [DEFAULT_STATE_NAME]: {
            support: true,
            account: true,
            store: true
        }
    };

    renderMap = {
        support: this.renderCustomerSupport.bind(this),
        account: this.renderAccount.bind(this),
        store: this.renderStoreSwitcher.bind(this)
    };

    static getDerivedStateFromProps() {
        return location.pathname.match(/checkout/)
            ? { isCheckout: true }
            : { isCheckout: false };
    }

    renderCustomerSupport() {
        return (
            <div block="FooterMiddle" elem="CustomerSupport">
                <InlineCustomerSupport key="support" {...this.props} />
            </div>
        );
    }

    renderAccount() {
        const { handleFooterIsAccountOpen } = this.props;
        const isFooter = true;

        return (
        <div block="FooterMiddle" elem="FooterAccount">
            <HeaderAccount
              isFooter={ isFooter }
              handleFooterIsAccountOpen={ handleFooterIsAccountOpen }
              key="account"
            />
        </div>
        );
    }

    renderStoreSwitcher() {
        return (
            <div block="FooterMiddle" elem="StoreSwitcher">
            <Fragment key="store-switcher">
                <LanguageSwitcher />
                <CountrySwitcher />
            </Fragment>
            </div>
        );
    }

    render() {
        const { isCheckout } = this.state;

        if (isCheckout) {
            return null;
        }

        return (
            <div block="FooterMiddle">
                <div block="FooterMiddle" elem="Layout">
                    { this.renderCustomerSupport() }
                    { this.renderAccount() }
                    { this.renderStoreSwitcher() }
                </div>
            </div>
        );
    }
}

export default FooterMiddle;
