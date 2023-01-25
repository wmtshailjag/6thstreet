/**
 * @category sixth-street
 * @author Vladislavs Belavskis <info@scandiweb.com>
 * @license http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */
import Image from "Component/Image";

import PLPFilter from "Component/PLPFilter";
import PLPQuickFilter from "Component/PLPQuickFilter";
import Popup from "Component/Popup";
import PropTypes from "prop-types";
import { PureComponent, createRef } from "react";
import { Filters } from "Util/API/endpoint/Product/Product.type";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import fitlerImage from "./icons/filter-button.png";
import { SIZES } from "./PLPFilters.config";
import Refine from "../Icons/Refine/icon.png";
import Arrow from "./icons/long-arrow-left.svg"
import "./PLPFilters.style";
import FieldMultiselect from "Component/FieldMultiselect";
import { RequestedOptions } from "Util/API/endpoint/Product/Product.type";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { PLPContainer } from "Route/PLP/PLP.container";
import { getCurrencyCode } from "../../../packages/algolia-sdk/app/utils";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { EVENT_MOE_PLP_SHOW_FILTER_RESULTS_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

export const mapStateToProps = (state) => ({
  requestedOptions: state.PLP.options,
});

class PLPFilters extends PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    filters: Filters.isRequired,
    activeOverlay: PropTypes.string.isRequired,
    showOverlay: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    goToPreviousNavigationState: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    productsCount: PropTypes.number,
    activeFilters: PropTypes.object.isRequired,
    requestedOptions: RequestedOptions.isRequired,
  };

  static defaultProps = {
    productsCount: 0,
  };
  filterDropdownRef = createRef();

  filterButtonRef = createRef();

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      activeFilter: undefined,
      isArabic: isArabic(),
      activeFilters: {},
      isReset: false,
      toggleOptionsList: false,
      defaultFilters: false,
      fixFilter: false,
      fixWindow: false,
      showArrow: false
    };

    this.timer = null;
  }

  static getDerivedStateFromProps(props, state) {
    const { activeOverlay, filters = {}, activeFilters } = props;
    const { activeFilter } = state;

    if (!activeOverlay) {
      document.body.style.overflow = "visible";
    }

    if (isMobile.any()) {
      if (!activeFilter) {
        return {
          isOpen: activeOverlay === "PLPFilter",
          activeFilter: Object.keys(filters)[0],
          activeFilters: activeFilters,
        };
      }
    }
    return {
      isOpen: activeOverlay === "PLPFilter",
    };
  }



  componentDidMount() {
    if (!isMobile.any()) {
      window.addEventListener("scroll", this.handleGoToTop);
      window.addEventListener("mousewheel", this.handleScroll);
    }

  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleGoToTop);
    window.removeEventListener('mousewheel', this.handleScroll);
  }

  handleGoToTop = () => {
    if (window.pageYOffset > 885) {
      if (!this.state.showArrow) {
        this.setState({
          showArrow: true
        })
      }
    }
    if (window.pageYOffset < 885) {
      if (this.state.showArrow) {
        this.setState({
          showArrow: false
        })
      }
    }
  }


  scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFixWindow = (e) => {
    let myDiv = document.getElementById("productFilterScroll")
    let n = myDiv.scrollHeight - myDiv.offsetHeight
    myDiv.scrollBy(
      {
        top: n,
        left: 0,
        behavior: 'instant'
      }
    )
  }

  onNotFixWindow = () => {
    let myDiv = document.getElementById("productFilterScroll")
    let n = myDiv.scrollHeight - myDiv.offsetHeight
    myDiv.scrollBy(
      {
        top: -n,
        left: 0,
        behavior: 'instant'
      }
    )
  }


  handleScroll = (e) => {
    let k = document.getElementById("plp-main-scroll-id")
    if (k) {
      if ((k.offsetHeight - (document.body.offsetHeight - 155) + 50) < window.pageYOffset) {
        if (!this.state.fixWindow) {
          this.setState({
            fixWindow: true
          })
          this.onFixWindow(e)
        }


      }
      if ((k.offsetHeight - (document.body.offsetHeight - 155) + 50) > window.pageYOffset) {
        if (this.state.fixWindow) {

          this.setState({
            fixWindow: false
          })
          this.onNotFixWindow(e)
        }

      }

      if (window.pageYOffset > 95) {
        if (!this.state.fixFilter) {
          this.setState({
            fixFilter: true
          })
        }
      }
      else {
        if (this.state.fixFilter) {

          this.setState({
            fixFilter: false
          })
        }
      }
    }
  }

  setDefaultFilters = () => {
    this.setState({ defaultFilters: true });
  };

  changeActiveFilter = (newFilter) => {
    this.setState({ activeFilter: newFilter });
  };

  handleFilterClick = () => {
    const { isOpen } = this.state;
    const { showOverlay } = this.props;

    showOverlay("PLPFilter");
    this.setState({ isOpen: !isOpen });
  };

  renderFilters() {
    const { filters = {} } = this.props;
    const { isPLPSortBy } = this.props;
    return Object.entries(filters).map((filter, index) => {

      if (isPLPSortBy) {
        if (filter[1]) {
          if ((filter[0] === "sort" && !isMobile.any())) {
            return this.renderSortBy([filter[0], filter[1]], index);
          }
          else {
            return
          }
        }
      }

      if (filter[1]) {
        if (filter[0] === "sort" && !isMobile.any()) {
          return
        }
        if (isMobile.any()) {

          return this.renderFilterOption([filter[0], filter[1]]);
        } else {
          return this.renderFilter([filter[0], filter[1]]);
        }
      }
    });
  }

  renderFilter = ([key, filter]) => {
    const { activeFilter, isReset, defaultFilters } = this.state;
    const {
      initialOptions,
      handleCallback,
      onUnselectAllPress,
      isChecked,
      activeFilters,
      filters,
    } = this.props;
    if (Object.keys(filter.data).length === 0 || key === "categories.level1") {
      return null;
    }

    const { label, category, is_radio } = filter;

    let placeholder =
      category === "in_stock"
        ? __("BY STOCK")
        : category === "age"
          ? __("BY AGE")
          : label;
    return (
      <FieldMultiselect
        key={key}
        placeholder={placeholder}
        showCheckbox
        isRadio={is_radio}
        filter={filter}
        filters={filters}
        initialOptions={initialOptions}
        activeFilter={activeFilter}
        isChecked={isChecked}
        onUnselectAllPress={onUnselectAllPress}
        parentActiveFilters={activeFilters}
        currentActiveFilter={activeFilter}
        changeActiveFilter={this.changeActiveFilter}
        parentCallback={handleCallback}
        updateFilters={this.updateFilters}
        setDefaultFilters={this.setDefaultFilters}
        defaultFilters={defaultFilters}
        isSortBy={false}
      />
    );
  };

  renderQuickFilters() {
    const { filters = {} } = this.props;

    return Object.entries(filters).map(this.renderQuickFilter.bind(this));
  }

  hidePopUp = () => {
    const { hideActiveOverlay, goToPreviousNavigationState, activeOverlay } =
      this.props;

    if (activeOverlay === "PLPFilter") {
      hideActiveOverlay();
      goToPreviousNavigationState();
    }
  };

  resetFilters = () => {
    const {
      hideActiveOverlay,
      goToPreviousNavigationState,
      onReset,
      activeOverlay,
      updatePLPInitialFilters,
      initialFilters,
      filters,
    } = this.props;

    clearTimeout(this.timer);

    if (activeOverlay === "PLPFilter") {
      hideActiveOverlay();
      goToPreviousNavigationState();
    }
    updatePLPInitialFilters(filters, null, null);
    this.setState({ isReset: true, defaultFilters: false });

    onReset();
  };

  onClearFilterState = (initialFacetKey) => {
    const { activeFilters } = this.state;
    const filterArray = activeFilters[initialFacetKey];
    const index = filterArray.indexOf(facet_value);
    if (index > -1) {
      filterArray.splice(index, 1);
    }
    this.setState({
      activeFilters: {
        [initialFacetKey]: filterArray,
      },
    });
  };
  getPageType() {
    const { urlRewrite, currentRouteName } = window;

    if (currentRouteName === "url-rewrite") {
      if (typeof urlRewrite === "undefined") {
        return "";
      }

      if (urlRewrite.notFound) {
        return "notfound";
      }

      return (urlRewrite.type || "").toLowerCase();
    }

    return (currentRouteName || "").toLowerCase();
  }

  onShowResultButton = () => {
    const { activeFilters = {} } = this.state;
    const { query } = this.props;
    
    Moengage.track_event(EVENT_MOE_PLP_SHOW_FILTER_RESULTS_CLICK, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      screen_name: this.getPageType() || "",
      app6thstreet_platform: "Web",
    });
    Object.keys(activeFilters).map((key) =>
      WebUrlParser.setParam(key, activeFilters[key], query)
    );
    this.hidePopUp();
  };

  updateFilters = () => {
    const { activeFilters = {} } = this.state;
    const { query } = this.props;
    Object.keys(activeFilters).map((key) =>
      WebUrlParser.setParam(key, activeFilters[key], query)
    );
  };

  updateQuickFilters = () => {
    const { activeFilters = {} } = this.state;
    const { query } = this.props;
    Object.keys(activeFilters).map((key) =>
      WebUrlParser.setParam(key, activeFilters[key], query)
    );
  }

  renderSeeResultButton() {
    const { productsCount } = this.props;
    const { isArabic } = this.state;

    const count = ` ( ${productsCount} )`;
    return (
      <button
        block="Content"
        elem="SeeResult"
        mods={{ isArabic }}
        onClick={this.onShowResultButton}
      >
        {__("show result")}
        {count}
      </button>
    );
  }

  onClose = () => {
    const { activeFilters } = this.props;
    this.hidePopUp();
    this.setState({ activeFilters });
  };

  renderCloseButton() {
    const { isArabic } = this.state;

    return (
      <button
        block="FilterPopup"
        elem="CloseBtn"
        mods={{ isArabic }}
        aria-label={__("Close")}
        onClick={this.onClose}
      />
    );
  }

  renderResetFilterButton() {
    const { isArabic } = this.state;

    const isClear = this.getFilterCount() > 0;

    return isClear || isMobile.any() ? (
      <button
        block="FilterPopup"
        elem="Reset"
        type="button"
        mods={{ isArabic }}
        aria-label={__("Reset")}
        onClick={this.resetFilters}
      >
        {!isMobile.any() ? __("Clear all") : __("Clear")}
      </button>
    ) : null;
  }

  renderContent() {
    const { isArabic } = this.state;
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const [lang, country] = locale.split("-");
    const currency = getCurrencyCode(country);
    const priceAttribute = `price.${currency}.default`;

    const {
      filters: {
        categories_without_path: { selected_filters_count },
        [priceAttribute]: { selected_filters_count: priceCount },
      },
    } = this.props;
    let CategorySelected =
      selected_filters_count > 0 || priceCount > 0 ? true : false;
    return (
      <div block="Content" elem="Filters" mods={{ isArabic, CategorySelected }}>
        {this.renderFilters()}
        {this.renderDropDownList()}
      </div>
    );
  }

  renderFilterButton() {
    return (
      <button
        onClick={this.handleFilterClick}
        onKeyDown={this.handleFilterClick}
        aria-label="Dismiss"
        tabIndex={0}
        block="PLPFilterMobile"
      >
        <Image lazyLoad={true} src={fitlerImage} alt="filter-button-icon" />

        {__("refine ")}
        <div block="PLPFilterMobile" elem="Count">
          {this.renderFiltersCount()}
        </div>
      </button>
    );
  }

  renderFiltersCount() {
    const displayCount = this.getFilterCount();
    if (displayCount < 0) {
      return "(0)";
    }

    return `(${displayCount})`;
  }

  getActiveFilter = () => {
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
                [filter[0]]: PLPContainer.mapData(data, filter[0], this.props),
              };
            }
          }

          return acc;
        }
      },
      {}
    );
    return newActiveFilters;
  };

  getFilterCount() {
    // const { activeFilters = {} } = this.props;
    let activeFilters = this.getActiveFilter();
    let { count } = activeFilters
      ? Object.entries(activeFilters).reduce(
        (prev, [_key, value]) => ({
          count: prev.count + value.length,
        }),
        { count: 0 }
      )
      : { count: 0 };
    Object.keys(activeFilters).length > 0 &&
      Object.keys(activeFilters).map((key) => {
        if (key === "categories.level1") {
          count = count - 1;
        }
      });
    const displayCount = count;
    return displayCount;
  }

  renderRefine() {
    const { isArabic } = this.state;

    return (
      <div block="PLPFilters" elem="Refine" mods={{ isArabic }}>
        {__("refine")}
      </div>
    );
  }

  renderPopupFilters() {
    const { isArabic } = this.state;

    document.body.style.overflow = "hidden";
    return (
      <Popup
        clickOutside={false}
        mix={{
          block: "FilterPopup",
          mods: {
            isArabic,
          },
        }}
        id="PLPFilter"
        title="Filters"
      >
        <div block="FilterPopup" elem="Title" mods={{ isArabic }}>
          {this.renderCloseButton()}
          {this.renderRefine()}
          {this.renderResetFilterButton()}
        </div>
        {this.renderContent()}
        {this.renderSeeResultButton()}
      </Popup>
    );
  }

  renderDropDownList() {
    const { filters } = this.props;
    const { activeFilter, defaultFilters } = this.state;
    return Object.entries(filters).map((filter) => {
      if (activeFilter === filter[0]) {
        const {
          isChecked,
          initialOptions,
          handleCallback,
          activeFilters,
          onUnselectAllPress,
        } = this.props;
        const { label, category, is_radio } = filter[1];

        let placeholder =
          category === "in_stock"
            ? __("BY STOCK")
            : category === "age"
              ? __("BY AGE")
              : label;

        return (
          <FieldMultiselect
            key={filter[0]}
            placeholder={placeholder}
            showCheckbox
            isRadio={is_radio}
            filter={filter[1]}
            filters={filters}
            initialOptions={initialOptions}
            activeFilter={activeFilter}
            isChecked={isChecked}
            onUnselectAllPress={onUnselectAllPress}
            parentActiveFilters={activeFilters}
            currentActiveFilter={activeFilter}
            changeActiveFilter={this.changeActiveFilter}
            parentCallback={handleCallback}
            updateFilters={this.updateFilters}
            setDefaultFilters={this.setDefaultFilters}
            defaultFilters={defaultFilters}
            isSortBy={false}
          />
        );
      }
    });
  }

  handleFilterChange = (filter) => {
    this.changeActiveFilter(filter.category || filter.facet_key);
  };

  renderFilterOption([key, filter]) {
    const { activeFilter } = this.state;
    const { filters } = this.props;
    const { label, category, selected_filters_count } = filter;
    if (Object.keys(filter.data).length === 0 || key === "categories.level1") {
      return null;
    }

    let placeholder =
      category === "in_stock"
        ? __("BY STOCK")
        : category === "age"
          ? __("BY AGE")
          : label;
    let toggleOptionsList = activeFilter === category;
    let selectedItems = true;

    return (
      <div
        ref={this.filterDropdownRef}
        block="FieldMultiselect"
      // mods={{ isHidden }}
      >
        <button
          ref={this.filterButtonRef}
          type="button"
          block="FieldMultiselect"
          elem="FilterButton"
          mods={{ toggleOptionsList, selectedItems }}
          mix={{
            block: "FieldMultiselect",
            elem: "FilterButton",
            mods: { isArabic },
          }}
          onClick={() => this.handleFilterChange(filter)}
        >
          {placeholder}{" "}
          {selected_filters_count > 0 &&
            isMobile.any() &&
            `(${selected_filters_count})`}
        </button>
      </div>

    );
  }

  renderSortBy = ([key, filter], index) => {
    const { activeFilter, isReset, activeFilters, defaultFilters, isArabic } =
      this.state;
    const { handleCallback, filters } = this.props;
    return (
      <div block="SortBy" key={index} mods={{ isArabic }}>
        <PLPFilter
          key={key}
          filter={filter}
          parentCallback={handleCallback}
          currentActiveFilter={activeFilter}
          changeActiveFilter={this.changeActiveFilter}
          isReset={isReset}
          filters={filters}
          resetParentState={this.resetParentState}
          parentActiveFilters={activeFilters}
          updateFilters={this.updateFilters}
          setDefaultFilters={this.setDefaultFilters}
          defaultFilters={defaultFilters}
          isSortBy={true}
        />
        <img src={Refine} alt={"Refine-icon"}/>
      </div>
    );
  };

  resetParentState = () => {
    this.setState({ isReset: false });
  };

  renderQuickFilter = ([key, filter]) => {
    const genders = [__("women"), __("men"), __("kids")];
    const brandsCategoryName = "brand_name";
    const CategoryName = "categories_without_path";
    const pathname = location.pathname.split("/");
    const isBrandsFilterRequired = genders.includes(pathname[1]);
    const { handleCallback } = this.props;
    if (isBrandsFilterRequired) {
      if (filter.category === brandsCategoryName) {
        return (
          <PLPQuickFilter
            key={key}
            brandFilter={true}
            filter={filter}
            updateFilters={this.updateQuickFilters}
            onClick={this.updateQuickFilters}
            parentCallback={handleCallback}
          />
        );
      }
    } else if (filter.category === CategoryName) {
      return (
        <PLPQuickFilter
          key={key}
          filter={filter}
          brandFilter={true}
          updateFilters={this.updateQuickFilters}
          onClick={this.updateQuickFilters}
          parentCallback={handleCallback}
        />
      );
    }

    return null;
  };

  renderCatPath = () => {
    const { requestedOptions } = this.props;
    const breadcrumbs = location.pathname
      .split(".html")[0]
      .substring(1)
      .split("/");
    const plpTitle = breadcrumbs.pop() || "";
    const checkString = (str) => {
      const regularTitle = {
        containString: /-/,
      };
      const expMatch = {};
      expMatch.containString = regularTitle.containString.test(str);
      return expMatch;
    };

    const removeChar = (str) => {
      const titleSplit = str.split("-");
      const titleJoin = titleSplit.join(" ");
      return titleJoin;
    };
    const capitalizeSentence = (str) => {
      var splitStr = str.split(" ");
      for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] =
          splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
      }
      return splitStr.join(" ");
    };
    const validateCategoryName = () => {
      if (checkString(plpTitle).containString == 1) {
        const catTitleTemp = removeChar(plpTitle);
        return capitalizeSentence(catTitleTemp);
      } else {
        return capitalizeSentence(plpTitle);
      }
    };
    const pageTitle = validateCategoryName();
    if (requestedOptions.hasOwnProperty("categories.level4") == 1) {
      return requestedOptions["categories.level4"];
    } else if (requestedOptions.hasOwnProperty("categories.level3") == 1) {
      return requestedOptions["categories.level3"];
    } else if (requestedOptions.hasOwnProperty("categories.level2") == 1) {
      return requestedOptions["categories.level2"];
    } else if (requestedOptions.hasOwnProperty("categories.level1") == 1) {
      return requestedOptions["categories.level1"];
    } else if (requestedOptions.hasOwnProperty("categories.level0") == 1) {
      return requestedOptions["categories.level0"];
    } else if (pageTitle) {
      return pageTitle;
    } else {
      return "";
    }
  };

  render() {
    const { productsCount, filters } = this.props;
    const { isOpen, isArabic } = this.state;
    const count = productsCount ? productsCount.toLocaleString() : null;
    const category_title = this.renderCatPath().split("///").pop();
    return (
      <div block="Products" elem="Filter">
        <div id="productFilterScroll" block="Products" elem={this.state.fixFilter ? "FixScroll" : "Scroll"}>
          <div block="PLPFilters" elem="ProductsCount" mods={{ isArabic }}>
            <span>{count}</span>
            {count ? __("Results for ") : null}
            {count && !category_title ? (
              "Available Products"
            ) : (
                <h1 className="categoryTitle">{__(category_title)}</h1>
              )}
          </div>
          {!isMobile.any() && (
            <div block="FilterHeader">
              <h2>{__("Filters")}</h2>
              <div
                block="PLPFilters"
                elem="Reset"
                mix={{
                  block: "Reset",
                  mods: {
                    isArabic,
                  },
                }}
              >
                {this.renderResetFilterButton()}
              </div>
            </div>
          )}

          {isOpen && isMobile.any()
            ? this.renderPopupFilters()
            : this.renderFilterButton()}
          {!isMobile.any() && (
            <form block="PLPFilters" name="filters">
              {this.renderFilters()}
            </form>
          )}
          {isMobile.any() && (
            <div block="PLPFilters" elem="ToolBar" mods={{ isArabic }}>
              <div block="PLPFilters" elem="QuickCategories" mods={{ isArabic }}>
                {this.renderQuickFilters()}
              </div>
              <div block="PLPFilters" elem="ProductsCount" mods={{ isArabic }}>
                <span>{count}</span>
                {count ? __("Results for ") : null}
                {count && !category_title ? (
                  "Available Products"
                ) : (
                    <h1 className="categoryTitle">{__(category_title)}</h1>
                  )}
              </div>
            </div>
          )}
        </div>
        {this.state.showArrow && <div block="Products" elem="UpArrow" ><img block="Products" elem="UpArrow-img" src={Arrow} alt="UpArrowImage" onClick={this.scrollToTop} /></div>}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, null)(PLPFilters));
