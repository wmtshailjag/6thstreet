import PLPPage from "Component/PLPPage";
import PLPPagePlaceholder from "Component/PLPPagePlaceholder";
import PropTypes from "prop-types";
import { PureComponent, Fragment } from "react";
import { Products } from "Util/API/endpoint/Product/Product.type";
import "./PLPPages.style";
import { Close } from "Component/Icons";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import isMobile from "Util/Mobile";
import ProductLoad from "Component/PLPLoadMore";
import { v4 } from "uuid";
import { withRouter } from "react-router";
import browserHistory from "Util/History";
import { isArabic } from "Util/App";
import { deepCopy } from "../../../packages/algolia-sdk/app/utils";
import PLPQuickFilter from "Component/PLPQuickFilter";
import Field from "Component/Field";

class PLPPages extends PureComponent {
  static propTypes = {
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        products: Products,
        isPlaceholder: PropTypes.bool,
      })
    ).isRequired,
    impressions: Products,
  };
  static defaultProps = {
    impressions: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      showSortDropdown: false,
      activeFilter: undefined,
      activeFilters: {},
      isReset: false,
      defaultFilters: false,
      pageKey: 0,
      firstPageLoad: false,
      pageScrollHeight: 0,
      activeSliderImage: 0,
      defaultSizeCode: "size_eu",
      prevProductSku: "",
      loadedLastProduct: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.setState({ firstPageLoad: true });
    let prevLocation;
    let finalPrevLocation;
    let initialPrevProductSku;
    browserHistory.listen((nextLocation) => {
      let locationArr = ["/men.html", "/women.html", "/kids.html", "/home.html"];
      finalPrevLocation = prevLocation;
      prevLocation = nextLocation;
      const { search } = nextLocation;
      if (
        finalPrevLocation &&
        !locationArr.includes(finalPrevLocation.pathname) &&
        finalPrevLocation.state &&
        finalPrevLocation.state.product
      ) {
        const {
          state: {
            product: { sku },
          },
        } = finalPrevLocation;
        initialPrevProductSku = sku;
        this.setState({ prevProductSku: sku });
        this.props.setPrevProductSku(sku);
      } else if (
        finalPrevLocation &&
        locationArr.includes(finalPrevLocation.pathname)
      ) {
        window.scrollTo(0, 0);
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeFilters, prevProductSku } = this.props;
    const {
      activeFilters: prevActiveFilters,
      prevProductSku: initialPrevProductSku,
    } = prevProps;

    if (activeFilters !== prevActiveFilters) {
      this.setState({
        activeFilters: activeFilters,
      });
    }
    if (
      this.props.pages.length > 0 &&
      this.props.pages.length > prevProps.pages.length &&
      (prevState.pageKey !== "0" || prevState.pageKey !== 0)
    ) {
      if (!isMobile.any() && !this.state.firstPageLoad) {
        const last =
          document.getElementById("Products-Lists")?.lastElementChild;
        last.style.scrollMarginTop = "180px";
        last.scrollIntoView({ behavior: "smooth" });
      }
      if (this.state.firstPageLoad) {
        this.setState({ firstPageLoad: false });
      }
    }

    if (prevProductSku) {
      let element = document.getElementById(prevProductSku);
      if (element && !this.state.loadedLastProduct) {
        var headerOffset = isMobile.any() ? 120 : 200;
        var elementPosition = element.getBoundingClientRect().top;
        var offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        if (isMobile.any() && element) {
          element.parentElement.style.scrollMarginTop = "0px";
        }

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        this.setState({ loadedLastProduct: true });
      }
    }
  }

  updateFilters = (...arg) => {
    const valueArr = [arg[1]];
    WebUrlParser.setQuickFilterParam(arg[0], valueArr);
  };

  handleSizeClick = (event) => {
    const {
      target: { value },
    } = event;
    this.setState({
      defaultSizeCode: value,
    });
  };

  renderCommonQuickFilter = (key, filter) => {
    const { defaultSizeCode } = this.state;
    return (
      <PLPQuickFilter
        key={key}
        selectedSizeCode={defaultSizeCode}
        filter={filter}
        updateFilters={this.updateFilters}
        onClick={this.updateFilters}
        parentCallback={this.updateFilters}
      />
    );
  };

  getInlineFilterList = (filters) => {
    const brandsCategoryName = "brand_name";
    const stockName = "in_stock";
    const categoryLevelName = "categories.level1";
    const genderName = "gender";
    const CategoryName = "categories_without_path";
    const removedFilter = [
      brandsCategoryName,
      categoryLevelName,
      genderName,
      CategoryName,
      stockName,
    ];
    const sizeOptions = ['size_eu','size_uk','size_us']
    const options = this.getRequestOptions()
    let updatedFilter = deepCopy(filters);
    removedFilter.map((key) => {
      delete updatedFilter[key];
    });
    Object.keys(filters).map((key)=>{
      if(Object.keys(options).includes(key)){
        delete updatedFilter[key];
      }else{
        sizeOptions.map((size)=>{
          if(Object.keys(options).includes(size)){
            delete updatedFilter['sizes']
          }
        })
      }
    })
    updatedFilter = {stock:"stock",...updatedFilter}
    return updatedFilter;
  };

  shouldRenderQuickFilter = (filters, index) => {
    const { pages = {} } = this.props;
    const inlineFilterList = this.getInlineFilterList(filters);
    const keyLabel = {
      discount: __("Discount"),
      colorfamily: __("Colours"),
      sizes: __("Sizes"),
      sort: __("Sort by"),
      age: __("Age"),
    };
    const requiredPages =
      pages && pages.length > 0 && pages[0].products.length > 9;
    const filterIndex = index === 0 || !requiredPages ? null : index;
    const shouldRender =
      isMobile.any() &&
      filterIndex !== null &&
      index < Object.keys(filters).length &&
      Object.values(inlineFilterList)[filterIndex];
    const filterKey = Object.keys(inlineFilterList)[filterIndex];
    const finalFilterKey =
      filterKey && filterKey.includes("price")
        ? __("Price Range")
        : keyLabel[filterKey];
    return { shouldRender, filterIndex, inlineFilterList, finalFilterKey };
  };

  inSearch = () => {
    const { pathname } = window.location;

    return pathname === "/catalogsearch/result/";
  };

  handleChange = (activeImage) => {
    this.setState({ activeSliderImage: activeImage });
  };

  renderSizeQuickFilter = () => {
    const { defaultSizeCode, activeSliderImage } = this.state;
    const sizeData = ["size_eu", "size_uk", "size_us"];
    const sizeLabel = {
      size_uk: __("Size UK"),
      size_eu: __("Size EU"),
      size_us: __("Size US"),
    };
    return (
      <div block="FieldMultiselect">
        <fieldset block="PLPQuickFilter" mods={{ inSearch: this.inSearch() }}>
          <div
            mix={{ block: "QuickFilters", elem: "MobileSlider" }}
            activeImage={activeSliderImage}
            onActiveImageChange={this.handleChange}
          >
            <div block="QuickFilter" elem="List">
              {sizeData.map((facet_value, index) => {
                return (
                  <li
                    block="PLPFilterOption"
                    elem="List"
                    mix={{
                      block: "PLPFilterOption-List",
                      elem:
                        facet_value === defaultSizeCode ? "SelectedList" : "",
                    }}
                    mods={{ isArabic: isArabic() }}
                    key={index}
                  >
                    <Field
                      onClick={this.handleSizeClick}
                      mix={{
                        block: "PLPFilterOption",
                        elem: "Input",
                      }}
                      type={"checkbox"}
                      id={facet_value}
                      name={facet_value}
                      value={facet_value}
                      checked={facet_value === defaultSizeCode}
                    />
                    <label block="PLPFilterOption" htmlFor={facet_value}>
                      {sizeLabel[facet_value]}
                    </label>
                  </li>
                );
              })}
            </div>
          </div>
        </fieldset>
      </div>
    );
  };

  renderQuickFilter = (filterIndex, inlineFilterList, label) => {
    return (
      <div
        block="InlineFilterContainer"
        mix={{
          block: "InlineFilterContainer",
          elem: (label === "Sizes" || label === "الأحجام") ? "InlineSizeCont" : "",
        }}
      >
        <div block="InlineFilter">
          <p mix={{ block: "InlineFilter", elem: "FilterLabel" }}>
            {__("What %s are you looking for ?", label)}
          </p>
          <li
            block="ProductItem"
            id={filterIndex}
            mix={{ block: "ProductItem", elem: "FilterBar" }}
          >
            <div
              block="PLPFilters"
              elem="QuickCategories"
              mods={{ isArabic: isArabic() }}
            >
              {this.renderCommonQuickFilter(
                filterIndex,
                Object.values(inlineFilterList)[filterIndex]
              )}
            </div>
          </li>
          {(label === "Sizes" || label === "الأحجام") && (
            <li
              block="ProductItem"
              id={filterIndex}
              mix={{ block: "ProductItem", elem: "SizeFilterBar",mods:{isArabic:isArabic()} }}
            >
              <div
                block="PLPFilters"
                elem="QuickCategories"
                mods={{ isArabic: isArabic() }}
              >
                {this.renderSizeQuickFilter()}
              </div>
            </li>
          )}
        </div>
      </div>
    );
  };

  renderPage = ([key, page]) => {
    const { products, isPlaceholder, isFirst = false } = page;
    this.setState({
      pageKey: key,
    });
    const { impressions, query, renderMySignInPopup, filters, productLoading } =
      this.props;
    const { shouldRender, filterIndex, inlineFilterList, finalFilterKey } =
      this.shouldRenderQuickFilter(filters, parseInt(key));
    if (isMobile.any() && isPlaceholder) {
      return (
        <Fragment key={key}>
          {shouldRender &&
            this.renderQuickFilter(
              filterIndex,
              inlineFilterList,
              finalFilterKey
            )}
          <PLPPagePlaceholder
            isFirst={isFirst}
            key={v4()}
            pageIndex={key}
            query={query}
          />
        </Fragment>
      );
    }
    return (
      <Fragment key={key}>
        {shouldRender &&
          this.renderQuickFilter(filterIndex, inlineFilterList, finalFilterKey)}
        <PLPPage
          key={v4()}
          products={products}
          handleCallback={this.handleCallback}
          impressions={impressions}
          renderMySignInPopup={renderMySignInPopup}
          filters={filters}
        />
      </Fragment>
    );
  };

  renderPlaceHolder() {
    const { query } = this.props;
    return (
      <PLPPagePlaceholder
        isFirst={true}
        key={v4()}
        pageIndex={1}
        query={query}
      />
    );
  }

  renderPages() {
    const { pages = {}, productLoading } = this.props;
    if (pages && pages.length === 0 && productLoading) {
      const placeholderConfig = [
        {
          isPlaceholder: true,
          products: [],
          isFirst: true,
        },
      ];
      return Object.entries(placeholderConfig).map(this.renderPage);
    }
    return Object.entries(pages).map(this.renderPage);
  }

  OnDeselectFilter = (val, values) => {
    const { facet_key, facet_value } = val;
    const { is_radio } = values;
    this.handleCallback(facet_key, facet_value, false, is_radio, false);
  };

  renderSelectedFilters() {
    const selectedFilters = this.props.filters;
    const thisRef = this;
    if (selectedFilters) {
      return (
        <ul>
          {Object.values(selectedFilters).map(function (values, index) {
            if (values && values.data) {
              return Object.values(values.data).map(function (value, index) {
                if (value.subcategories) {
                  return Object.values(value.subcategories).map(function (
                    val,
                    index
                  ) {
                    if (val.is_selected === true) {
                      return (
                        <li key={v4()}>
                          {thisRef.renderButtonView(val.label, () =>
                            thisRef.OnDeselectFilter(val, values)
                          )}
                        </li>
                      );
                    }
                  });
                } else if (values) {
                  if (
                    value.is_selected === true &&
                    value.facet_key !== "categories.level1"
                  ) {
                    return (
                      <li key={v4()}>
                        {thisRef.renderButtonView(value.label, () =>
                          thisRef.OnDeselectFilter(value, values)
                        )}
                      </li>
                    );
                  }
                }
              });
            }
          })}
        </ul>
      );
    }
  }

  toggleSortDropdown = () => {
    this.setState({ showSortDropdown: !this.state.showSortDropdown });
  };

  renderSortBy() {
    const {
      filters: { sort: data },
    } = this.props;
    const { data: sortData } = data;
    return (
      <div block="sort-box">
        <ul>
          {Object.values(sortData).map((value, index) => {
            return <li key={index}>{value.label}</li>;
          })}
        </ul>
      </div>
    );
  }

  renderButtonView(label, onClick) {
    return (
      <button
        onClick={onClick}
        aria-label="Dismiss"
        tabIndex={0}
        block="PLPPageFilter"
      >
        {label}
        <Close />
      </button>
    );
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
          value.is_selected = false;
        }
      });

      if (newFilterArray.selected_filters_count === 1) {
        newFilterArray.selected_filters_count = 0;
      }
    }
  };

  getRequestOptions = () => {
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
  };

  handleCallback = (
    initialFacetKey,
    facet_value,
    checked,
    isRadio,
    isQuickFilters = false
  ) => {
    const { activeFilters } = this.state;
    const { filters, updatePLPInitialFilters, initialOptions } = this.props;
    const filterArray = activeFilters[initialFacetKey];
    let newFilterArray = filters[initialFacetKey];
    if (initialFacetKey.includes("size")) {
      newFilterArray = filters["sizes"];
    }
    let categoryLevel1 =
      this.getRequestOptions() && this.getRequestOptions().q
        ? this.getRequestOptions().q.split(" ")[1]
        : null;

    if (!isRadio) {
      if (filterArray) {
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
                ...activeFilters,
                [initialFacetKey]: filterArray,
              },
            },
            () => this.select()
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
                ...activeFilters,
                [initialFacetKey]: [],
              },
            },
            () => this.select()
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
              [initialFacetKey]: [],
            },
          },
          () => this.select()
        );
      }
    }
  };

  select = (isQuickFilters) => {
    const { activeFilters = {} } = this.state;
    const { query, updateFiltersState } = this.props;
    const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
    if (isMobile.any()) {
      window.scrollTo(0, 0);
    }
    if (!isMobile.any() || isQuickFilters) {
      updateFiltersState(activeFilters);
      Object.keys(activeFilters).map((key) => {
        if (key !== "categories.level1")
          WebUrlParser.setParam(key, activeFilters[key], query);
      });
    }
  };

  renderLoadMore() {
    const { pages = {} } = this.props;
    if (pages[0]?.products.length == 0) {
      return null;
    }
    return (
      <ProductLoad
        pageKey={this.state.pageKey}
        productLoad={this.props.productLoading}
      />
    );
  }

  render() {
    const { pages = {}, productLoading } = this.props;
    return (
      <div block="PLPPagesContainer">
        <div block="PLPPages Products-Lists" id="Products-Lists">
          {!isMobile.any() && !(pages[0]?.products.length === 0) && (
            <div block="ProductToolBar">
              <div block="ProductSelectedFilters">
                {this.renderSelectedFilters()}
              </div>
            </div>
          )}

          {this.renderPages()}
          {productLoading && !isMobile.any() && this.renderPlaceHolder()}
        </div>
        {!isMobile.any() && this.renderLoadMore()}
      </div>
    );
  }
}

export default withRouter(PLPPages);