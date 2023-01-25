import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { showNotification } from 'Store/Notification/Notification.action';
import { customerType } from 'Type/Account';
import { MatchType } from 'Type/Common';
import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MyAccountReturnSuccess from './MyAccountReturnSuccess.component';

export const mapStateToProps = (state) => ({
    customer: state.MyAccountReducer.customer,
    country: state.AppState.country
});

export const mapDispatchToProps = (dispatch) => ({
    showErrorMessage: (message) => dispatch(showNotification('error', message))
});

export class MyAccountReturnSuccessContainer extends PureComponent {
    static propTypes = {
        match: MatchType.isRequired,
        customer: customerType.isRequired,
        showErrorMessage: PropTypes.func.isRequired,
        country: PropTypes.string.isRequired
    };

    state = {
        order_id: null,
        order_increment_id: null,
        increment_id: null,
        items: [],
        date: null,
        isLoading: false
    };

    componentDidMount() {
        this.getReturnInformation();
    }

    containerProps = () => {
        const { country, customer } = this.props;
        const {
            order_id,
            order_increment_id,
            increment_id,
            date,
            items,
            isLoading
        } = this.state;

        return {
            orderId: order_id,
            orderNumber: order_increment_id,
            returnNumber: increment_id,
            date,
            items,
            isLoading,
            customer,
        };
    };

    getReturnId() {
        const {
            match: {
                params: {
                    returnId
                } = {}
            } = {}
        } = this.props;

        return returnId;
    }

    getReturnInformation() {
        const { showErrorMessage } = this.props;
        const returnId = this.getReturnId();

        this.setState({ isLoading: true });

        MagentoAPI.get(`returns/${ returnId }`).then(({ data }) => {
            const {
                order_id,
                order_increment_id,
                increment_id,
                date,
                items
            } = data;

            this.setState({
                isLoading: false,
                order_id,
                order_increment_id,
                increment_id,
                date,
                items
            });
        }).catch(() => {
            showErrorMessage(__('Error appeared while fetching return request information'));
            this.setState({ isLoading: false });
        });
    }

    render() {
        return <MyAccountReturnSuccess { ...this.containerProps() } />;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnSuccessContainer);
