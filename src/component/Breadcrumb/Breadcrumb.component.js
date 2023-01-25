/* eslint-disable react/no-redundant-should-component-update */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import Link from 'Component/Link';
import TextPlaceholder from 'Component/TextPlaceholder';

import './Breadcrumb.extended.style';
import './Breadcrumb.style';

export const mapStateToProps = (state) => ({
    gender: state.AppState.gender
});

export class Breadcrumb extends PureComponent {
    static propTypes = {
        index: PropTypes.number.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        isArabic: PropTypes.bool.isRequired,
        url: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({})
        ]),
        name: PropTypes.string,
        onClick: PropTypes.func,
        gender: PropTypes.string.isRequired
    };

    static defaultProps = {
        url: '',
        name: '',
        onClick: () => {}
    };

    handleBradcrumbClick = () => {
        const {
            onClick,
            gender
        } = this.props;

        onClick(gender);
    };

    renderLink() {
        const {
            url,
            index,
            isDisabled
        } = this.props;

        return (
            <Link
              block="Breadcrumb"
              elem="Link"
              to={ url || '' }
              tabIndex={ isDisabled ? '-1' : '0' }
              onClick={ this.handleBradcrumbClick }
            >
                <meta itemProp="item" content={ window.location.origin + (url || '') } />
                <span itemProp="name">
                    { this.renderName() }
                </span>
                <meta itemProp="position" content={ index } />
            </Link>
        );
    }

    renderName() {
        const { name } = this.props;
        return (
            <TextPlaceholder content={ __(name) } />
        );
    }

    render() {
        const { index, isArabic } = this.props;

        return (
            <li
              block="Breadcrumb"
              mods={ { isArabic } }
              key={ index }
              itemProp="itemListElement"
              itemScope
              itemType="http://schema.org/ListItem"
            >
                { this.renderLink() }
            </li>
        );
    }
}

export default connect(mapStateToProps, null)(Breadcrumb);
