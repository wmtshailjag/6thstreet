import { connect } from 'react-redux';

import {
    mapDispatchToProps,
    mapStateToProps,
    MyAccountReturnSuccessContainer as SourceComponent
} from 'Component/MyAccountReturnSuccess/MyAccountReturnSuccess.container';
import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MyAccountCancelCreateSuccess from './MyAccountCancelCreateSuccess.component';

export class MyAccountCancelCreateSuccessContainer extends SourceComponent {
    containerProps = () => {
        const {
            order_id,
            cancel_request_id,
            date,
            items,
            isLoading,
            customer_mail
        } = this.state;

        return {
            orderNumber: order_id,
            cancelNumber: cancel_request_id,
            customerEmail: customer_mail,
            date,
            items,
            isLoading
        };
    };

    getReturnInformation() {
        const {
            showErrorMessage,
            match: {
                params: {
                    cancelId
                } = {}
            } = {}
        } = this.props;

        this.setState({ isLoading: true });

        MagentoAPI.get(`order/${ cancelId }/cancelorder`).then((data) => {
            const {
                order_id,
                cancel_request_id,
                date,
                customer_mail,
                items
            } = data;

            this.setState({
                isLoading: false,
                order_id,
                cancel_request_id,
                date,
                items,
                customer_mail
            });
        }).catch(() => {
            showErrorMessage(__('Error appeared while fetching cancel request information'));
            this.setState({ isLoading: false });
        });
    }

    render() {
        return <MyAccountCancelCreateSuccess { ...this.containerProps() } />;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountCancelCreateSuccessContainer);
