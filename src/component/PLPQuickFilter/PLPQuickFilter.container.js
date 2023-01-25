import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Filter } from 'Util/API/endpoint/Product/Product.type';

import PLPQuickFilter from './PLPQuickFilter.component';

export const mapStateToProps = (_state) => ({});

class PLPQuickFilterContainer extends PureComponent {
    static propTypes = {
        filter: Filter.isRequired,
        updateFilters: PropTypes.func.isRequired,
        parentCallback: PropTypes.func.isRequired
    };

    containerFunctions = {
        handleCallback: this.handleCallback.bind(this)
    };

    handleCallback(initialFacetKey, facet_value, checked) {
        const {
            parentCallback
        } = this.props;

        const isRadio = false;
        const isQuickFilters = true;

        parentCallback(initialFacetKey, facet_value, checked, isRadio, isQuickFilters);
    }

    containerProps = () => {
        const { filter, updateFilters,selectedSizeCode,brandFilter } = this.props;

        return { filter, updateFilters,selectedSizeCode,brandFilter };
    };

    render() {
        return (
            <PLPQuickFilter
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps)(PLPQuickFilterContainer);
