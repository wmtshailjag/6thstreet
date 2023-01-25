import { connect } from 'react-redux';

import {
    mapDispatchToProps,
    mapStateToProps,
    MyAccountReturnCreateItemContainer as SourceComponent
} from 'Component/MyAccountReturnCreateItem/MyAccountReturnCreateItem.container';

import MyAccountCancelCreateItem from './MyAccountCancelCreateItem.component';
export class MyAccountCancelCreateItemContainer extends SourceComponent {
    render() {
        const { country } = this.props;
        return (
            <MyAccountCancelCreateItem
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountCancelCreateItemContainer);
