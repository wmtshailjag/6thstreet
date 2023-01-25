import PropTypes from 'prop-types';

export const Price = PropTypes.oneOfType([
    PropTypes.arrayOf(
        PropTypes.objectOf(
            PropTypes.shape({
                // TODO: implement all
                '6s_base_price': PropTypes.number,
                '6s_special_price': PropTypes.number
            })
        )
    ),
    PropTypes.objectOf(
        PropTypes.shape({
            // TODO: implement all
            '6s_base_price': PropTypes.number,
            '6s_special_price': PropTypes.number
        })
    )
]);

// eslint-disable-next-line import/prefer-default-export
export const Product = PropTypes.shape({
    brand_name: PropTypes.string,
    name: PropTypes.string,
    sku: PropTypes.string,
    thumbnail_url: PropTypes.string,
    price: Price,
    product:PropTypes.any
});

export const Products = PropTypes.arrayOf(Product);

export const Pages = PropTypes.objectOf(Products);

export const FilterOption = PropTypes.shape({
    facet_key: PropTypes.string,
    facet_value: PropTypes.string,
    label: PropTypes.string,
    product_count: PropTypes.number,
    selected_filters_count: PropTypes.number
});

export const Filter = PropTypes.shape({
    category: PropTypes.string,
    data: PropTypes.objectOf(FilterOption),
    is_nested: PropTypes.bool,
    is_radio: PropTypes.bool,
    label: PropTypes.string,
    selected_filters_count: PropTypes.number
});

export const Filters = PropTypes.objectOf(Filter);

export const RequestedOptions = PropTypes.shape({
    page: PropTypes.string,
    q: PropTypes.string
});

export const Meta = PropTypes.shape({
    page_count: PropTypes.number
});
