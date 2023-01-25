import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { getStore } from "Store";
import { HistoryType, LocationType } from "Type/Common";
import { getGenderInArabic } from "Util/API/endpoint/Suggestions/Suggestions.create";
import Algolia from "Util/API/provider/Algolia";
import { isArabic } from "Util/App";
import HeaderSearch from "./HeaderSearch.component";
import Event, {
  EVENT_GTM_CLEAR_SEARCH,
  EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW,
  EVENT_GTM_SEARCH,
  EVENT_GTM_VIEW_SEARCH_RESULTS
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
export const mapStateToProps = (_state) => ({
  // wishlistItems: state.WishlistReducer.productsInWishlist
});
export const mapDispatchToProps = (_dispatch) => ({
  // addProduct: options => CartDispatcher.addProductToCart(dispatch, options)
});

export class HeaderSearchContainer extends PureComponent {
  static propTypes = {
    search: PropTypes.string,
    history: HistoryType.isRequired,
    location: LocationType.isRequired,
  };
  constructor(props) {
    super(props);
    this.headerRef = React.createRef();
  }

  static defaultProps = {
    search: "",
  };

  state = {
    search: "",
  };

  containerFunctions = {
    onSearchChange: this.onSearchChange.bind(this),
    onSearchSubmit: this.onSearchSubmit.bind(this),
    onSearchClean: this.onSearchClean.bind(this),
    hideSearchBar: this.hideSearchBar.bind(this),
  };
  checkForSKU = async (search) => {
    const config = {
      q: search,
      page: 0,
      limit: 2,
    };
    const { data } = await new Algolia().getPLP(config);
    if (data && data.length === 1) {
      return data[0];
    }
    if (data.length === 0) {
      Event.dispatch(EVENT_GTM_NO_RESULT_SEARCH_SCREEN_VIEW, search);
    }
    return null;
  };

  async onSearchSubmit() {
    const { history } = this.props;
    const { search } = this.state;
    var invalid = /[°"§%()*\[\]{}=\\?´`'#<>|,;.:+_-]+/g;
    let finalSearch = search.match(invalid)
      ? encodeURIComponent(search)
      : search;
    const filteredItem = await this.checkForSKU(search);
    if (sessionStorage.hasOwnProperty("Searched_value")) {
      sessionStorage.removeItem("Searched_value");
    }
    if (filteredItem) {
      this.logRecentSearch(search);
      history.push(filteredItem?.url.split(".com")[1]);
    } else {
      const {
        AppState: { gender },
      } = getStore().getState();
      const PRODUCT_RESULT_LIMIT = 8;
      const productData = await new Algolia().searchBy(
        isArabic()
          ? {
              query: search,
              limit: PRODUCT_RESULT_LIMIT,
              gender: getGenderInArabic(gender),
              addAnalytics: true,
            }
          : {
              query: search,
              limit: PRODUCT_RESULT_LIMIT,
              gender: gender,
              addAnalytics: true,
            }
      );
      if (productData?.nbHits !== 0 && productData?.data.length > 0) {
        this.logRecentSearch(search);
        Event.dispatch(EVENT_GTM_SEARCH, search);
        Moengage.track_event(EVENT_GTM_VIEW_SEARCH_RESULTS, {
          country: getCountryFromUrl().toUpperCase(),
          language: getLanguageFromUrl().toUpperCase(),
          search_term: search || "",
          app6thstreet_platform: "Web",
        });
      }

      const queryID = productData?.queryID ? productData?.queryID : null;
      let requestedGender = gender;
      let genderInURL;
      if (isArabic()) {
        if (gender === "kids") {
          genderInURL = "أولاد,بنات";
        } else {
          requestedGender = getGenderInArabic(gender);
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        }
      } else {
        if (gender === "kids") {
          genderInURL = "Boy,Girl";
        } else {
          genderInURL = requestedGender?.replace(
            requestedGender?.charAt(0),
            requestedGender?.charAt(0).toUpperCase()
          );
        }
      }
      if (gender !== "home" && gender !== "all") {
        history.push({
          pathname: `/catalogsearch/result/?q=${finalSearch}&qid=${queryID}&p=0&dFR[gender][0]=${genderInURL}`,
          state: { prevPath: window.location.href },
        });
      } else if (gender === "all") {
        const allGender = isArabic()
          ? "أولاد,بنات,نساء,رجال"
          : "Men,Women,Kids,Boy,Girl";
        history.push({
          pathname: `/catalogsearch/result/?q=${finalSearch}&qid=${queryID}&p=0&dFR[gender][0]=${allGender}`,
          state: { prevPath: window.location.href },
        });
      } else {
        history.push({
          pathname: `/catalogsearch/result/?q=${finalSearch}&qid=${queryID}`,
          state: { prevPath: window.location.href },
        });
      }
    }
  }

  logRecentSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      let recentSearches =
        JSON.parse(localStorage.getItem("recentSearches")) || [];
      let tempRecentSearches = [];
      if (recentSearches) {
        tempRecentSearches = [...recentSearches.reverse()];
      }
      tempRecentSearches = tempRecentSearches.filter(
        (item) =>
          item.name.toUpperCase().trim() !== searchQuery.toUpperCase().trim()
      );
      if (tempRecentSearches.length > 4) {
        tempRecentSearches.shift();
        tempRecentSearches.push({
          name: searchQuery,
        });
      } else {
        tempRecentSearches.push({ name: searchQuery });
      }
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(tempRecentSearches.reverse())
      );
    }
  };

  hideSearchBar() {
    const { hideSearchBar } = this.props;
    if (hideSearchBar) {
      hideSearchBar();
    }
  }

  // componentDidUpdate(prevProps) {
  //   const {
  //     location: { pathname: prevPathname },
  //   } = prevProps;
  //   const { pathname } = location;

  //   // if (pathname !== prevPathname && pathname !== "/catalogsearch/result/") {
  //   //   this.onSearchChange("");
  //   // }
  // }

  containerProps = () => {
    const {
      focusInput,
      renderMySignInPopup,
      isPDP,
      isPDPSearchVisible,
      isPLP,
      handleHomeSearchClick,
    } = this.props;
    const { search } = this.state;

    return {
      search,
      focusInput,
      renderMySignInPopup,
      isPDP,
      isPDPSearchVisible,
      isPLP,
      handleHomeSearchClick,
    };
  };

  onSearchChange(search) {
    this.setState({ search });
    const SearchValue = sessionStorage.getItem("Searched_value");
    const searchedQuery =
      typeof SearchValue == "object"
        ? JSON.stringify(SearchValue)
        : SearchValue;
    if (!SearchValue) {
      sessionStorage.setItem("Searched_value", " ");
    }
    if (search.length > 0 && searchedQuery.length < search.length) {
      sessionStorage.setItem("Searched_value", search);
    }
    if (search?.length === 0) {
      Event.dispatch(EVENT_GTM_CLEAR_SEARCH, SearchValue);
      Moengage.track_event(EVENT_GTM_CLEAR_SEARCH, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        search_term: SearchValue || "",
        app6thstreet_platform: "Web",
      });
      if (sessionStorage.hasOwnProperty("Searched_value")) {
        sessionStorage.removeItem("Searched_value");
      }
    }
  }

  onSearchClean() {
    this.setState({ search: "" });
    this.hideSearchBar();
  }

  render() {
    return (
      <HeaderSearch {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HeaderSearchContainer)
);
