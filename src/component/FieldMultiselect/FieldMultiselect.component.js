/* eslint-disable react/jsx-no-bind */
import PLPFilterOption from "Component/PLPFilterOption";
import PropTypes from "prop-types";
import { createRef, PureComponent, Fragment } from "react";
import { Filter } from "Util/API/endpoint/Product/Product.type";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import "./FieldMultiselect.style";
import Image from "Component/Image";
import selectedImage from "./icons/select.png";
import selectImage from "./icons/add.png";
import searchPng from "../HeaderSearch/icons/search.svg";
import Field from "Component/Field";
import { v4 } from "uuid";
import SelectImage from "./icons/selectMob.png";
import { getCurrencyCode } from "../../../packages/algolia-sdk/app/utils";
import VueIntegrationQueries from "Query/vueIntegration.query";
import Event,{
  EVENT_MOE_PLP_FILTER,
  EVENT_BRAND_SEARCH_FILTER,
  EVENT_COLOR_SEARCH_FILTER,
  EVENT_SIZES_SEARCH_FILTER,
  EVENT_CATEGORIES_WITHOUT_PATH_SEARCH_FILTER,
  EVENT_DISCOUNT_FILTER_CLICK,
  EVENT_BRAND_SEARCH_FOCUS,
  EVENT_COLOR_SEARCH_FOCUS,
  EVENT_SIZES_SEARCH_FOCUS,
  EVENT_CATEGORIES_WITHOUT_PATH_SEARCH_FOCUS,
  EVENT_SET_PREFERENCES_GENDER,
  EVENT_GTM_FILTER
} from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class FieldMultiselect extends PureComponent {
  static propTypes = {
    filter: Filter.isRequired,
    placeholder: PropTypes.string,
    activeFilter: PropTypes.object,
    isChecked: PropTypes.bool,
    changeActiveFilter: PropTypes.func,
    currentActiveFilter: PropTypes.string,
    isHidden: PropTypes.bool,
    defaultFilters: PropTypes.bool,
    parentCallback: PropTypes.func,
    setDefaultFilters: PropTypes.func,
    updateFilters: PropTypes.func,
  };

  static defaultProps = {
    placeholder: "",
    activeFilter: {},
    isChecked: false,
    currentActiveFilter: "",
    isHidden: false,
    defaultFilters: false,
    parentCallback: () => {},
    changeActiveFilter: () => {},
    updateFilters: () => {},
    setDefaultFilters: () => {},
  };

  filterDropdownRef = createRef();

  filterButtonRef = createRef();

  allFieldRef = createRef();

  allOptionRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      toggleOptionsList: false,
      isArabic: isArabic(),
      subcategoryOptions: {},
      parentActiveFilters: null,
      currentActiveFilter: null,
      searchList: {},
      searchKey: "",
      searchFacetKey: "",
      sizeDropDownList: {},
      sizeDropDownKey: "",
      showMore: false,
      showLess: false,
    };
    this.toggelOptionList = this.toggelOptionList.bind(this);
    this.handleFilterSearch = this.handleFilterSearch.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (isMobile.any()) {
      const {
        currentActiveFilter,
        filter: { category, selected_filters_count },
      } = props;
      return {
        toggleOptionsList: currentActiveFilter === category,
      };
    }

    return null;
  }

  componentDidMount() {
    const {
      filter: { selected_filters_count },
    } = this.props;
    if (selected_filters_count > 6) {
      this.setState({ showMore: true, showLess: false });
    } else {
      this.setState({ showMore: false, showLess: false });
    }
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      filter: { selected_filters_count, category },
      parentActiveFilters,
    } = this.props;
    if (parentActiveFilters) {
      if (
        JSON.stringify(prevProps.parentActiveFilters) !==
          JSON.stringify(parentActiveFilters) ||
        (parentActiveFilters[category] &&
          parentActiveFilters[category].length === 0)
      ) {
        if (selected_filters_count > 6) {
          this.setState({
            showMore: true,
            showLess: false,
          });
        } else {
          this.setState({
            showMore: false,
            showLess: false,
          });
        }
      }
    }
  }

  handleClickOutside = (event) => {
    const { toggleOptionsList } = this.state;

    if (toggleOptionsList) {
      if (
        this.filterDropdownRef &&
        !this.filterDropdownRef.current.contains(event.target)
      ) {
        // this.onBlur();
      }
    }
  };

  renderSubcategoryOptions = (option = {}, display) => {
    const { isArabic } = this.state;
    const { subcategories = {} } = option;

    return (
      <div
        block="FieldMultiselect"
        elem="MobileOptionList"
        mods={{ isArabic }}
        style={{ display }}
      >
        {Object.entries(subcategories).map(this.renderOption)}
      </div>
    );
  };

  handleSubcategoryClick = (option) => {
    const { subcategoryOptions } = this.state;
    // const subcategoryOptionsValues = this.renderSubcategoryOptions(option);

    if (
      !subcategoryOptions[option.label] ||
      subcategoryOptions[option.label] === undefined
    ) {
      this.setState({
        subcategoryOptions: {
          ...subcategoryOptions,
          [option.label]: true,
        },
      });
    } else {
      this.setState({
        subcategoryOptions: {
          ...subcategoryOptions,
          [option.label]: false,
        },
      });
    }
  };

  renderOptionMobile = (option) => {
    const { subcategoryOptions, isArabic } = this.state;
    const { selected_filters_count } = option;
    const isClosed =
      !subcategoryOptions[option.label] ||
      subcategoryOptions[option.label] === undefined;
    const display = isClosed ? "none" : "block";

    return (
      <div block="FieldMultiselect" elem="MobileOptions" key={v4()}>
        <button
          block="FieldMultiselect"
          elem="MobileOptionButton"
          mods={{
            isClosed,
          }}
          mix={{
            block: "FieldMultiselect",
            elem: "MobileOptionButton",
            mods: { isArabic },
          }}
          onClick={() => this.handleSubcategoryClick(option)}
        >
          {option.label}
          {selected_filters_count > 0 && (
            <img src={SelectImage} alt="select icon" className="selectIcon" />
          )}
        </button>
        {this.renderSubcategoryOptions(option, display)}
      </div>
    );
  };

  renderOption = ([key, option = {}]) => {
    const {
      filter: { is_radio, data },
      activeFilter,
      isChecked,
      parentCallback,
      updateFilters,
      setDefaultFilters,
      defaultFilters,
      parentActiveFilters,
      currentActiveFilter,
    } = this.props;

    const { subcategories = {} } = option;

    if (Object.keys(subcategories).length !== 0) {
      return !isMobile.any()
        ? Object.entries(subcategories).map(this.renderOption)
        : this.renderOptionMobile(option);
    }

    return (
      <PLPFilterOption
        key={v4()}
        option={option}
        isRadio={is_radio}
        activeFilter={activeFilter}
        currentActiveFilter={currentActiveFilter}
        isChecked={isChecked}
        parentActiveFilters={parentActiveFilters}
        parentCallback={parentCallback}
        updateFilters={updateFilters}
        setDefaultFilters={setDefaultFilters}
        defaultFilters={defaultFilters}
      />
    );
  };

  handleSizeSelection = (e) => {
    e.preventDefault();
    const { parentCallback } = this.props;
    const { id: facet_key } = e.target;
    const facet_value = e.target.getAttribute("name");
    const checked = e.target.getAttribute("value") === "false" ? true : false;
    if (!isMobile.any() && checked) {
      Moengage.track_event(EVENT_MOE_PLP_FILTER, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        filter_type: facet_key || "",
        filter_value: facet_value || "",
        app6thstreet_platform: "Web",
      });
      if (facet_key == ("size_eu" || "size_us" || "size_uk")) {
        Moengage.track_event(EVENT_SIZES_SEARCH_FILTER, {
          country: getCountryFromUrl().toUpperCase(),
          language: getLanguageFromUrl().toUpperCase(),
          app6thstreet_platform: "Web",
        });
        const EventData = { name:EVENT_SIZES_SEARCH_FILTER, value: facet_value}
        Event.dispatch(EVENT_GTM_FILTER, EventData);
      }
    }

    parentCallback(facet_key, facet_value, checked, false);
  };

  renderSizeOption = ([key, option = {}]) => {
    const { subcategories = {} } = option;
    const thisRef = this;
    if (key === this.state.sizeDropDownKey) {
      return Object.values(subcategories).map(function (value, index) {
        const { facet_key, facet_value } = value;
        return (
          <div
            block="FieldMultiselect"
            elem="sizesOption"
            mods={{ selectedSize: value.is_selected }}
            key={v4()}
            id={facet_key}
            name={facet_value}
            value={value.is_selected}
            onClick={(e) => thisRef.handleSizeSelection(e)}
          >
            <div
              block="sizesLabel"
              id={facet_key}
              name={facet_value}
              value={value.is_selected}
            >
              {value.label}
            </div>
            {!value.is_selected ? (
              <img
                src={selectImage}
                alt={"fitler"}
                id={facet_key}
                name={facet_value}
                value={value.is_selected}
              />
            ) : (
              <img
                src={selectedImage}
                alt={"fitler"}
                id={facet_key}
                name={facet_value}
                value={value.is_selected}
              />
            )}
          </div>
        );
      });
    }
  };

  renderUnselectButton(category) {
    let UnSelectAll = true;
    return (
      <div
        block="FieldMultiselect"
        elem="SizeSelector"
        mods={{ UnSelectAll }}
        onClick={() => this.onDeselectAllCategory(category)}
      >
        Unselect All
      </div>
    );
  }

  onDeselectAllCategory = (category) => {
    const { onUnselectAllPress } = this.props;
    const MoeFilterEvent =
      category == "brand_name"
        ? EVENT_BRAND_SEARCH_FILTER
        : category == "colorfamily"
        ? EVENT_COLOR_SEARCH_FILTER
        : category == "sizes"
        ? EVENT_SIZES_SEARCH_FILTER
        : category == "categories_without_path"
        ? EVENT_CATEGORIES_WITHOUT_PATH_SEARCH_FILTER
        : category == "discount"
        ? EVENT_DISCOUNT_FILTER_CLICK
        : category == "gender" 
        ? EVENT_SET_PREFERENCES_GENDER
        : "";
    Moengage.track_event(EVENT_MOE_PLP_FILTER, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      filter_type: category || "",
      filter_value: "All",
      app6thstreet_platform: "Web",
    });
    if (MoeFilterEvent && MoeFilterEvent.length > 0) {
      Moengage.track_event(MoeFilterEvent, {
        country: getCountryFromUrl().toUpperCase(),
        language: getLanguageFromUrl().toUpperCase(),
        app6thstreet_platform: "Web",
      });
      const EventData = { name:MoeFilterEvent, value: "All"}
      Event.dispatch(EVENT_GTM_FILTER, EventData);
    }
    onUnselectAllPress(category);
  };

  getSizeTypeSelect(sizeObject) {
    const { sizeDropDownKey } = this.state;

    return (
      <div block="FieldMultiselect" elem="SizeTypeSelector">
        <select
          key="SizeTypeSelect"
          block="FieldMultiselect"
          elem="SizeTypeSelectElement"
          value={sizeDropDownKey}
          onChange={this.handleSizeDropDownClick}
        >
          {sizeObject.map((size = "") => {
            return (
              <option
                key={v4()}
                block="FieldMultiselect"
                elem="SizeTypeOption"
                value={size.key}
              >
                {size.value.toUpperCase()}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  renderSizeDropDown(sizeObject = []) {
    return (
      <div block="FieldMultiselect" elem="SizeSelect">
        {this.renderUnselectButton("sizes")}
        {this.getSizeTypeSelect(sizeObject)}
      </div>
    );
  }

  handleSizeDropDownClick = (e) => {
    e.preventDefault();
    this.setState({
      sizeDropDownKey: e.target.value,
    });
  };

  renderOptions() {
    const {
      filter: {
        data = {},
        subcategories = {},
        category,
        is_radio,
        label,
        selected_filters_count,
      },
      initialOptions,
    } = this.props;
    const { searchFacetKey, searchKey, searchList } = this.state;
    let finalData = data ? data : subcategories;
    let totalCount = 0;
    let formattedData = {};
    if (!is_radio) {
      if (data && category !== "categories_without_path") {
        Object.values(data).map((category) => {
          totalCount = totalCount + category.product_count;
        });
      } else {
        // const { initialOptions } = this.props;
        // let categoryLevelArray = [
        //   "categories.level1",
        //   "categories.level2",
        //   "categories.level3",
        //   "categories.level4",
        // ];
        // let categoryLevel;
        // categoryLevelArray.map((entry, index) => {
        //   if (initialOptions[entry]) {
        //     categoryLevel = initialOptions[entry].split(" /// ")[index + 1];
        //   }
        // });
        // if (categoryLevel) {
        //   if (data[categoryLevel]) {
        //     formattedData = data[categoryLevel].subcategories;

        //     Object.entries(formattedData).map((entry) => {
        //       totalCount = totalCount + entry[1].product_count;
        //     });
        //   }
        // } else {
        //   Object.entries(data).map((filterData) => {
        //     Object.entries(filterData[1].subcategories).map((entry) => {
        //       totalCount = totalCount + entry[1].product_count;
        //     });
        //   });
        // }
        Object.entries(data).map((filterData) => {
          Object.entries(filterData[1].subcategories).map((entry) => {
            totalCount = totalCount + entry[1].product_count;
          });
        });
      }
    }

    if (category === "in_stock") {
      if (finalData) {
        Object.values(finalData).map((subData) => {
          if (subData.facet_value === "0") {
            return (subData.label = __("Out of Stock"));
          } else if (subData.facet_value === "1") {
            return (subData.label = __("In Stock"));
          }
        });
      }
    }

    let sizeData = data;
    if (this.state.sizeDropDownKey === "" && category === "sizes") {
      this.setState({
        sizeDropDownKey: "size_eu",
        sizeDropDownList: data,
      });
    }

    let searchData = data;
    if (searchKey != "" && searchFacetKey === category) {
      searchData = this.getRenderSearchData(data, searchList);
    }
    const type = is_radio ? "radio" : "checkbox";
    const selectAllCheckbox = selected_filters_count === 0 ? true : false;

    return (
      <>
        <ul
          block="FieldMultiselect"
          elem={category === "sizes" ? "sizesOptionContainer" : ""}
        >
          {!is_radio &&
            category !== "sizes" &&
            this.renderAllFilterOption(
              type,
              category,
              selectAllCheckbox,
              totalCount
            )}
          {category === "in_stock"
            ? Object.entries(finalData).map(this.renderOption)
            : category === searchFacetKey
            ? Object.entries(searchData).map(this.renderOption)
            : category === "sizes" && !isMobile.any()
            ? Object.entries(sizeData).map(this.renderSizeOption)
            : // : category === "categories_without_path" &&
            //   Object.keys(formattedData).length
            // ? Object.entries(formattedData).map(this.renderOption)
            Object.keys(data).length
            ? Object.entries(data).map(this.renderOption)
            : Object.entries(subcategories).map(this.renderOption)}
        </ul>
      </>
    );
  }

  renderAllFilterOption(type, initialFacetKey, checked, totalCount) {
    let product_count = totalCount;
    const { isArabic } = this.state;
    let allColor = initialFacetKey === "colorfamily" ? true : false;
    return (
      <li
        ref={this.allOptionRef}
        block="PLPFilterOption"
        elem="List"
        mods={{ isArabic }}
      >
        <Field
          formRef={this.allFieldRef}
          onClick={() => this.onDeselectAllCategory(initialFacetKey)}
          mix={{
            block: "PLPFilterOption",
            elem: "Input",
          }}
          type={type}
          id={"all" + initialFacetKey}
          name={initialFacetKey}
          value={"all"}
          checked={checked}
        />
        <label block="PLPFilterOption" mods={{ allColor }} htmlFor={"all"}>
          All
          {!isMobile.any() && <span>{`(${product_count})`}</span>}
        </label>
      </li>
    );
  }

  sendMoeEvents (event, value){
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
    const eventData = {name: event, value: value};
    Event.dispatch(EVENT_GTM_FILTER, eventData);
  }

  renderFilterSearchbox(label, category) {
    let placeholder = label
      ? label
      : category
      ? `${category.charAt(0).toUpperCase()}${
          category.split(category.charAt(0))[1]
        }`
      : "";
    const { currentActiveFilter } = this.props;
    const { isArabic } = this.state;
    if (isMobile.any() && currentActiveFilter !== category) {
      return null;
    }
    const MoeFilterEvent =
      (currentActiveFilter || category) == "brand_name"
        ? EVENT_BRAND_SEARCH_FOCUS
        : (currentActiveFilter || category) == "colorfamily"
        ? EVENT_COLOR_SEARCH_FOCUS
        : (currentActiveFilter || category) == "sizes"
        ? EVENT_SIZES_SEARCH_FOCUS
        : (currentActiveFilter || category) == "categories_without_path"
        ? EVENT_CATEGORIES_WITHOUT_PATH_SEARCH_FOCUS
        : "";

    return (
      <div block="Search-Container" mods={{ isArabic }}>
        <input
          type="text"
          id={isMobile.any() ? currentActiveFilter : category}
          placeholder={isMobile.any() ? "Search..." : `Search ${placeholder}`}
          onChange={(event) => this.handleFilterSearch(event)}
          onFocus={(event) => this.sendMoeEvents(MoeFilterEvent, event.target.value)
          }
        />
        {!isMobile.any() && (
          <button
            block="FilterSearch"
            elem="SubmitBtn"
            type="button"
            mods={{ isArabic }}
          >
            <Image lazyLoad={false} src={searchPng} alt="searchIcon" />
          </button>
        )}
      </div>
    );
  }

  handleFilterSearch(event) {
    const {
      filter: { data = {} },
      initialOptions,
    } = this.props;
    const facet_key = event.target.id;
    let allData = data ? data : null;
    let value = event.target.value;
    let finalSearchedData = this.getSearchData(allData, facet_key, value);
    if (finalSearchedData) {
      this.setState({
        searchList: finalSearchedData,
        searchKey: value,
        searchFacetKey: facet_key,
      });
    }
  }

  getRenderSearchData = (allData, searchData) => {
    let finalSearchedData = {};
    Object.keys(searchData).map((entry) => {
      Object.keys(allData).map((subEntry) => {
        if (subEntry === entry) {
          finalSearchedData[subEntry] = allData[subEntry];
        } else {
          Object.entries(allData[subEntry]?.subcategories ?? {}).map((data) => {
            if (data[0] === entry) {
              finalSearchedData[data[0]] =
                allData[subEntry].subcategories[data[0]];
            }
          });
        }
      });
    });
    return finalSearchedData;
  };

  getSearchData = (allData, facet_key, value) => {
    let finalSearchedData = {};
    if (facet_key === "categories_without_path") {
      Object.entries(allData).map((entry) => {
        Object.entries(entry[1].subcategories).map((subEntry) => {
          if (subEntry[0].toLowerCase().includes(value.toLowerCase())) {
            finalSearchedData[subEntry[0]] =
              entry[1].subcategories[subEntry[0]];
          }
        });
      });
    } else {
      Object.keys(allData).filter((key) => {
        if (key.toLowerCase().includes(value.toLowerCase())) {
          finalSearchedData[key] = allData[key];
        }
      });
    }
    return finalSearchedData;
  };
  onCheckboxOptionClick = () => {
    this.filterButtonRef.current.focus();

    this.setState({
      toggleOptionsList: false,
    });
  };

  handleFilterChange = () => {
    const { changeActiveFilter, filter } = this.props;
    changeActiveFilter(filter.category || filter.facet_key);
  };

  toggelOptionList() {
    const { toggleOptionsList } = this.state;

    this.setState({
      toggleOptionsList: !toggleOptionsList,
    });
  }

  onBlur = () => {
    // eslint-disable-next-line no-magic-numbers
    this.toggelOptionList();
  };

  renderOptionSelected() {
    const {
      filter: { data, selected_filters_count },
    } = this.props;
    const { showMore, showLess } = this.state;
    let selectedItems = true;
    if (this.props.isSortBy) {
      return null;
    }
    if (data) {
      return (
        <div block="MultiSelectOption" mods={{ selectedItems }}>
          <ul block="selectedOptionLists" mods={{ showMore }}>
            {selected_filters_count === 0 && (
              <>
                <li key={v4()} block="selectedListItem">
                  All
                </li>
              </>
            )}
            {Object.values(data).map(function (values, keys) {
              if (values.subcategories) {
                return Object.values(values.subcategories).map(function (
                  val,
                  key
                ) {
                  if (val.is_selected === true) {
                    let label =
                      val.facet_key === "in_stock" && val.label === 1
                        ? "In Stock"
                        : val.facet_key === "in_stock" && val.label === 0
                        ? "Out of Stock"
                        : val.label;
                    return (
                      <Fragment key={key}>
                        <li key={v4()} block="selectedListItem">
                          {label}
                        </li>
                        </Fragment>
                    );
                  }
                });
              } else {
                if (values.is_selected === true) {
                  let label =
                    values.facet_key === "in_stock" && values.label === "1"
                      ? "In Stock"
                      : values.facet_key === "in_stock" && values.label === "0"
                      ? "Out of Stock"
                      : values.label;
                  return (
                    <Fragment key={keys}>
                      <li key={v4()} block="selectedListItem">
                        {label}
                      </li>
                      </Fragment>
                  );
                }
              }
            })}
          </ul>
          {showMore ? (
            <div block="FieldMultiselect" elem="ShowButton">
              <div onClick={() => this.updateShowMoreState(false)}>
                {__("Show More")}
              </div>
            </div>
          ) : null}
          {showLess ? (
            <div block="FieldMultiselect" elem="ShowButton">
              <div onClick={() => this.updateShowLessState(false)}>
                {__("Show Less")}
              </div>
            </div>
          ) : null}
        </div>
      );
    }
  }

  updateShowMoreState = (state) => {
    this.setState({ showMore: state, showLess: !state });
  };

  updateShowLessState = (state) => {
    this.setState({ showMore: !state, showLess: state });
  };

  renderMultiselectContainer() {
    const { toggleOptionsList, isArabic } = this.state;
    const {
      placeholder,
      isHidden,
      filter: {
        data = {},
        subcategories = {},
        category,
        is_radio,
        label,
        selected_filters_count,
      },
      filter,
      initialOptions,
      currentActiveFilter,
    } = this.props;
    let conditionalData = data ? data : subcategories;
    let selectedItems = true;

    const datakeys = [];
    if (category === "sizes") {
      Object.keys(data).map((key) => {
        datakeys.push({ key: key, value: data[key].label.split(" ")[1] });
      });
    }

    if (category === "categories_without_path") {
      let categoryLevelData = [];
      Object.entries(conditionalData).map((entry) => {
        Object.entries(entry[1].subcategories).map((subEntry) => {
          categoryLevelData.push(subEntry[1]);
        });
      });
      conditionalData = categoryLevelData;
    }
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const [lang, country] = locale && locale.split("-");
    const currency = getCurrencyCode(country);
    const priceAttribute = `price.${currency}.default`;

    const {
      filters: {
        categories_without_path: {
          selected_filters_count: selectedCategoryCount,
        },
        [priceAttribute]: { selected_filters_count: priceCount },
      },
    } = this.props;

    let CategorySelected =
      isMobile.any() && (selectedCategoryCount > 0 || priceCount > 0)
        ? true
        : false;
    return (
      <div
        ref={this.filterDropdownRef}
        block="FieldMultiselect"
        mods={{ isHidden }}
      >
        {!isMobile.any() && (
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
            onClick={
              isMobile.any() ? this.handleFilterChange : this.toggelOptionList
            }
          >
            {placeholder}
          </button>
        )}
        {isMobile.any() ? null : this.renderOptionSelected()}
        {toggleOptionsList && !isMobile.any() && (
          <>
            {Object.keys(conditionalData).length > 10
              ? this.renderFilterSearchbox(label, category)
              : null}
            {category === "sizes" && !isMobile.any()
              ? this.renderSizeDropDown(datakeys)
              : null}
            {category !== "sizes" &&
              !isMobile.any() &&
              !is_radio &&
              this.renderUnselectButton(category)}
          </>
        )}
        <div
          block="FieldMultiselect"
          elem="OptionListContainer"
          mods={{ toggleOptionsList, CategorySelected }}
          mix={{
            block: "FieldMultiselect",
            elem: "OptionListContainer",
            mods: { isArabic },
          }}
        >
          {isMobile.any() && Object.keys(conditionalData).length > 10
            ? this.renderFilterSearchbox(label, category)
            : null}
          <fieldset block="PLPFilter">{this.renderOptions()}</fieldset>
        </div>
      </div>
    );
  }

  render() {
    return this.renderMultiselectContainer();
  }
}

export default FieldMultiselect;
