import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { showNotification } from 'Store/Notification/Notification.action';

import HeaderWishlist from './HeaderWishlist.component';

export const mapStateToProps = (_state) => ({
    isSignedIn: _state.MyAccountReducer.isSignedIn,
    language: _state.AppState.language,
    wishListItems: _state.WishlistReducer.items
});

export const mapDispatchToProps = (_dispatch) => ({
    showNotification: (type, message) => _dispatch(showNotification(type, message))
});

export class HeaderWishlistContainer extends PureComponent {
    static propTypes = {
        isBottomBar: PropTypes.bool,
        isWishlist: PropTypes.bool,
        language: PropTypes.string.isRequired
    };

    static defaultProps = {
        isBottomBar: false,
        isWishlist: false
    };

    containerFunctions = {
        // getData: this.getData.bind(this)
    };

    containerProps = () => {
        // isDisabled: this._getIsDisabled()
    };

    render() {
        return (
            <HeaderWishlist
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderWishlistContainer);
