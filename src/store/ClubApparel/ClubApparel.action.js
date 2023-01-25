export const SET_CLUB_APPAREL = 'SET_CLUB_APPAREL';
export const SET_CLUB_APPAREL_STATE = 'UPDATE_CLUB_APPAREL_STATE';
export const SET_IS_CLUB_APPAREL_LOADING = 'SET_IS_CLUB_APPAREL_LOADING';

export const setClubApparel = (clubApparel) => ({
    type: SET_CLUB_APPAREL,
    clubApparel
});

export const updateClubApparelState = (applied) => ({
    type: SET_CLUB_APPAREL_STATE,
    applied
});

export const setIsLoading = (isLoading) => ({
    type: SET_IS_CLUB_APPAREL_LOADING,
    isLoading
});
