/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */
/* eslint-disable func-names */
import { Provider } from "react-redux";

import Splash from "Route/Splash";
import { App as SourceApp } from "SourceComponent/App/App.component";
import configureStore from "Store";
import AppConfig from "Store/AppConfig/AppConfig.reducer";
import AppState from "Store/AppState/AppState.reducer";
import Cart from "Store/Cart/Cart.reducer";
import PDP from "Store/PDP/PDP.reducer";
import PLP from "Store/PLP/PLP.reducer";
import LiveParty from "Store/LiveParty/LiveParty.reducer";
import SearchSuggestions from "Store/SearchSuggestions/SearchSuggestions.reducer";
import BrandCms from "Store/BrandCms/BrandCms.reducer";
import * as Sentry from "@sentry/react";

class App extends SourceApp {
  rootComponents = [this.renderSplash.bind(this)];

  getStore() {
    const store = configureStore();

    store.injectReducer("AppConfig", AppConfig);
    store.injectReducer("AppState", AppState);
    store.injectReducer("Cart", Cart);
    store.injectReducer("PLP", PLP);
    store.injectReducer("PDP", PDP);
    store.injectReducer("SearchSuggestions", SearchSuggestions);
    store.injectReducer("LiveParty", LiveParty);
    store.injectReducer("BrandCms", BrandCms)

    return store;
  }

  renderRedux(children) {
    return (
      <Provider store={this.getStore()} key="redux">
        {children}
      </Provider>
    );
  }

  renderSplash() {
    return <Splash key="splash" />;
  }
}

export default Sentry.withProfiler(App);