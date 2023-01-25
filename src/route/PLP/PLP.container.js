import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { setGender } from "Store/AppState/AppState.action";
import { updateMeta } from "Store/Meta/Meta.action";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { setPLPLoading } from "Store/PLP/PLP.action";
import PLPDispatcher from "Store/PLP/PLP.dispatcher";
import { getCountriesForSelect } from "Util/API/endpoint/Config/Config.format";
import {
  Filters,
  Pages,
  RequestedOptions,
} from "Util/API/endpoint/Product/Product.type";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import { capitalize } from "Util/App";
import {
  getBreadcrumbs,
  getBreadcrumbsUrl,
} from "Util/Breadcrumbs/Breadcrubms";
import PLP from "./PLP.component";
import { isArabic } from "Util/App";
import Algolia from "Util/API/provider/Algolia";
import { deepCopy } from "../../../packages/algolia-sdk/app/utils";
import browserHistory from "Util/History";
import VueIntegrationQueries from "Query/vueIntegration.query";
import Event, {
  EVENT_GTM_IMPRESSIONS_PLP,
  VUE_PAGE_VIEW,
  EVENT_MOE_VIEW_PLP_ITEMS,
} from "Util/Event";
import { getUUID } from "Util/Auth";
import BrowserDatabase from "Util/BrowserDatabase";
import {
  updatePLPInitialFilters,
  setPrevProductSku,
  setPrevPath,
  setBrandurl,
} from "Store/PLP/PLP.action";
import isMobile from "Util/Mobile";
import { setLastTapItemOnHome } from "Store/PLP/PLP.action";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { TYPE_CATEGORY } from "Route/UrlRewrites/UrlRewrites.config";
export const BreadcrumbsDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
  gender: state.AppState.gender,
  locale: state.AppState.locale,
  requestedOptions: state.PLP.options,
  isLoading: state.PLP.isLoading,
  pages: state.PLP.pages,
  filters: state.PLP.filters,
  options: state.PLP.options,
  country: state.AppState.country,
  config: state.AppConfig.config,
  menuCategories: state.MenuReducer.categories,
  plpWidgetData: state.PLP.plpWidgetData,
  lastHomeItem: state.PLP.lastHomeItem,
  prevPath: state.PLP.prevPath,
});

export const mapDispatchToProps = (dispatch, state) => ({
  requestProductList: (options) =>
    PLPDispatcher.requestProductList(options, dispatch, state),
  requestProductListPage: (options) =>
    PLPDispatcher.requestProductListPage(options, dispatch),
  setInitialPLPFilter: (initialOptions) =>
    PLPDispatcher.setInitialPLPFilter(initialOptions, dispatch, state),
  setIsLoading: (isLoading) => dispatch(setPLPLoading(isLoading)),
  updateBreadcrumbs: (breadcrumbs) => {
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    );
  },
  updatePLPInitialFilters: (filters, facet_key, facet_value) =>
    dispatch(updatePLPInitialFilters(filters, facet_key, facet_value)),
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  setGender: (gender) => dispatch(setGender(gender)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
  resetPLPData: () => PLPDispatcher.resetPLPData(dispatch),
  setPrevPath: (prevPath) => dispatch(setPrevPath(prevPath)),
  setLastTapItemOnHome: (item) => dispatch(setLastTapItemOnHome(item)),
  setBrandurl: (brand_url) => dispatch(setBrandurl(brand_url)),
});

export class PLPContainer extends PureComponent {
  static propTypes = {
    gender: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    requestProductList: PropTypes.func.isRequired,
    requestProductListPage: PropTypes.func.isRequired,
    setInitialPLPFilter: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    requestedOptions: RequestedOptions.isRequired,
    pages: Pages.isRequired,
    updateBreadcrumbs: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    setGender: PropTypes.func.isRequired,
    filters: Filters.isRequired,
    options: PropTypes.object.isRequired,
    setMeta: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    menuCategories: PropTypes.array.isRequired,
    brandDeascription: PropTypes.string,
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
  };

  static requestProductList = PLPContainer.request.bind({}, false);

  static requestProductListPage = PLPContainer.request.bind({}, true);

  static getRequestOptions() {
    let params;
    if (location.search && location.search.startsWith("?q")) {
      const { params: parsedParams } = WebUrlParser.parsePLP(location.href);
      params = parsedParams;
    } else {
      const { params: parsedParams } = WebUrlParser.parsePLPWithoutQuery(
        location.href
      );
      params = parsedParams;
    }
    return params;
  }

  static async request(isPage, props) {
    const { requestProductList, requestProductListPage } = props;
    const options = PLPContainer.getRequestOptions();
    const requestFunction = isPage
      ? requestProductListPage
      : requestProductList;
    requestFunction({ options });
  }

  state = {
    prevRequestOptions: PLPContainer.getRequestOptions(),
    brandDescription: "",
    brandImg: "",
    brandName: "",
    isArabic: isArabic(),
    prevProductSku: "",
    activeFilters: {},
    categoryloaded: false,
  };

  containerFunctions = {
    handleCallback: this.handleCallback.bind(this),
    handleResetFilter: this.handleResetFilter.bind(this),
    onUnselectAllPress: this.onUnselectAllPress.bind(this),
    updateFiltersState: this.updateFiltersState.bind(this),
    resetPLPData: this.resetPLPData.bind(this),
    compareObjects: this.compareObjects.bind(this),
  };

  resetPLPData() {
    const { resetPLPData } = this.props;
    resetPLPData();
  }

  compareObjects(object1 = {}, object2 = {}) {
    if (Object.keys(object1).length === Object.keys(object2).length) {
      const isEqual = Object.entries(object1).reduce((acc, key) => {
        if (object2[key[0]]) {
          if (JSON.stringify(key[1]) !== JSON.stringify(object2[key[0]])) {
            acc.push(0);
          } else {
            acc.push(1);
          }
        } else {
          acc.push(1);
        }

        return acc;
      }, []);

      return !isEqual.includes(0);
    }

    return false;
  }

  static mapData(data = {}, category, props) {
    const initialOptions = PLPContainer.getRequestOptions();
    let formattedData = data;
    let finalData = [];
    if (category === "categories_without_path") {
      //   let categoryLevelArray = [
      //     "categories.level1",
      //     "categories.level2",
      //     "categories.level3",
      //     "categories.level4",
      //   ];
      //   let categoryLevel;
      //   categoryLevelArray.map((entry, index) => {
      //     if (initialOptions[entry]) {
      //       categoryLevel = initialOptions[entry].split(" /// ")[index + 1];
      //     }
      //   });
      //   if (categoryLevel) {
      //     if (data[categoryLevel]) {
      //       formattedData = data[categoryLevel].subcategories;
      //     } else {
      //       formattedData = data[Object.keys(data)[0]].subcategories;
      //     }
      //   } else {
      let categoryArray = initialOptions["categories_without_path"]
        ? initialOptions["categories_without_path"].split(",")
        : [];
      Object.entries(data).map((entry) => {
        Object.values(entry[1].subcategories).map((subEntry) => {
          if (
            categoryArray.length > 0 &&
            categoryArray.includes(subEntry.facet_value)
          ) {
            finalData.push(subEntry);
          }
        });
      });
      formattedData = finalData;
      //   }
    }

    const mappedData = Object.entries(formattedData).reduce((acc, option) => {
      if (category === "categories_without_path") {
        const { is_selected, facet_value } = option[1];
        if (is_selected) {
          acc.push(facet_value);
        }
        return acc;
      } else {
        const { is_selected } = option[1];
        if (is_selected) {
          acc.push(option[0]);
        }
        return acc;
      }
    }, []);

    return mappedData;
  }
  constructor(props) {
    super(props);
    let prevLocation;
    let finalPrevLocation;
    browserHistory.listen((nextLocation) => {
      let locationArr = ["/men.html", "/women.html", "/kids.html", "/home.html"];
      finalPrevLocation = prevLocation;
      prevLocation = nextLocation;
      const { search } = nextLocation;
      if (
        finalPrevLocation &&
        locationArr.includes(finalPrevLocation.pathname)
      ) {
        if (search.includes("?q=")) {
          const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
          url.searchParams.set("p", 0);
          // update the URL, preserve the state
          const { pathname, search } = url;
          browserHistory.replace(pathname + search);
        }
      }
    });
    if (this.getIsLoading()) {
      // this.props.setInitialPLPFilter({ initialOptions });
      PLPContainer.requestProductList(this.props);
    }
    this.setMetaData();
  }

  getInitialOptions = (options) => {
    const optionArr = ["categories.level1", "page", "q", "visibility_catalog"];
    let initialOptions = {};
    Object.keys(options).map((key) => {
      if (optionArr.includes(key)) {
        initialOptions[key] = options[key];
      }
    });
    return initialOptions;
  };

  sendMOEevents() {
    const { requestedOptions } = this.props;

    const categorylevelPath = requestedOptions["categories.level4"]
      ? requestedOptions["categories.level4"]
      : requestedOptions["categories.level3"]
      ? requestedOptions["categories.level3"]
      : requestedOptions["categories.level2"]
      ? requestedOptions["categories.level2"]
      : requestedOptions["categories.level1"]
      ? requestedOptions["categories.level1"]
      : requestedOptions["categories.level0"]
      ? requestedOptions["categories.level0"]
      : "";
    const Categories_level =
      categorylevelPath && categorylevelPath.includes("///")
        ? categorylevelPath.replaceAll(" ", "").split("///")
        : [categorylevelPath];
    const checkCategories = Categories_level && Categories_level.length > 0;
    let category_1 = checkCategories ? Categories_level.shift() : "";
    let category_2 = checkCategories ? Categories_level.shift() : "";
    let category_3 = checkCategories ? Categories_level.shift() : "";
    let category_4 = checkCategories ? Categories_level.shift() : "";
    Moengage.track_event(EVENT_MOE_VIEW_PLP_ITEMS, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      ...(category_1 && { category_level_1: category_1 }),
      ...(category_2 && { category_level_2: category_2 }),
      ...(category_3 && { category_level_3: category_3 }),
      ...(category_4 && { category_level_4: category_4 }),
      plp_name: category_4
        ? category_4
        : category_3
        ? category_3
        : category_2
        ? category_2
        : category_1
        ? category_1
        : "",
      app6thstreet_platform: "Web",
    });
    this.setState({ categoryloaded: false });
  }
  componentDidMount() {
    const { menuCategories = [], prevPath = null, impressions } = this.props;
    const { isArabic, categoryloaded } = this.state;
    this.setState({ categoryloaded: true });
    this.props.setPrevPath(prevPath);
    const category = this.getCategory();
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_PAGE_VIEW,
      params: {
        event: VUE_PAGE_VIEW,
        pageType: "plp",
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: prevPath,
        url: window.location.href,
      },
    });
    Event.dispatch(EVENT_GTM_IMPRESSIONS_PLP, { impressions, category });

    if (menuCategories.length !== 0) {
      this.updateBreadcrumbs();
      this.setMetaData();
      this.updateHeaderState();
    }
    this.getBrandDetails();
  }

  getCategory() {
    return BrowserDatabase.getItem("CATEGORY_NAME") || "";
  }

  updateInitialFilters = (
    data,
    facet_value,
    newFilterArray,
    categoryLevel1,
    checked,
    facet_key
  ) => {
    if (data[facet_value]) {
      data[facet_value].is_selected = checked;
      if (checked) {
        newFilterArray.selected_filters_count += 1;
      } else {
        newFilterArray.selected_filters_count -= 1;
      }
    } else {
      if (facet_key.includes("size")) {
        let categoryData = data[facet_key];
        if (
          categoryData.subcategories &&
          categoryData.subcategories[facet_value]
        ) {
          categoryData.subcategories[facet_value].is_selected = checked;
          if (checked) {
            categoryData.selected_filters_count += 1;
            newFilterArray.selected_filters_count += 1;
          } else {
            categoryData.selected_filters_count -= 1;
            newFilterArray.selected_filters_count -= 1;
          }
        }
      } else if (categoryLevel1) {
        return Object.entries(data).map((entry) => {
          return Object.entries(entry[1].subcategories).map((subEntry) => {
            if (subEntry[0] === facet_value) {
              subEntry[1].is_selected = checked;
              if (checked) {
                entry[1].selected_filters_count += 1;
                newFilterArray.selected_filters_count += 1;
              } else {
                entry[1].selected_filters_count -= 1;
                newFilterArray.selected_filters_count -= 1;
              }
            }
          });
        });
      } else {
        Object.keys(data).map((value) => {
          if (
            data[value].subcategories &&
            data[value].subcategories[facet_value]
          ) {
            data[value].subcategories[facet_value].is_selected = checked;
            if (checked) {
              data[value].selected_filters_count += 1;
              newFilterArray.selected_filters_count += 1;
            } else {
              data[value].selected_filters_count -= 1;
              newFilterArray.selected_filters_count -= 1;
            }
          }
        });
      }
    }
  };

  updateRadioFilters = (data, facet_value, newFilterArray) => {
    if (data[facet_value]) {
      Object.values(data).map((value) => {
        if (value.facet_value === facet_value) {
          value.is_selected = true;
        } else {
          value.is_selected = false;
        }
      });

      if (newFilterArray.selected_filters_count === 0) {
        newFilterArray.selected_filters_count += 1;
      }
    }
  };

  handleCallback(
    initialFacetKey,
    facet_value,
    checked,
    isRadio,
    isQuickFilters
  ) {
    const { activeFilters } = this.state;
    const { filters, updatePLPInitialFilters, initialOptions } = this.props;
    const filterArray = activeFilters[initialFacetKey];
    let newFilterArray = filters[initialFacetKey];
    if (initialFacetKey.includes("size")) {
      newFilterArray = filters["sizes"];
    }
    let categoryLevel1 =
      PLPContainer.getRequestOptions() && PLPContainer.getRequestOptions().q
        ? PLPContainer.getRequestOptions().q.split(" ")[1]
        : null;
    if (!isRadio) {
      if (checked) {
        if (newFilterArray) {
          const { data = {} } = newFilterArray;
          this.updateInitialFilters(
            data,
            facet_value,
            newFilterArray,
            categoryLevel1,
            true,
            initialFacetKey
          );
          updatePLPInitialFilters(filters, initialFacetKey, facet_value);

          this.setState(
            {
              activeFilters: {
                ...activeFilters,
                [initialFacetKey]: filterArray
                  ? [...filterArray, facet_value]
                  : [facet_value],
              },
            },
            () => this.select(isQuickFilters)
          );
        }
      } else if (filterArray) {
        if (newFilterArray) {
          const { data = {} } = newFilterArray;

          this.updateInitialFilters(
            data,
            facet_value,
            newFilterArray,
            categoryLevel1,
            false,
            initialFacetKey
          );
          updatePLPInitialFilters(filters, initialFacetKey, facet_value);

          const index = filterArray.indexOf(facet_value);
          if (index > -1) {
            filterArray.splice(index, 1);
          }
          this.setState(
            {
              activeFilters: {
                [initialFacetKey]: filterArray,
              },
            },
            () => this.select(isQuickFilters)
          );
        }
      } else {
        if (newFilterArray) {
          const { data = {} } = newFilterArray;

          this.updateInitialFilters(
            data,
            facet_value,
            newFilterArray,
            categoryLevel1,
            false,
            initialFacetKey
          );
          updatePLPInitialFilters(filters, initialFacetKey, facet_value);
          this.setState(
            {
              activeFilters: {
                [initialFacetKey]: [],
              },
            },
            () => this.select(isQuickFilters)
          );
        }
      }
    } else {
      const { data = {} } = newFilterArray;

      if (newFilterArray) {
        this.updateRadioFilters(
          data,
          facet_value,
          newFilterArray,
          categoryLevel1,
          true
        );
        updatePLPInitialFilters(filters, initialFacetKey, facet_value);
        this.setState(
          {
            activeFilters: {
              ...activeFilters,
              [initialFacetKey]: [facet_value],
            },
          },
          () => this.select(isQuickFilters)
        );
      }
    }
  }

  select = (isQuickFilters) => {
    const { activeFilters = {} } = this.state;
    const { query } = this.props;
    if (isMobile.any()) {
      window.scrollTo(0, 0);
    }
    Object.keys(activeFilters).map((key) => {
      if (key !== "categories.level1") {
        if (isQuickFilters) {
          WebUrlParser.setQuickFilterParam(key, activeFilters[key], query);
        } else {
          WebUrlParser.setParam(key, activeFilters[key], query);
        }
      }
    });
  };

  onUnselectAllPress(category) {
    const { filters, updatePLPInitialFilters } = this.props;
    const { activeFilters = {} } = this.state;
    let newFilterArray = filters;
    Object.entries(newFilterArray).map((filter) => {
      if (filter[0] === category && filter[1].selected_filters_count > 0) {
        if (category === "categories_without_path") {
          filter[1].selected_filters_count = 0;
          activeFilters[filter[0]] = [];

          return Object.entries(filter[1].data).map((filterData) => {
            filterData[1].selected_filters_count = 0;
            return Object.entries(filterData[1].subcategories).map((entry) => {
              entry[1].is_selected = false;
            });
          });
        } else {
          if (category === "sizes") {
            Object.entries(filter[1].data).map((entry) => {
              entry[1].selected_filters_count = 0;
              Object.entries(entry[1].subcategories).map((filterData) => {
                if (filterData[1].is_selected) {
                  filterData[1].is_selected = false;
                  activeFilters[entry[0]] = [];
                }
              });
            });
          } else {
            filter[1].selected_filters_count = 0;
            Object.entries(filter[1].data).map((filterData) => {
              if (filterData[1].is_selected) {
                filterData[1].is_selected = false;
                activeFilters[filter[0]] = [];
              }
            });
          }
        }
      } else {
        if (
          filter[0] !== "categories.level1" &&
          filter[1].selected_filters_count > 0
        ) {
          activeFilters[filter[0]] = [];

          if (filter[0] === "categories_without_path") {
            return Object.entries(filter[1].data).map((entry) => {
              return Object.entries(entry[1].subcategories).map((subEntry) => {
                activeFilters[filter[0]].push(subEntry[0]);
              });
            });
          } else {
            Object.entries(filter[1].data).map((filterData) => {
              if (filterData[1].is_selected) {
                activeFilters[filter[0]].push(filterData[0]);
              }
            });
          }
        }
      }
    });
    updatePLPInitialFilters(filters, category, null);

    this.setState({
      activeFilters,
    });

    Object.keys(activeFilters).map((key) => {
      if (key !== "categories.level1") {
        WebUrlParser.setParam(key, activeFilters[key]);
      }
    });
  }

  async getBrandDetails() {
    const exceptionalBrand = ['men','women','kids','home']
    const brandName = location.pathname
      .split(".html")[0]
      .substring(1)
      .split("/")?.[0];
    if(exceptionalBrand.includes(brandName)){
      return null;
    }
    const data = await new Algolia({
      index: "brands_info",
    }).getBrandsDetails({
      query: brandName,
      limit: 1,
    });
    this.setState({
      brandDescription: isArabic()
        ? data?.hits[0]?.description_ar
        : data?.hits[0]?.description,
      brandImg: data?.hits[0]?.image,
      brandName: isArabic() ? data?.hits[0]?.name_ar : data?.hits[0]?.name,
    });
    this.props.setBrandurl(data?.hits[0]?.url_path);
  }

  updateFiltersState(activeFilters) {
    this.setState({ activeFilters });
  }
  handleResetFilter() {
    this.setState({ activeFilters: {} });
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      isLoading,
      setIsLoading,
      menuCategories = [],
      lastHomeItem,
      pages,
    } = this.props;
    const { isLoading: isCategoriesLoading } = this.state;
    const currentIsLoading = this.getIsLoading();
    const requestOptions = PLPContainer.getRequestOptions();
    const { page } = requestOptions;
    const {
      prevRequestOptions: { page: prevPage },
    } = this.state;
    // update loading from here, validate for last
    // options recieved results from
    if (
      isLoading !== currentIsLoading ||
      isCategoriesLoading !== currentIsLoading
    ) {
      // setIsLoading(currentIsLoading);
    }
    if (menuCategories.length !== 0) {
      this.updateBreadcrumbs();
      this.setMetaData();
      this.updateHeaderState();
    }

    let comparableRequestOptions = deepCopy(requestOptions);
    if (comparableRequestOptions) {
      delete comparableRequestOptions.page;
    }
    let comparablePrevRequestOptions = deepCopy(this.state.prevRequestOptions);
    if (comparablePrevRequestOptions) {
      delete comparablePrevRequestOptions.page;
    }

    if (
      (page === prevPage &&
        !this.compareObjects(
          comparableRequestOptions,
          comparablePrevRequestOptions
        )) ||
      (page !== prevPage &&
        !this.compareObjects(
          comparableRequestOptions,
          comparablePrevRequestOptions
        ))
    ) {
      PLPContainer.requestProductList(this.props);
      this.setState({ prevRequestOptions: requestOptions });
    } else if (page !== prevPage && !pages[page]) {
      // if only page has changed, and it is not yet loaded => request that page
      PLPContainer.requestProductListPage(this.props);
      this.setState({ prevRequestOptions: requestOptions });
    }

    if (!this.compareObjects(prevProps.filters, this.props.filters)) {
      const newActiveFilters = Object.entries(this.props.filters).reduce(
        (acc, filter) => {
          if (filter[1]) {
            const { selected_filters_count, data = {} } = filter[1];

            if (selected_filters_count !== 0) {
              if (filter[0] === "sizes") {
                const mappedData = Object.entries(data).reduce((acc, size) => {
                  const { subcategories } = size[1];
                  const mappedSizeData = PLPContainer.mapData(
                    subcategories,
                    filter[0],
                    this.props
                  );

                  acc = { ...acc, [size[0]]: mappedSizeData };

                  return acc;
                }, []);

                acc = { ...acc, ...mappedData };
              } else {
                acc = {
                  ...acc,
                  [filter[0]]: PLPContainer.mapData(
                    data,
                    filter[0],
                    this.props
                  ),
                };
              }
            }

            return acc;
          }
        },
        {}
      );
      this.setState({
        activeFilters: newActiveFilters,
      });
    }
    let element = document.getElementById(lastHomeItem);
    if (element) {
      // window.focus();
      element.style.scrollMarginTop = "180px";
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  capitalizeFirstLetter(string = "") {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  updateHeaderState() {
    const { changeHeaderState } = this.props;

    changeHeaderState({
      name: DEFAULT_STATE_NAME,
      isHiddenOnMobile: true,
    });
  }

  updateBreadcrumbs() {
    const {
      options: { q: query },
      options,
      menuCategories,
    } = this.props;
    const {isArabic} = this.state
    if (query) {
      const { updateBreadcrumbs, setGender } = this.props;
      const breadcrumbLevels = options["categories.level4"]
        ? options["categories.level4"]
        : options["categories.level3"]
        ? options["categories.level3"]
        : options["categories.level2"]
        ? options["categories.level2"]
        : options["categories.level1"]
        ? options["categories.level1"]
        : options["q"];

      if (breadcrumbLevels) {
        const levelArray = breadcrumbLevels.split(" /// ") || [];
        const urlArray = getBreadcrumbsUrl(levelArray, menuCategories) || [];
        if (urlArray.length === 0) {
          levelArray.map(() => urlArray.push("/"));
        }
        const breadcrumbsMapped =
          getBreadcrumbs(levelArray, setGender, urlArray, isArabic) || [];
        const productListBreadcrumbs = breadcrumbsMapped.reduce((acc, item) => {
          acc.unshift(item);

          return acc;
        }, []);

        updateBreadcrumbs(productListBreadcrumbs);
      } else {
        const breadcrumbs = [
          {
            url: "/",
            name: options["categories.level0"],
          },
        ];

        updateBreadcrumbs(breadcrumbs);
      }
    }
  }

  setMetaData() {
    const {
      setMeta,
      country,
      config,
      requestedOptions: { q } = {},
      gender,
    } = this.props;
    const { brandDescription, brandName } = this.state;
    if (!q) {
      return;
    }

    const pagePathName = new URL(window.location.href).pathname;
    const checkBrandPage = pagePathName.includes(".html")
      ? pagePathName.split(".html").join("").split("/")
      : "";
    const genderName = capitalize(gender);
    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};
    const breadcrumbs = location.pathname
      .split(".html")[0]
      .substring(1)
      .split("/");
    const categoryName = capitalize(breadcrumbs.pop() || "");

    const PLPMetaTitle =
      brandName && checkBrandPage.length < 3
        ? __(
            "Shop %s Online | Buy Latest Collections on 6thStreet %s",
            brandName,
            countryName
          )
        : __("%s | 6thStreet.com %s", categoryName, countryName);

    const PLPMetaDesc =
      brandName && checkBrandPage.length < 3
        ? __(
            "Buy %s products with best deals on 6thStreet %s. Find latest %s collections and trending products with ✅ Free Delivery on minimum order & ✅ 100 days Free Return.",
            brandName,
            countryName,
            brandName
          )
        : __(
            "Shop %s Online in %s | Free shipping and returns | 6thStreet.com %s",
            categoryName,
            countryName,
            countryName
          );

    setMeta({
      title: PLPMetaTitle,
      keywords: __(
        "%s, online shopping, %s, free shipping, returns",
        categoryName,
        countryName
      ),
      description: PLPMetaDesc,
      twitter_title: PLPMetaTitle,
      twitter_desc: PLPMetaDesc,
      og_title: PLPMetaTitle,
      og_desc: PLPMetaDesc,
    });
  }

  getIsLoading() {
    const { requestedOptions } = this.props;

    const options = PLPContainer.getRequestOptions();
    const {
      // eslint-disable-next-line no-unused-vars
      page: requestedPage,
      ...requestedRestOptions
    } = requestedOptions;

    const {
      // eslint-disable-next-line no-unused-vars
      page,
      ...restOptions
    } = options;

    // If requested options are not matching requested options -> we are loading
    // we also ignore pages, this is handled by PLPPages
    return JSON.stringify(requestedRestOptions) !== JSON.stringify(restOptions);
  }
  setLastTapItem = (item) => {
    this.props.setLastTapItemOnHome(item);
  };

  containerProps = () => {
    const { query, plpWidgetData, gender, filters, pages, isLoading } =
      this.props;
    const { brandImg, brandName, brandDescription, activeFilters } = this.state;
    // isDisabled: this._getIsDisabled()

    return {
      brandDescription,
      brandImg,
      brandName,
      query,
      plpWidgetData,
      gender,
      filters,
      pages,
      activeFilters,
      isLoading,
    };
  };

  render() {
    const { requestedOptions, filters } = this.props;
    const { categoryloaded } = this.state;
    const categorylevelPath = requestedOptions["categories.level4"]
      ? requestedOptions["categories.level4"]
      : requestedOptions["categories.level3"]
      ? requestedOptions["categories.level3"]
      : requestedOptions["categories.level2"]
      ? requestedOptions["categories.level2"]
      : requestedOptions["categories.level1"]
      ? requestedOptions["categories.level1"]
      : requestedOptions["categories.level0"]
      ? requestedOptions["categories.level0"]
      : "";
    localStorage.setItem("CATEGORY_NAME", JSON.stringify(requestedOptions.q));
    localStorage.setItem("CATEGORY_CURRENT", JSON.stringify(categorylevelPath));
    if (this.getIsLoading() == false && categoryloaded == true) {
      this.sendMOEevents();
    }

    return (
      <PLP
        {...this.containerFunctions}
        {...this.containerProps()}
        setLastTapItem={this.setLastTapItem}
      />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PLPContainer)
);
