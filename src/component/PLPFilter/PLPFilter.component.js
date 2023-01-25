/**
 * @category  sixth-street
 * @author    Vladislavs Belavskis <info@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */

import FieldMultiselect from "Component/FieldMultiselect";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { Filter } from "Util/API/endpoint/Product/Product.type";
import isMobile from "Util/Mobile";
import "./PLPFilter.style";

class PLPFilter extends PureComponent {
  static propTypes = {
    filter: Filter.isRequired,
    activeFilter: PropTypes.object,
    isChecked: PropTypes.bool,
    defaultFilters: PropTypes.bool,
    currentActiveFilter: PropTypes.string,
    changeActiveFilter: PropTypes.func.isRequired,
    handleCallback: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    setDefaultFilters: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activeFilter: {},
    isChecked: false,
    defaultFilters: false,
    currentActiveFilter: "",
  };

  state = {
    currentActiveFilter: null,
    parentActiveFilters: null,
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      JSON.stringify(prevProps.parentActiveFilters) !==
      JSON.stringify(this.props.parentActiveFilters)
    ) {
      this.setState({
        parentActiveFilters: this.props.parentActiveFilters,
      });
    }
  }

  renderDropDownList() {
    const {
      filter: { label, category, is_radio },
      filter,
      filters,
      activeFilter,
      currentActiveFilter,
      isChecked,
      changeActiveFilter,
      handleCallback,
      updateFilters,
      setDefaultFilters,
      defaultFilters,
      parentActiveFilters,
      isSortBy,
      initialOptions,
      handleUnselectAllPress
    } = this.props;

    if (category === "categories.level1") {
      return null;
    }

    let placeholder =
      category === "in_stock"
        ? __("BY STOCK")
        : category === "age"
        ? __("BY AGE")
        : label;

    return (
      <FieldMultiselect
        placeholder={placeholder}
        showCheckbox
        isRadio={is_radio}
        filter={filter}
        filters={filters}
        initialOptions={initialOptions}
        activeFilter={activeFilter}
        isChecked={isChecked}
        onUnselectAllPress={handleUnselectAllPress}
        parentActiveFilters={parentActiveFilters}
        currentActiveFilter={currentActiveFilter}
        changeActiveFilter={changeActiveFilter}
        parentCallback={handleCallback}
        updateFilters={updateFilters}
        setDefaultFilters={setDefaultFilters}
        defaultFilters={defaultFilters}
        isSortBy={isSortBy}
      />
    );
  }

  render() {
    return <>{this.renderDropDownList()}</>;
  }
}

export default PLPFilter;
