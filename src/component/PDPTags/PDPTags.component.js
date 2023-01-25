import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import './PDPTags.style';

class PDPTags extends PureComponent {

    static propTypes = {
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    renderTags() {
        const { tags } = this.props;

        return (
            tags.map((tag, index) => (
                <div
                    key={ `PDP_Tag_${ index+1 }`}
                    block="PDPTags"
                    elem="Tags"
                >
                    { tag }
                </div>
            ))
        );
    }

    render() {
        return (
            <div block='PDPTags' elem='Container'>
                { this.renderTags() }
            </div>
        )
    }
}

export default PDPTags;