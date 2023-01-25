import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { updateMeta } from 'Store/Meta/Meta.action';
import { LOCALES } from 'Util/Url/Url.config';

export const mapStateToProps = (state) => ({
    metaData: state.MetaReducer,
    currentLocale: state.AppState.locale
});

export const mapDispatchToProps = (dispatch) => ({
    setMeta: (meta) => dispatch(updateMeta(meta))
});

export class Seo extends PureComponent {
    static propTypes = {
        setMeta: PropTypes.func.isRequired,
        metaData: PropTypes.object.isRequired,
        currentLocale: PropTypes.string.isRequired
    };

    renderCanonicals() {
        const { setMeta, metaData: { canonical_url: canonicalUrl }, metaData } = this.props;
        const { origin = '', pathname = '' } = location || {};
        const urlWithoutParams =
            pathname !== "/catalogsearch/result/"
                ? `${origin}${pathname}`
                : `${origin}${"/"}`;
        if (urlWithoutParams && canonicalUrl !== urlWithoutParams) {
            const hreflangs = this.renderHreflangs();

            setMeta({
                ...metaData,
                canonical_url: urlWithoutParams,
                hreflangs
            });
        }
    }

    renderHreflangs() {
        const { currentLocale } = this.props;
        const { protocol = '', host = '', pathname = '' } = location || {};
        const hostParts = host.split('.');

        hostParts.shift();

        const domain = hostParts.join('.');

        return LOCALES.map((locale) => {
            // if (locale === currentLocale) {
            //     return null;
            // }

            return {
                href: `${ protocol }//${ locale }.${ domain }${ pathname }`,
                hreflang: locale
            };
        }).filter(Boolean);
    }

    render() {
        return [this.renderCanonicals()];
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Seo);
