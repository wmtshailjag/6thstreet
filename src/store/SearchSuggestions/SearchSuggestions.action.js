export const SET_SEARCH_SUGGESTIONS = "SET_SEARCH_SUGGESTIONS";
export const SET_ALGOLIA_INDEX = "SET_ALGOLIA_INDEX";

export const setSearchSuggestions = (
  search,
  data,
  queryID,
  querySuggestions
) => ({
  type: SET_SEARCH_SUGGESTIONS,
  search,
  data,
  queryID,
  querySuggestions,
});

export const setAlgoliaIndex = (algoliaIndex) => ({
  type: SET_ALGOLIA_INDEX,
  algoliaIndex
})