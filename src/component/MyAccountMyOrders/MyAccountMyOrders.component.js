// import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';

import MyAccountOrderList from 'Component/MyAccountOrderList';
import MyAccountOrderView from 'Component/MyAccountOrderView';
import { withStoreRegex } from 'Component/Router/Router.component';

import './MyAccountMyOrders.style';

class MyAccountMyOrders extends PureComponent {
    static propTypes = {
        // TODO: implement prop-types
    };

    renderOrderList() {
        return <MyAccountOrderList />;
    }

    renderOrderView({ match }) {
        return (
            <MyAccountOrderView
              match={ match }
            />
        );
    }

    render() {
        return (
            <Switch>
                <Route
                  path={ withStoreRegex('/my-account/my-orders') }
                  render={ this.renderOrderList }
                  exact
                />
                <Route
                  path={ withStoreRegex('/my-account/my-orders/:order') }
                  render={ this.renderOrderView }
                  exact
                />
            </Switch>
        );
    }
}

export default MyAccountMyOrders;
