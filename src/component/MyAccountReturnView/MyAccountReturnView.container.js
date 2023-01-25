// import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { MatchType } from 'Type/Common';
import MagentoAPI from 'Util/API/provider/MagentoAPI';

import MyAccountReturnView from './MyAccountReturnView.component';

export const mapStateToProps = (_state) => ({
    // wishlistItems: state.WishlistReducer.productsInWishlist
});

export const mapDispatchToProps = (_dispatch) => ({
    // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class MyAccountReturnViewContainer extends PureComponent {
    static propTypes = {
        match: MatchType.isRequired
    };

    containerFunctions = {
        // getData: this.getData.bind(this)
    };

    state = {
        isLoading: true,
        order_id: null,
        order_increment_id: null,
        increment_id: null,
        date: null,
        items: []
    };

    constructor(props) {
        super(props);

        this.getReturn();
    }

    containerProps = () => {
        const {
            order_id,
            order_increment_id,
            increment_id,
            date,
            items,
            isLoading,
            status
        } = this.state;

        return {
            orderId: order_id,
            orderNumber: order_increment_id,
            returnNumber: increment_id,
            date,
            items,
            isLoading,
            status
        };
    };

    getReturnId() {
        const {
            match: {
                params: {
                    return: returnItem
                } = {}
            } = {}
        } = this.props;

        return returnItem;
    }

    async getReturn() {
        try {
            const returnId = this.getReturnId();
            const {
                data: {
                    order_id,
                    order_increment_id,
                    increment_id,
                    date,
                    items,
                    status
                }
            } = await MagentoAPI.get(`returns/${ returnId }`);

            this.setState({
                order_id,
                order_increment_id,
                increment_id,
                date,
                items,
                isLoading: false,
                status
            });
        } catch (e) {
            this.setState({ isLoading: false });
        }
    }

    render() {
        return (
            <MyAccountReturnView
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountReturnViewContainer);
