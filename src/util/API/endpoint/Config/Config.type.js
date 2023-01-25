import PropTypes from 'prop-types';

export const Countries = PropTypes.objectOf(
    // TODO: implement all
    PropTypes.shape({
        locales: PropTypes.arrayOf(PropTypes.string),
        value: PropTypes.string
    })
);

// eslint-disable-next-line import/prefer-default-export
export const Config = PropTypes.shape({
    countries: Countries,
    support_email: PropTypes.string
});
