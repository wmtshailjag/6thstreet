import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { StoreCreditData } from 'Util/API/endpoint/StoreCredit/StoreCredit.type';

import MyAccountStoreCredit from './MyAccountStoreCredit.component';

export const mapStateToProps = (state) => ({
    storeCredit: state.StoreCreditReducer.storeCredit
});

export class MyAccountStoreCreditContainer extends PureComponent {
    static propTypes = {
        storeCredit: StoreCreditData.isRequired
    };

    render() {
        return (
            <MyAccountStoreCredit { ...this.props } />
        );
    }
}

export default connect(mapStateToProps)(MyAccountStoreCreditContainer);
