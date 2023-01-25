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

import Breadcrumb from 'Component/Breadcrumb';
import ContentWrapper from 'Component/ContentWrapper';
import { BreadcrumbsType } from 'Type/Breadcrumbs';
import { isArabic } from 'Util/App';
import { appendWithStoreCode } from 'Util/Url';

import './Breadcrumbs.style';
import './Breadcrumbs.extended.style';

/**
 * Breadcrumbs
 * @class Breadcrumbs
 */
export class Breadcrumbs extends PureComponent {
    static propTypes = {
        breadcrumbs: BreadcrumbsType.isRequired,
        areBreadcrumbsVisible: PropTypes.bool.isRequired
    };

    state = {
        isArabic: isArabic()
    };

    renderBreadcrumb({
        url,
        name,
        onClick
    }, i) {
        const { breadcrumbs = [] } = this.props;
        const { isArabic } = this.state;
        const isDisabled = !url || breadcrumbs.length - 1 === i;
        return (
            <Breadcrumb
              name={ name }
              url={ url }
              index={ i }
              key={ i }
              isDisabled={ isDisabled }
              isArabic={ isArabic }
              onClick={ onClick }
            />
        );
    }

    renderBreadcrumbList(breadcrumbs = []) {
        return breadcrumbs.map((_, i) => this.renderBreadcrumb(
            breadcrumbs[breadcrumbs.length - 1 - i], i
        ));
    }

    render() {
        const { breadcrumbs = [], areBreadcrumbsVisible } = this.props;

        if (
            !areBreadcrumbsVisible
            || location.pathname === appendWithStoreCode('/')
            || location.pathname === '/'
        ) {
            return null;
        }

        return (
            <ContentWrapper mix={ { block: 'Breadcrumbs' } } label={ __('Breadcrumbs (current location)...') }>
                <nav aria-label="Breadcrumbs navigation">
                    <ul
                      block="Breadcrumbs"
                      elem="List"
                      itemScope
                      itemType="http://schema.org/BreadcrumbList"
                    >
                        { (
                            breadcrumbs.length
                                ? this.renderBreadcrumbList(breadcrumbs)
                                : this.renderBreadcrumb({}, 0)
                        ) }
                    </ul>
                </nav>
            </ContentWrapper>
        );
    }
}

export default Breadcrumbs;
