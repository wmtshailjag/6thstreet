import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const SelectOptions = PropTypes.arrayOf(
    PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string
    })
);
