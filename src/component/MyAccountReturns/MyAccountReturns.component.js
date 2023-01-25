import { PureComponent } from "react";
import { Route, Switch } from "react-router-dom";

import MyAccountCancelCreate from "Component/MyAccountCancelCreate";
import MyAccountCancelCreateSuccess from "Component/MyAccountCancelCreateSuccess";
import MyAccountReturnCreate from "Component/MyAccountReturnCreate";
import MyAccountExchangeCreate from "Component/MyAccountExchangeCreate";
import PickUpAddress from "Component/PickUpAddress/PickUpAddress.component";
import MyAccountReturnCreateList from "Component/MyAccountReturnCreateList";
import MyAccountReturnList from "Component/MyAccountReturnList";
import MyAccountReturnSuccess from "Component/MyAccountReturnSuccess";
import MyAccountReturnView from "Component/MyAccountReturnView";
import MyAccountExchangeView from "Component/MyAccountExchangeView";
import { withStoreRegex } from "Component/Router/Router.component";

import "./MyAccountReturns.style";

class MyAccountReturns extends PureComponent {
  renderCreateCancel({ match }) {
    return <MyAccountCancelCreate match={match} />;
  }

  renderCreateReturnList() {
    return <MyAccountReturnCreateList />;
  }

  renderCreateReturn({ match }) {
    return <MyAccountReturnCreate match={match} />;
  }

  renderCreateExchange({ match }) {
    return <MyAccountExchangeCreate match={match} />;
  }

  renderPickUpAddress() {
    return <PickUpAddress />;
  }

  renderOrderList(type) {
    return <MyAccountReturnList type={type} />;
  }

  renderOrderView({ match }) {
    return <MyAccountReturnView match={match} />;
  }

  renderExchangeOrderView({ match }) {
    return <MyAccountExchangeView match={match} />;
  }

  renderCreateReturnSuccess({ match }) {
    return <MyAccountReturnSuccess match={match} />;
  }

  renderCreateExchangeSuccess({ match }) {
    return <MyAccountExchangeView match={match} exchangeSuccess={true} />;
  }

  renderCreateCancelSuccess({ match }) {
    return <MyAccountCancelCreateSuccess match={match} />;
  }

  render() {
    return (
      <Switch>
        <Route
          path={withStoreRegex(
            "/my-account/return-item/create/success/:returnId"
          )}
          render={this.renderCreateReturnSuccess}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/return-item/create/")}
          render={this.renderCreateReturnList}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/return-item/create/:order")}
          render={this.renderCreateReturn}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/return-item")}
          render={() => this.renderOrderList("return")}
          exact
        />
        <Route
          path={withStoreRegex('/my-account/return-item/pick-up-address')}
          render={this.renderPickUpAddress}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/exchange-item/create/:order")}
          render={this.renderCreateExchange}
          exact
        />
        <Route
          path={withStoreRegex(
            "/my-account/exchange-item/create/success/:exchange"
          )}
          render={this.renderCreateExchangeSuccess}
          exact
        />
        <Route
          path={withStoreRegex(
            "/my-account/return-item/cancel/success/:cancelId"
          )}
          render={this.renderCreateCancelSuccess}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/return-item/cancel/:order")}
          render={this.renderCreateCancel}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/return-item/:return")}
          render={this.renderOrderView}
          exact
        />
        <Route
          path={withStoreRegex("/my-account/exchange-item/:exchange")}
          render={this.renderExchangeOrderView}
          exact
        />
      </Switch>
    );
  }
}

export default MyAccountReturns;
