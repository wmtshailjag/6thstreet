import PropTypes from 'prop-types';

export const memberDetails = PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    memberId: PropTypes.number,
    memberTier: PropTypes.string,
    memberType: PropTypes.string
});

export const ClubApparelMember = PropTypes.shape({
    accountLinked: PropTypes.bool,
    caLoyaltyMember: PropTypes.bool,
    caPoints: PropTypes.number,
    caPointsValue: PropTypes.number,
    cashierId: PropTypes.string,
    currency: PropTypes.string,
    isMember: PropTypes.bool,
    memberDetails: PropTypes.shape({ memberDetails }),
    newMobileNumber: PropTypes.string,
    profileComplete: PropTypes.bool,
    receiptNo: PropTypes.string,
    reqId: PropTypes.string,
    reqTimeStamp: PropTypes.string,
    resDateTime: PropTypes.string,
    status: PropTypes.string,
    statusDetails: PropTypes.string,
    storeId: PropTypes.string,
    terminalId: PropTypes.string
});
