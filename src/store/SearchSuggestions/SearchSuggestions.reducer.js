import {
  SET_SEARCH_SUGGESTIONS,
  SET_ALGOLIA_INDEX,
} from "./SearchSuggestions.action";

export const getInitialState = () => ({
  search: "",
  data: {},
  queryID: "",
  querySuggestions: [],
  algoliaIndex: null,
  gender: "",
  country: "",
});

export const SearchSuggestionsReducer = (state = getInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case SET_SEARCH_SUGGESTIONS:
      const { search, data, queryID, querySuggestions, gender, country } =
        action;
      return {
        ...state,
        search,
        data,
        queryID,
        querySuggestions,
        gender,
        country,
      };
    case SET_ALGOLIA_INDEX:
      const { algoliaIndex } = action;
      return {
        ...state,
        algoliaIndex,
      };

    default:
      return state;
  }
};

export default SearchSuggestionsReducer;
