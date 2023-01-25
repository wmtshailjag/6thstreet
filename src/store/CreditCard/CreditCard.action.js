export const SET_SAVED_CARDS = 'SET_SAVED_CARDS';
export const SET_NEW_CARD_VISIBLE = 'SET_NEW_CARD_VISIBLE';
export const SET_SAVED_CARDS_LOADING = 'SET_SAVED_CARDS_LOADING';

export const setSavedCards = (savedCards) => ({
    type: SET_SAVED_CARDS,
    savedCards
});

export const setSavedCardsLoading = (loading) => ({
    type: SET_SAVED_CARDS_LOADING,
    loading
})

export const setNewCardVisible = (newCardVisible) => ({
    type: SET_NEW_CARD_VISIBLE,
    newCardVisible
})
