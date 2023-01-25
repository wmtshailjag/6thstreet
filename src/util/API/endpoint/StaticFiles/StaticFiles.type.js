import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const DynamicContent = PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string
}));
