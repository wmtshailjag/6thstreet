import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { showNotification } from 'Store/Notification/Notification.action';
import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MyAccountReturnCreateList from './MyAccountReturnCreateList.component';

export const mapStateToProps = () => ({});

export const mapDispatchToProps = (dispatch) => ({
    showErrorNotification: (error) => dispatch(showNotification('error', error))
});

export class MyAccountReturnCreateListContainer extends PureComponent {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired
    };

    state = {
        isLoading: false,
        orders: []
    };

    componentDidMount() {
        this._isMounted = true;

        this.getOrderList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    containerProps = () => {
        const { orders, isLoading } = this.state;

        return { orders, isLoading };
    };

    getOrderList() {
        const { showErrorNotification } = this.props;

        this.setState({ isLoading: true });

        MagentoAPI.get('orders/list').then(({ data: { orders } }) => {
            if (!this._isMounted) {
                return;
            }

            this.setState({ orders, isLoading: false });
        }).catch(() => {
            if (!this._isMounted) {
                return;
            }

            showErrorNotification(__('Error appeared while fetching orders'));
            this.setState({ isLoading: false });
        });
    }

    render() {
        return (
            <MyAccountReturnCreateList
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnCreateListContainer);
