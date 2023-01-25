import {
  SET_ARCHIVED_PARTY_DATA,
  SET_ARCHIVED_PARTY_LOADING,
  SET_LIVE_PARTY_DATA,
  SET_LIVE_PARTY_ISLIVE,
  SET_LIVE_PARTY_LOADING,
  SET_UPCOMING_PARTY_DATA,
  SET_UPCOMING_PARTY_LOADING,
} from "./LiveParty.action";

export const getInitialState = () => ({
  live: {},
  upcoming: [],
  archived: [],
  isLiveLoading: true,
  isUpcomingLoading: true,
  isArchivedLoading: true,
  isLive: false
});

export const LivePartyReducer = (state = getInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case SET_LIVE_PARTY_DATA:
      const { data: live = {} } = action;

      return {
        ...state,
        live,
      };

      case SET_LIVE_PARTY_ISLIVE:
      const { data : isLive = {} } = action;
      return {
        ...state,
        isLive,
      };

    case SET_LIVE_PARTY_LOADING:
      const { isLiveLoading } = action;
      return {
        ...state,
        isLiveLoading,
      };

    case SET_UPCOMING_PARTY_DATA:
      const { data: upcoming = {} } = action;

      return {
        ...state,
        upcoming,
      };

    case SET_UPCOMING_PARTY_LOADING:
      const { isUpcomingLoading } = action;
      return {
        ...state,
        isUpcomingLoading,
      };

    case SET_ARCHIVED_PARTY_DATA:
      const { data: archived = {} } = action;

      return {
        ...state,
        archived,
      };

    case SET_ARCHIVED_PARTY_LOADING:
      const { isArchivedLoading } = action;
      return {
        ...state,
        isArchivedLoading,
      };

    default:
      return state;
  }
};

export default LivePartyReducer;
