export const SET_LIVE_PARTY_DATA = "SET_LIVE_PARTY_DATA";
export const SET_LIVE_PARTY_LOADING = "SET_LIVE_PARTY_LOADING";
export const SET_UPCOMING_PARTY_DATA = "SET_UPCOMING_PARTY_DATA";
export const SET_UPCOMING_PARTY_LOADING = "SET_UPCOMING_PARTY_LOADING";
export const SET_ARCHIVED_PARTY_DATA = "SET_ARCHIVED_PARTY_DATA";
export const SET_ARCHIVED_PARTY_LOADING = "SET_ARCHIVED_PARTY_LOADING";
export const SET_LIVE_PARTY_ISLIVE = "SET_LIVE_PARTY_ISLIVE"

export const setLivePartyLoading = (isLoading) => ({
  type: SET_LIVE_PARTY_LOADING,
  isLiveLoading: isLoading,
});

export const setUpcomingPartyLoading = (isLoading) => ({
  type: SET_UPCOMING_PARTY_LOADING,
  isLoading,
});

export const setArchivedPartyLoading = (isLoading) => ({
  type: SET_ARCHIVED_PARTY_LOADING,
  isLoading,
});

export const setLivePartyData = (data) => ({
  type: SET_LIVE_PARTY_DATA,
  data,
});

export const setLivePartyIsLive = (data) => ({
  type: SET_LIVE_PARTY_ISLIVE,
  data,
});

export const setUpcomingPartyData = (data) => ({
  type: SET_UPCOMING_PARTY_DATA,
  data,
});

export const setArchivedPartyData = (data) => ({
  type: SET_ARCHIVED_PARTY_DATA,
  data,
});
