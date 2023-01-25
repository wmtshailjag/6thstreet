import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    mapStateToProps as sourceMapStateToProps,
    MetaContainer as SourceMetaContainer
} from 'SourceComponent/Meta/Meta.container';

export const mapStateToProps = (state) => ({
    ...sourceMapStateToProps(state),
    hreflangs: state.MetaReducer.hreflangs,
    twitter_title: state.MetaReducer.twitter_title,
    twitter_desc:state.MetaReducer.twitter_desc,
    og_title:state.MetaReducer.og_title,
    og_desc:state.MetaReducer.og_desc
});

export class MetaContainer extends SourceMetaContainer {
    static propTypes = {
        ...SourceMetaContainer.propTypes,
        hreflangs: PropTypes.arrayOf(
            PropTypes.shape({
                hreflang: PropTypes.string,
                href: PropTypes.string
            })
        )
    };
    _getTwitterTitle() {
        const { twitter_title } = this.props;

        return twitter_title || '';
    }
    _getTwitterDesc() {
        const { twitter_desc } = this.props;

        return twitter_desc || '';
    }
    _getOgTitle() {
        const { og_title } = this.props;

        return og_title || '';
    }
    _getOgDesc() {
        const { og_desc } = this.props;

        return og_desc || '';
    }

    _getMetadata() {
        const meta = {
            title: this._getTitle(),
            description: this._getDescription(),
            keywords: this._getKeywords(),
            'twitter:title': this._getTwitterTitle(),
            'twitter:description':this._getTwitterDesc(),
            'og:title': this._getOgTitle(),
            'og:description': this._getOgDesc(),
        };

        return this._generateMetaFromMetadata(meta);
    }
    static defaultProps = {
        ...SourceMetaContainer.defaultProps,
        hreflangs: []
    };
}

export default connect(mapStateToProps)(MetaContainer);
