import PropTypes from "prop-types";
import { PureComponent } from "react";

import QuickCategoriesOptions from "Component/QuickCategoriesOptions";
import { Filter } from "Util/API/endpoint/Product/Product.type";

import "./PLPQuickFilter.style";

class PLPQuickFilter extends PureComponent {
  static propTypes = {
    filter: Filter.isRequired,
    updateFilters: PropTypes.func.isRequired,
    handleCallback: PropTypes.func.isRequired,
  };

  render() {
    const {
      filter: { label },
      filter,
      updateFilters,
      handleCallback,
      selectedSizeCode,
      brandFilter
    } = this.props;

    return (
      <QuickCategoriesOptions
        placeholder={label}
        showCheckbox
        brandFilter={brandFilter}
        selectedSizeCode={selectedSizeCode}
        filter={filter}
        updateFilters={updateFilters}
        parentCallback={handleCallback}
      />
    );
  }
}

export default PLPQuickFilter;
