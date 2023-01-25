/* eslint-disable no-param-reassign */
/**
 * @category  sixth-street
 * @author    Vladislavs Belavskis <info@scandiweb.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";

import {
  changeNavigationState,
  goToPreviousNavigationState,
} from "Store/Navigation/Navigation.action";
import {
  BOTTOM_NAVIGATION_TYPE,
  TOP_NAVIGATION_TYPE,
} from "Store/Navigation/Navigation.reducer";
import {
  hideActiveOverlay,
  toggleOverlayByKey,
} from "Store/Overlay/Overlay.action";
import { Filters } from "Util/API/endpoint/Product/Product.type";
import { updatePLPInitialFilters } from "Store/PLP/PLP.action";
import WebUrlParser from "Util/API/helper/WebUrlParser";

import PLPFilters from "./PLPFilters.component";
import { SIZES } from "./PLPFilters.config";

export const mapStateToProps = (_state) => ({
  filters: _state.PLP.filters,
  isLoading: _state.PLP.isLoading,
  activeOverlay: _state.OverlayReducer.activeOverlay,
  productsCount: _state.PLP.meta.hits_count,
});

export const mapDispatchToProps = (_dispatch) => ({
  showOverlay: (overlayKey) => _dispatch(toggleOverlayByKey(overlayKey)),
  hideActiveOverlay: () => _dispatch(hideActiveOverlay()),
  updatePLPInitialFilters: (filters, facet_key, facet_value) =>
    _dispatch(updatePLPInitialFilters(filters, facet_key, facet_value)),
  goToPreviousNavigationState: () =>
    _dispatch(goToPreviousNavigationState(BOTTOM_NAVIGATION_TYPE)),
  goToPreviousHeaderState: () =>
    _dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
  changeHeaderState: (state) =>
    _dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
});

export class PLPFiltersContainer extends PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    filters: Filters.isRequired,
    showOverlay: PropTypes.func.isRequired,
    activeOverlay: PropTypes.string.isRequired,
    goToPreviousHeaderState: PropTypes.func.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
    goToPreviousNavigationState: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    productsCount: PropTypes.number,
  };

  static defaultProps = {
    productsCount: 0,
  };

  state = {
    initialFilters: {},
    activeFilters: {},
  };

  containerFunction = {
    onReset: this.onReset.bind(this),
  };

  static getDerivedStateFromProps(props, state) {
    const { filters = {}, activeFilters = {} } = props;
    const { initialFilters = {} } = state;

    if (Object.keys(filters).length > Object.keys(initialFilters).length) {
      if (filters[SIZES]) {
        return {
          initialFilters: filters[SIZES].data
            ? {
              ...initialFilters,
              ...filters,
              ...filters[SIZES].data,
            }
            : {
              ...initialFilters,
              ...filters,
            },
        };
      }
      return {
        initialFilters: {
          ...initialFilters,
          ...filters,
        },
      };
    }
    if (activeFilters) {
      return {
        activeFilters,
      };
    }
    return null;
  }

  containerFunctions = () => {
    const {
      showOverlay,
      updatePLPInitialFilters,
      updateFiltersState,
      handleCallback,
      onUnselectAllPress,
      handleResetFilter
    } = this.props;

    return {
      showOverlay,
      updatePLPInitialFilters,
      updateFiltersState,
      handleCallback,
      onUnselectAllPress,
      handleResetFilter
    };
  };

  // eslint-disable-next-line consistent-return
  onReset() {
    const { initialFilters = {} } = this.state;
    const { query, handleResetFilter } = this.props;
    handleResetFilter()
    // eslint-disable-next-line fp/no-let
    for (let i = 0; i < Object.keys(initialFilters).length; i++) {
      WebUrlParser.setParam(Object.keys(initialFilters)[i], "", query);
    }
  }

  containerProps = () => {
    const { filters, isLoading, activeOverlay, query, isPLPSortBy } = this.props;
    const { activeFilters } = this.state;

    return {
      filters,
      isLoading,
      activeOverlay,
      activeFilters,
      query,
      isPLPSortBy
    };
  };

  render() {
    return (
      <PLPFilters
        {...this.props}
        {...this.containerFunctions()}
        {...this.containerFunction}
        {...this.containerProps()}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PLPFiltersContainer);
