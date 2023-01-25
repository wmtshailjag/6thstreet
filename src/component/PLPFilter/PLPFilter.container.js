/**
 * @category  sixth-street
 * @author    Vladislavs Belavskis <info@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import { toggleOverlayByKey } from "Store/Overlay/Overlay.action";
import { Filter } from "Util/API/endpoint/Product/Product.type";

import PLPFilter from "./PLPFilter.component";

export const mapStateToProps = (_state) => ({});

export const mapDispatchToProps = (_dispatch) => ({
  toggleOverlayByKey: (key) => _dispatch(toggleOverlayByKey(key)),
});

class PLPFilterContainer extends PureComponent {
  static propTypes = {
    filter: Filter.isRequired,
    toggleOverlayByKey: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    parentCallback: PropTypes.func.isRequired,
    currentActiveFilter: PropTypes.string,
    changeActiveFilter: PropTypes.func.isRequired,
    isReset: PropTypes.bool.isRequired,
    defaultFilters: PropTypes.bool.isRequired,
    resetParentState: PropTypes.func.isRequired,
    setDefaultFilters: PropTypes.func.isRequired,
    parentActiveFilters: PropTypes.object.isRequired,
  };

  static defaultProps = {
    currentActiveFilter: "",
  };

  state = {
    activeFilters: {},
    isChecked: false,
    parentActiveFilters: null,
    prevActiveFilters: {},
  };

  containerFunctions = {
    handleCallback: this.handleCallback.bind(this),
    handleUnselectAllPress: this.handleUnselectAllPress.bind(this),
  };

  handleUnselectAllPress(category) {
    const { onDeselectAllCategory } = this.props;
    onDeselectAllCategory(category);
  }

  handleCallback(initialFacetKey, facet_value, checked, isRadio) {
    const { parentCallback } = this.props;
    parentCallback(initialFacetKey, facet_value, checked, isRadio);
  }

  containerProps = () => {
    const {
      filter,
      changeActiveFilter,
      updateFilters,
      setDefaultFilters,
      defaultFilters,
      currentActiveFilter,
      isSortBy,
      initialOptions,
      filters
    } = this.props;

    const { parentActiveFilters } = this.state;
    return {
      filter,
      changeActiveFilter,
      updateFilters,
      setDefaultFilters,
      defaultFilters,
      currentActiveFilter,
      parentActiveFilters,
      isSortBy,
      initialOptions,
      filters
    };
  };

  render() {
    return (
      <PLPFilter
        {...this.state}
        {...this.containerFunctions}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PLPFilterContainer);
