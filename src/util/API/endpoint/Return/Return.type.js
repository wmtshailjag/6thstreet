import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const Return = PropTypes.shape({
    return_id: PropTypes.string,
    date: PropTypes.string,
    status: PropTypes.string,
    return_increment_id: PropTypes.string,
    order_id: PropTypes.string
});
