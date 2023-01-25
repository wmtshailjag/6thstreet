import {
  setLivePartyData,
  setLivePartyLoading,
  setLivePartyIsLive,
  setUpcomingPartyData,
  setUpcomingPartyLoading,
  setArchivedPartyData,
  setArchivedPartyLoading,
} from "./LiveParty.action";

import { getPartyInfo } from "Util/API/endpoint/LiveParty/LiveParty.endpoint";

export class LivePartyDispatcher {
  async requestLiveShoppingInfo(payload, dispatch) {

    const { storeId } = payload;

    try {
      const response = await getPartyInfo({
        storeId,
      });
      if (response) {
        this.requestLiveParty(response, dispatch);
        this.requestUpcomingParty(response, dispatch);
        this.requestArchivedParty(response, dispatch);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async requestLiveParty(response, dispatch) {
    dispatch(setLivePartyLoading(true));

    try {
      dispatch(setLivePartyLoading(false));
      if (response && response.playlists && response.playlists[2] && response.playlists[2].shows && response.playlists[2].shows[0]) {
        dispatch(setLivePartyData(response.playlists[2].shows[0]));

        if(response.playlists[2].shows[0].isLive)
        dispatch(setLivePartyIsLive(response.playlists[2].shows[0].isLive));
       
      }
    } catch (e) {
      dispatch(setLivePartyLoading(false));
    }
  }

  async requestUpcomingParty(response, dispatch) {
    if(response && response.playlists && response.playlists[0] && response.playlists[0].shows)
    {
      response.playlists[0].shows.sort(function(a,b){
        return new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt);
      });
    }
    
    dispatch(setUpcomingPartyLoading(true));

    try {
      dispatch(setUpcomingPartyLoading(false));
      if(response && response.playlists && response.playlists[0] && response.playlists[0].shows) {
        dispatch(setUpcomingPartyData(response.playlists[0].shows));
      }
    } catch (e) {
      dispatch(setUpcomingPartyLoading(false));
    }
  }

  async requestArchivedParty(response, dispatch) {
    if(response && response.playlists && response.playlists[1] && response.playlists[1].shows)
    {
      response.playlists[1].shows.sort(function(a,b){
        return new Date(b.endedAt) - new Date(a.endedAt);
      });
    }
    
    dispatch(setArchivedPartyLoading(true));

    try {
      dispatch(setArchivedPartyLoading(false));
      if(response && response.playlists && response.playlists[1] && response.playlists[1].shows) {
        dispatch(setArchivedPartyData(response.playlists[1].shows));
      }
    } catch (e) {
      dispatch(setArchivedPartyLoading(false));
    }
  }
}
export default new LivePartyDispatcher();
