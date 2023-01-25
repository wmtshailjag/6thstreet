import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { setPrevPath } from "Store/PLP/PLP.action";
import SearchSuggestionDispatcher from "Store/SearchSuggestions/SearchSuggestions.dispatcher";
import { getStaticFile } from "Util/API/endpoint/StaticFiles/StaticFiles.endpoint";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";
import Algolia from "Util/API/provider/Algolia";
import { getUUIDToken } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import browserHistory from "Util/History";
import { getLocaleFromUrl } from "Util/Url/Url";
import VueQuery from "../../query/Vue.query";
import CDN from "../../util/API/provider/CDN";
import SearchSuggestion from "./SearchSuggestion.component";
import { TRENDING_BRANDS_ENG, TRENDING_BRANDS_AR } from "../../util/Common/index";
import { isArabic } from "Util/App";


export const mapStateToProps = (state) => ({
  requestedSearch: state.SearchSuggestions.search,
  data: state.SearchSuggestions.data,
  gender: state.AppState.gender,
  queryID: state.SearchSuggestions.queryID,
  querySuggestions: state.SearchSuggestions.querySuggestions,
  prevPath: state.PLP.prevPath,
  algoliaIndex: state.SearchSuggestions.algoliaIndex,
  suggestionEnabled: state.AppConfig.suggestionEnabled,
  // wishlistData: state.WishlistReducer.items,
});

export const mapDispatchToProps = (dispatch) => ({
  requestSearchSuggestions: (search) => {
    SearchSuggestionDispatcher.requestSearchSuggestions(
      search,
      sourceIndexName,
      dispatch
    );
  },
  setPrevPath: (prevPath) => dispatch(setPrevPath(prevPath)),
});
let sourceIndexName;
export class SearchSuggestionContainer extends PureComponent {
  static propTypes = {
    requestSearchSuggestions: PropTypes.func.isRequired,
    requestedSearch: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    data: PropTypes.shape({
      brands: PropTypes.array,
      products: PropTypes.array,
    }).isRequired,
    closeSearch: PropTypes.func.isRequired,
    queryID: PropTypes.string,
    querySuggestions: PropTypes.array,
    algoliaIndex: PropTypes.object.isRequired,
    // wishlistData: WishlistItems.isRequired,
  };

  static getDerivedStateFromProps(props, state) {
    const { search } = props;
    const { prevSearch } = state;

    if (search !== prevSearch) {
      return { prevSearch: search };
    }

    return null;
  }

  static requestSearchSuggestions(props) {
    const { search, requestSearchSuggestions } = props;

    if (!search || search.length <= 2) {
      return;
    }

    requestSearchSuggestions(search);
  }

  constructor(props) {
    super(props);

    this.state = {
      prevSearch: props.search,
      trendingBrands: [],
      trendingTags: [],
      topSearches: [],
      recentSearches: [],
      recommendedForYou: [],
      trendingProducts: [],
      exploreMoreData: null,
      typingTimeout: 0,
      isArabic: isArabic(),
    };

    // TODO: please render this component only once. Otherwise it is x3 times the request

    this.requestSearchSuggestions(props);
    this.requestTrendingInformation();
    // this.requestTopSearches();
    this.requestRecentSearches();
  }

  async getPdpSearchWidgetData() {
    const { gender } = this.props;
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const query = {
      filters: [],
      num_results: 10,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };

    const payload = VueQuery.buildQuery("vue_browsing_history_slider", query, {
      gender,
    });
    fetchVueData(payload)
      .then((resp) => {
        this.setState({
          recommendedForYou: resp.data,
        });
      })
      .catch((err) => {
        console.error("fetchVueData error", err);
      });
  }

  getTrendingProducts() {
    const { gender } = this.props;
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const query = {
      filters: [],
      num_results: 10,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };

    const payload = VueQuery.buildQuery("vue_trending_slider", query, {
      gender,
    });
    fetchVueData(payload)
      .then((resp) => {
        this.setState({
          trendingProducts: resp.data,
        });
      })
      .catch((err) => {
        console.error("fetchVueData error", err);
      });
  }

  requestSearchSuggestions(props) {
    const { search, requestSearchSuggestions } = props;
    if (!search || search.length <= 2) {
      return;
    }
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }
    this.setState({
      typingTimeout: setTimeout(() => {
        requestSearchSuggestions(search);
      }, [300]),
    });
  }

  componentDidMount() {
    const { gender, algoliaIndex } = this.props;
    sourceIndexName = algoliaIndex?.indexName;

    if (gender !== "home") {
      this.getPdpSearchWidgetData();
    }
    // this.getTrendingProducts();
    this.requestJsonInfo();
    document.body.classList.add("isSuggestionOpen");
    const { location } = browserHistory;
    const { closeSearch } = this.props;
    browserHistory.push(`${location.pathname}${location.search}`);
    window.onpopstate = () => {
      closeSearch();
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props?.search !== this.props.prevSearch &&
      prevProps?.search !== this.props?.search
    ) {
      this.requestSearchSuggestions(this.props);
    }
  }

  componentWillUnmount() {
    document.body.classList.remove("isSuggestionOpen");
  }

  requestJsonInfo = async () =>{
    const { gender } = this.props;
    const locale = getLocaleFromUrl();
    let url = `resources/20191010_staging/${locale}/search/search_${gender}.json`;
    if(process.env.REACT_APP_FOR_JSON === "production") {
      url = `resources/20190121/${locale}/search/search_${gender}.json`;
    }
    
    try {
      const resp = await CDN.get(url);

      if (resp) {
        this.getExploreMoreData(resp);
        this.getTrendingBrands(resp);
      }
    } catch (error) {
      console.error(error);
    }
  }


  getExploreMoreData = async (resp) => {

      if (resp && resp.widgets) {
        let k = resp.widgets;
        let itemYouWant = null;
        k.forEach((item) => {
          if (item.header) {
            if (item.header.title === "Explore More") {
              itemYouWant = item;
            }
          }
        });

        this.setState({
          exploreMoreData: itemYouWant,
        });
      }
  };

  getTrendingBrands = async (resp) => {
    const { isArabic } = this.state;

      if (resp && resp.widgets) {
        let k = resp.widgets;
        let filterString = isArabic ? TRENDING_BRANDS_AR : TRENDING_BRANDS_ENG;
        let trendingBrandsList = k.find((item) => item?.layout?.title === filterString)?.items || [];
        this.setState({
          trendingBrands: trendingBrandsList,
        });
      }
    
  };

  async requestTrendingInformation() {
    const { gender } = this.props;

    try {
      const data = await Promise.all([
        // getStaticFile("search_trending_brands"),
        getStaticFile("search_trending_tags"),
        // getStaticFile("search_trending_products"),
      ]);
      this.setState({
        // trendingBrands: data[0][gender],
        trendingTags: data[0][gender],
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /*async requestTopSearches() {
    const topSearches = await new Algolia().getTopSearches();
    let refinedTopSearches = [];
    let searchItem = [];
    await Promise.all(
      topSearches?.data
        ?.filter((ele) => ele !== "")
        .map(async (item) => {
          searchItem.push(item.search);
        })
    );
    if (topSearches?.data) {
      refinedTopSearches = await this.checkForSearchSKU(
        searchItem,
        topSearches.data
      );
    }

    this.setState({
      topSearches: refinedTopSearches || [],
    });
  } */

  async requestRecentSearches() {
    let recentSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    let refinedRecentSearches = [];
    let searchItem = [];
    if (recentSearches.length > 0) {
      await Promise.all(
        recentSearches?.map(async (item) => {
          searchItem.push(item.name);
        })
      );
    }
    if (recentSearches.length > 0) {
      refinedRecentSearches = await this.checkForSearchSKU(
        searchItem,
        recentSearches
      );
    }
    this.setState({
      recentSearches: refinedRecentSearches || [],
    });
  }

  checkForSearchSKU = async (searchArr, searchList) => {
    const { data } = await new Algolia().getSearchPLP(searchArr);
    let refinedSearches = [];
    if (data && data.length > 0) {
      data.map((subData, index) => {
        if (subData && subData.hits.length === 1) {
          refinedSearches.push({
            link: subData.hits[0].url,
            ...searchList[index],
          });
        } else {
          refinedSearches.push({ link: null, ...searchList[index] });
        }
      });
    }
    return refinedSearches;
  };

  containerProps = () => {
    const {
      trendingBrands,
      trendingTags,
      topSearches,
      recentSearches,
      recommendedForYou,
      trendingProducts,
      exploreMoreData,
    } = this.state;
    const {
      search,
      data,
      closeSearch,
      queryID,
      querySuggestions,
      renderMySignInPopup,
      // wishlistData,
      isPDPSearchVisible,
      prevPath,
      suggestionEnabled,
    } = this.props;
    const isEmpty = search === "";
    const inNothingFound = data?.brands?.length + data?.products?.length === 0;
    return {
      searchString: search,
      brands: data?.brands || [],
      products: data?.products || [],
      inNothingFound,
      isEmpty,
      isActive: true, // TODO: implement
      isLoading: this.getIsLoading(),
      trendingBrands,
      trendingTags,
      closeSearch,
      queryID,
      querySuggestions,
      topSearches,
      recentSearches,
      recommendedForYou,
      trendingProducts,
      renderMySignInPopup,
      isPDPSearchVisible,
      prevPath,
      exploreMoreData,
      suggestionEnabled,
      // wishlistData,
    };
  };
  containerFunctions = {
    hideActiveOverlay: this.props.hideActiveOverlay,
    setPrevPath: this.props.setPrevPath,
  };

  getIsLoading() {
    const { requestedSearch, search } = this.props;

    if (!search) {
      return false;
    }

    return requestedSearch !== search;
  }

  render() {
    return (
      <SearchSuggestion
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchSuggestionContainer);
