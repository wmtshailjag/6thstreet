import PropTypes from 'prop-types';

export const ReturnReasonType = PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string
});

// They have the same type declaration. Creating it to be able to differetiate them
export const ReturnResolutionType = ReturnReasonType;

export const AbstractReturnItemType = {
    name: PropTypes.string,
    thumbnail: PropTypes.string,
    color: PropTypes.string,
    size: PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string
    })
};

export const ReturnItemType = PropTypes.shape({
    ...AbstractReturnItemType,
    item_id: PropTypes.string,
    row_total: PropTypes.string,
    discount_percent: PropTypes.string,
    discount_amount: PropTypes.string,
    product_options: PropTypes.shape({
        info_buyRequest: PropTypes.shape({
            qty: PropTypes.string
        })
    })
});

export const ReturnSuccessItemType = PropTypes.shape({
    ...AbstractReturnItemType,
    id: PropTypes.string,
    price: PropTypes.string,
    original_price: PropTypes.string,
    qty_requested: PropTypes.number
});

export const AbstractOrderType = {
    customer_id: PropTypes.string.isRequired,
    increment_id: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    currency_code: PropTypes.string.isRequired,
    discount_amount: PropTypes.string.isRequired,
    msp_cod_amount: PropTypes.string,
    shipping_amount: PropTypes.string.isRequired,
    subtotal: PropTypes.string.isRequired,
    grand_total: PropTypes.string.isRequired,
    tax_amount: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    brand_name: PropTypes.string.isRequired,
    items_count: PropTypes.number.isRequired,
    courier_deliver_date: PropTypes.string.isRequired,
    packages_count: PropTypes.number
};

export const OrderType = PropTypes.shape({
    ...AbstractOrderType,
    id: PropTypes.string.isRequired
});

export const ExtendedOrderType = PropTypes.shape({
    ...AbstractOrderType,
    entity_id: PropTypes.string.isRequired,
    order_currency_code: PropTypes.string.isRequired
});
