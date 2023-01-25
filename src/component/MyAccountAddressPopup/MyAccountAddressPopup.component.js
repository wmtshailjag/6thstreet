/* eslint-disable react/prop-types */
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

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import isMobile from "Util/Mobile";

import Loader from 'Component/Loader';
import MyAccountDeliveryAddressForm from 'Component/MyAccountDeliveryAddressForm';
import { addressType } from 'Type/Account';
import { isArabic } from 'Util/App';

import {
    ADD_ADDRESS, ADDRESS_POPUP_ID, DELETE_ADDRESS, EDIT_ADDRESS
} from './MyAccountAddressPopup.config';

import './MyAccountAddressPopup.style';

export class MyAccountAddressPopup extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        handleAddress: PropTypes.func.isRequired,
        handleDeleteAddress: PropTypes.func.isRequired,
        payload: PropTypes.shape({
            action: PropTypes.oneOf([
                EDIT_ADDRESS,
                DELETE_ADDRESS,
                ADD_ADDRESS
            ]),
            address: addressType
        }).isRequired
    };

    state = {
        defaultChecked: false,
        mobileDeleteNotice: false,
        isArabic: isArabic()
    };

    componentDidUpdate(prevProps, _) {
        const { payload = {} } = this.props;
        const { payload: prevPayload = {} } = prevProps;

        if (Object.keys(payload).length > 0 && Object.keys(prevPayload).length > 0) {
            const { address: { id } } = payload;
            const { address: { id: prevId } } = prevPayload;

            if (id !== prevId) {
                this.checkAddressChange();
            }
        }
    }

    isDefaultShipping() {
        const { payload: { address } } = this.props;
        const defaultAddressId = JSON.parse(localStorage.getItem('customer')).data.default_shipping;
        return Number(address.id) === Number(defaultAddressId);
    }

    changeDefaultShipping = () => {
        const { defaultChecked } = this.state;

        this.setState({ defaultChecked: !defaultChecked });
    };

    checkAddressChange() {
        this.setState({ defaultChecked: this.isDefaultShipping() });
    }

    renderAddressForm(form) {
        const {
            payload: { address }, customer, closeForm, handleAddress, isExchange
        } = this.props;
        const { defaultChecked, mobileDeleteNotice } = this.state;

        return (
            <>
                {isExchange && isMobile.any() ? null :
                    <button
                        block="MyAccountAddressPopup"
                        elem="DeleteBtn"
                        mods={{ newForm: form }}
                        onClick={this.openMobileDeleteNotice}
                    >
                        {__('Delete')}
                    </button>
                }
                {mobileDeleteNotice ? this.renderMobileDeleteNotice() : null}
                <MyAccountDeliveryAddressForm
                    newForm={form}
                    address={address}
                    onSave={handleAddress}
                    closeForm={closeForm}
                    customer={customer}
                    defaultChecked={defaultChecked}
                    changeDefaultShipping={this.changeDefaultShipping}
                />
            </>
        );
    }

    openMobileDeleteNotice = () => {
        this.setState({ mobileDeleteNotice: true });
    };

    closeMobileDeleteNotice = () => {
        this.setState({ mobileDeleteNotice: false });
    };

    deleteMobile = () => {
        const { handleDeleteAddress } = this.props;
        handleDeleteAddress();
        this.closeMobileDeleteNotice();
    };

    renderMobileDeleteNotice() {
        return (
            <div
                block="MyAccountAddressPopup"
                elem="DeletePopup"
            >
                <div
                    block="MyAccountAddressPopup"
                    elem="DeletePopupContainer"
                    mods={{ isMobile: true }}
                >
                    <h2>{__('Delete')}</h2>
                    <p>{__('Are you sure you want to delete this address?')}</p>
                    <div
                        block="MyAccountAddressPopup"
                        elem="BtnContainer"
                    >
                        <button block="MyAccountAddressPopup" elem="NoBtn" onClick={this.closeMobileDeleteNotice}>
                            {__('No')}
                        </button>
                        <button block="MyAccountAddressPopup" elem="YesBtn" onClick={this.deleteMobile}>
                            {__('Yes')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderDeleteNotice() {
        const { handleDeleteAddress, closeForm } = this.props;

        return (
            <div
                block="MyAccountAddressPopup"
                elem="DeletePopup"
            >
                <div
                    block="MyAccountAddressPopup"
                    elem="DeletePopupContainer"
                >
                    <p>{__('Are you sure you want to delete this address?')}</p>
                    <button block="button primary" onClick={handleDeleteAddress}>
                        {__('Yes')}
                    </button>
                    <button block="MyAccountAddressPopup" elem="CancelBtn" onClick={closeForm}>
                        {__('Cancel')}
                    </button>
                    <button block="MyAccountAddressPopup" elem="xBtn" onClick={closeForm}>
                        &#10005;
                    </button>
                </div>
            </div>
        );
    }

    renderContent() {
        const { payload: { action } } = this.props;

        switch (action) {
            case EDIT_ADDRESS:
                return this.renderAddressForm(false);
            case ADD_ADDRESS:
                return this.renderAddressForm(true);
            case DELETE_ADDRESS:
                return this.renderDeleteNotice();
            default:
                return null;
        }
    }

    render() {
        const { isLoading, formContent } = this.props;
        const { isArabic } = this.state;

        return (
            <div
                id={ADDRESS_POPUP_ID}
                mix={{ block: 'MyAccountAddressPopup', mods: { isArabic } }}
            >
                <Loader isLoading={isLoading} />
                {formContent ? this.renderContent() : null}
            </div>
        );
    }
}

export default MyAccountAddressPopup;
