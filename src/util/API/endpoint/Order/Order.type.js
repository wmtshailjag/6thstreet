import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const Order = PropTypes.shape({
    increment_id: PropTypes.string,
    id: PropTypes.string,
    status: PropTypes.string,
    grand_total: PropTypes.string,
    currency_code: PropTypes.string,
    created_at: PropTypes.string,
    thumbnail: PropTypes.string,
    items_count: PropTypes.number
});
