import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Loader from 'Component/Loader';
import { STATUS_COMPLETE } from 'Component/MyAccountOrderListItem/MyAccountOrderListItem.config';
import MyAccountReturnCreateListItem from 'Component/MyAccountReturnCreateListItem';
import { OrderType } from 'Type/API';

import './MyAccountReturnCreateList.style';

export class MyAccountReturnCreateList extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        orders: PropTypes.arrayOf(OrderType)
    };

    static defaultProps = {
        orders: []
    };

    render() {
        const { orders = [], isLoading } = this.props;

        return (
            <div block="MyAccountReturnCreateList">
                <Loader isLoading={ isLoading } />
                { (!isLoading && !orders.length) && <p>{ __('Cannot create return. Try later') }</p> }
                { orders.filter(({ status }) => status === STATUS_COMPLETE)
                    .map((order) => <MyAccountReturnCreateListItem key={ order.id } order={ order } />) }
            </div>
        );
    }
}

export default MyAccountReturnCreateList;
