import PropTypes from 'prop-types';

export const Brand = PropTypes.shape({
    name: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired
});

export const Brands = PropTypes.arrayOf(Brand);

export const FormattedBrands = PropTypes.objectOf(Brands);
