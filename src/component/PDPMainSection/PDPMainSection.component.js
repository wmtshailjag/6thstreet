// import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import PDPGallery from 'Component/PDPGallery';
import PDPSummary from 'Component/PDPSummary';

import './PDPMainSection.style';

class PDPMainSection extends PureComponent {
    static propTypes = {
        // TODO: implement prop-types
    };

    renderSummary() {
        return (
            <PDPSummary {...this.props} />
        );
    }

    renderGallery() {
        return <PDPGallery {...this.props}/>;
    }

    render() {
        return (
            <div block="PDPMainSection">
                { this.renderGallery() }
                { this.renderSummary() }
            </div>
        );
    }
}

export default PDPMainSection;
