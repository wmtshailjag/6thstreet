import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { toggleOverlayByKey } from 'Store/Overlay/Overlay.action';

import MenuGrid from './MenuGrid.component';

export const mapDispatchToProps = (_dispatch) => ({
    toggleOverlayByKey: (key) => _dispatch(toggleOverlayByKey(key))
});

export class MenuGridContainer extends PureComponent {
    render() {
        return (
            <MenuGrid
              { ...this.props }
            />
        );
    }
}

export default connect(null, mapDispatchToProps)(MenuGridContainer);
