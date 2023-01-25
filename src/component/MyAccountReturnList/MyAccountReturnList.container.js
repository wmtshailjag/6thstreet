import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { showNotification } from 'Store/Notification/Notification.action';
import { HistoryType } from 'Type/Common';
import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MyAccountReturnList from './MyAccountReturnList.component';

export const mapStateToProps = (_state) => ({
    // wishlistItems: state.WishlistReducer.productsInWishlist
     is_exchange_enabled: _state.AppConfig.is_exchange_enabled,

});

export const mapDispatchToProps = (dispatch) => ({
    showErrorNotification: (error) => dispatch(showNotification('error', error))
});

export class MyAccountReturnListContainer extends PureComponent {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired,
        history: HistoryType.isRequired
    };

    state = {
        isLoading: true,
        returns: []
    };

    containerFunctions = {
        handleCreateClick: this.handleCreateClick.bind(this)
    };

    constructor(props) {
        super(props);

        this.getReturns();
    }

    handleCreateClick() {
        const { history } = this.props;

        history.push('/my-account/my-orders/');
    }

    containerProps = () => {
        const {
            isLoading,
            returns
        } = this.state;
        const {is_exchange_enabled} = this.props;

        return {
            isLoading,
            returns,
            is_exchange_enabled
        };
    };

    async getReturns() {
        const { showErrorNotification } = this.props;

        try {
            const { data: returns } = await MagentoAPI.get('returns/list');
            this.setState({ returns, isLoading: false });
        } catch (e) {
            showErrorNotification(e);
            this.setState({ isLoading: false });
        }
    }

    render() {
        return (
            <MyAccountReturnList
                {...this.containerFunctions}
                {...this.containerProps()}
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnListContainer));
