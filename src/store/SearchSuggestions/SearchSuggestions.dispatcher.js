import { getStore } from "Store";
import {
  setSearchSuggestions,
  setAlgoliaIndex,
} from "Store/SearchSuggestions/SearchSuggestions.action";
import {
  getCustomQuerySuggestions,
  getAlgoliaIndexForQuerySuggestion,
} from "Util/API/endpoint/Suggestions/Suggestions.create";
import { formatProductSuggestions } from "Util/API/endpoint/Suggestions/Suggestions.format";
import Algolia from "Util/API/provider/Algolia";
import {
  getGenderInArabic,
  getGenderParam,
} from "Util/API/endpoint/Suggestions/Suggestions.create";
import { isArabic } from "Util/App";
import { getLocaleFromUrl } from "Util/Url/Url";
const PRODUCT_RESULT_LIMIT = 8;
const QUERY_SUGGESTION_LIMIT = 5;

export class SearchSuggestionsDispatcher {
  async requestSearchSuggestions(search, sourceIndexName, dispatch) {
    const {
      AppState: { gender, country },
    } = getStore().getState();
    let queryID = null;

    // var searchQuery = search;
    // This if condition implements PWA 2423 for Bahrain, Oman & Qatar
    // if(searchQuery.match(new RegExp(gender, "i")) === null && country.match(/bh|om|qa/i)) {
    //   searchQuery = `${search} ${isArabic() ? getGenderInArabic(gender) : gender} `;
    // }

    try {
      const countryCodeFromUrl = getLocaleFromUrl();
      const lang = isArabic() ? "arabic" : "english";
      const algoliaQueryIndex = getAlgoliaIndexForQuerySuggestion(
        countryCodeFromUrl,
        lang
      );
      let searchData = [];
      let filterArray = [];
      let paramsForProductSearch = {
        q: search,
        page: 0,
        limit: PRODUCT_RESULT_LIMIT,
      };
      let paramsForQuerySuggestion = {
        indexName: `${algoliaQueryIndex}_query_suggestions`,
        params: {
          query: search,
          hitsPerPage: QUERY_SUGGESTION_LIMIT,
          clickAnalytics: true,
        },
      };
      if (gender !== "all" && gender !== "home") {
        let genderParams = getGenderParam(
          gender,
          false
        );
        // need to pass multiple facet filters like this
        // "stage_magento_english_products.facets.exact_matches.gender.value:Girl", into an array.
        genderParams.split(",").map((item) => filterArray.push(`${algoliaQueryIndex}.facets.exact_matches.gender.value:${item}`))
        searchData = await new Algolia().getProductForSearchContainer(
          { ...paramsForProductSearch, gender: getGenderParam(gender, true) },
          {
            ...paramsForQuerySuggestion,
            params: {
              ...paramsForQuerySuggestion.params,
              facetFilters: [
                [...filterArray],
              ],
            },
          }
        );
      } else {
        searchData = await new Algolia().getProductForSearchContainer(
          { ...paramsForProductSearch },
          { ...paramsForQuerySuggestion }
        );
      }
      let { productData, suggestionData } = searchData;

      // if you need search analytics then uncomment it (default automatically tracks it) UPDATE: causing wrong data.

      // var data = localStorage.getItem("customer");
      // let userData = JSON.parse(data);
      // let userToken;
      //   if (userData?.data?.id) {
      //   userToken = userData.data.id;
      // }
      // const objectIDs = productData.data.map(item => item.objectID);
      // await new Algolia().logAlgoliaAnalytics(
      //   'view',
      //   VIEW_SEARCH_RESULTS_ALGOLIA,
      //   {
      //     search_item: search,
      //     items: productData.data,
      //     list: "Search Results",
      //   },
      //   { objectIDs, queryID: productData.queryID,userToken: userToken ? `user-${userToken}`: getUUIDToken(),  },
      //   );

      // const { hits: categorySuggestions } = await new Algolia({
      //     index: `enterprise_magento_${ lang }_categories`
      // }).getSuggestions({
      //     query: search,
      //     limit: CATEGORY_RESULT_LIMIT
      // });

      // const { hits: productSuggestions } = await new Algolia({
      //     index: `enterprise_magento_${ lang }_products`
      // }).getSuggestions({
      //     query: search,
      //     limit: PRODUCT_RESULT_LIMIT
      // });

      // In case anyone needs desktop data (use this!)
      // const lang = language === 'en' ? 'english' : 'arabic';

      const defaultHit = {
        query: search,
        label: search,
        count: "",
      };
      var querySuggestions = [defaultHit];
      querySuggestions =
        suggestionData?.hits?.length > 0
          ? getCustomQuerySuggestions(
              suggestionData?.hits,
              sourceIndexName,
              suggestionData?.query
            )
          : [defaultHit];

      if (suggestionData && suggestionData.queryID) {
        queryID = suggestionData.queryID;
      } else {
        queryID = productData?.queryID ? productData?.queryID : null;
      }
      const results = formatProductSuggestions(productData);
      dispatch(
        setSearchSuggestions(search, results, queryID, querySuggestions)
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setSearchSuggestions(search));
    }
  }

  async requestAlgoliaIndex(dispatch) {
    const algoliaIndex = await new Algolia().getIndex();
    dispatch(setAlgoliaIndex(algoliaIndex));
  }
}

export default new SearchSuggestionsDispatcher();
