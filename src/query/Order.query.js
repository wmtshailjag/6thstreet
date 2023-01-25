import { OrderQuery as SourceOrderQuery } from 'SourceQuery/Order.query';
import { Field } from 'Util/Query';

export class OrderQuery extends SourceOrderQuery {
    getOrderListQuery() {
        return new Field('customerOrders')
            .addFieldList(this._getOrderListFields());
    }

    _getOrderListItemsField() {
        return new Field('items')
            .addFieldList(this._getOrderListItemsFields());
    }

    _getOrderListItemsFields() {
        return [
            'created_at',
            'id',
            'increment_id',
            'grand_total',
            'status'
        ];
    }

    _getOrderListFields() {
        return [
            this._getOrderListItemsField()
        ];
    }
}

export default new OrderQuery();
