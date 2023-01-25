import PropTypes from 'prop-types';

export const StoreCreditHistoryItem = PropTypes.shape({
    action: PropTypes.string,
    balance_amount: PropTypes.string,
    balance_change: PropTypes.string,
    updated_at: PropTypes.string
});

export const StoreCreditHistory = PropTypes.arrayOf(StoreCreditHistoryItem);

export const StoreCreditData = PropTypes.shape({
    current_balance: PropTypes.string,
    history: StoreCreditHistory
});
