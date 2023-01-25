import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';

import Field from 'Component/Field';
import { FilterOption } from 'Util/API/endpoint/Product/Product.type';
import { isArabic } from 'Util/App';
import isMobile from 'Util/Mobile';

import './PLPQuickFilterOption.style';

class PLPQuickFilterOption extends PureComponent {
    static propTypes = {
        option: FilterOption.isRequired,
        isRadio: PropTypes.bool,
        updateFilters: PropTypes.func.isRequired,
        parentCallback: PropTypes.func.isRequired
    };

    static defaultProps = {
        isRadio: false
    };

    fieldRef = createRef();

    optionRef = createRef();

    state = {
        isArabic: isArabic()
    };

    componentDidUpdate() {
        const { updateFilters } = this.props;

        // causing issue of url fluctuating in case of filter 
        // updateFilters();
    }

    handleClick = () => {
        this.forceUpdate();
        const {
            option: {
                facet_key,
                facet_value
            },
            parentCallback
        } = this.props;
        const inputRef = this.optionRef.current.children[0].children[0];
        const { checked } = inputRef;

        parentCallback(facet_key, facet_value, checked);
    };

    renderField() {
        const {
            option: {
                facet_key,
                facet_value,
                is_selected: checked
            },
            isRadio
        } = this.props;

        // TODO: fix radio ?
        const defaultCheck = !!(
            facet_value === "recommended" && facet_key === "sort"
          );
        const type = isRadio ? 'radio' : 'checkbox';

        return (
            <Field
              onClick={ this.handleClick }
              mix={ isMobile.any() ? {
                  block: 'PLPFilterOption',
                  elem: 'Input'
              } : null }
              type={ type }
              id={ facet_value }
              name={ facet_key }
              value={ facet_value }
              defaultChecked={ defaultCheck || checked }
              checked={ defaultCheck || checked }
            />
        );
    }

    renderMobileField(facet_value, facet_key, checked, onSelectChecked) {
        const { isRadio } = this.props;

        const type = isRadio ? 'radio' : 'checkbox';

        return (
            <Field
              onClick={ this.handleClick }
              type={ type }
              id={ facet_value }
              name={ facet_key }
              value={ facet_value }
              defaultChecked={ checked || onSelectChecked }
            />
        );
    }

    renderCount() {
        const {
            option: {
                product_count
            }
        } = this.props;

        return (
            <span>
                { `(${product_count})` }
            </span>
        );
    }

    renderLabel() {
        const {
            option: {
                label,
                facet_value,
                product_count
            }
        } = this.props;

        return (
            <label
              block="PLPFilterOption"
              htmlFor={ facet_value }
            >
                { label }
                { product_count && this.renderCount() }
            </label>
        );
    }

    render() {
        const { isArabic } = this.state;
        const {
            option: {
                facet_value,
                facet_key,
                is_selected: checked
            },
            brandFilter
        } = this.props;
        const defaultCheck = !!(
            facet_value === "recommended" && facet_key === "sort"
          );
        if (!facet_value) {
            return null;
        }

        return (
            <li ref={ this.optionRef } block="PLPFilterOption" elem="List"
            mix={{
                block: "PLPFilterOption-List",
                elem:
                ((checked && brandFilter)|| defaultCheck) ? "SelectedList" : "",
              }}
            mods={ { isArabic } }
            >
                { this.renderField() }
                { this.renderLabel() }
            </li>
        );
    }
}

export default PLPQuickFilterOption;
