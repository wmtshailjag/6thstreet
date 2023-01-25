import PropTypes from 'prop-types';

import { Product } from '../Product/Product.type';

// eslint-disable-next-line import/prefer-default-export
export const WishlistItem = PropTypes.shape({
    wishlist_item_id: PropTypes.string,
    wishlist_id: PropTypes.string,
    product_id: PropTypes.string,
    store_id: PropTypes.string,
    added_at: PropTypes.string,
    description: PropTypes.string,
    qty: PropTypes.number,
    product: Product
});

export const WishlistItems = PropTypes.arrayOf(WishlistItem);
