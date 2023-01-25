/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { lazy } from "react";
import { Route } from "react-router-dom";
import Breadcrumbs from "Component/Breadcrumbs";
import CookiePopup from "Component/CookiePopup";
import DemoNotice from "Component/DemoNotice";
import Footer from "Component/Footer";
import GoogleTagManager from "Component/GoogleTagManager";
import GTMRouteWrapper from "Component/GoogleTagManager/GoogleTagManagerRouteWrapper.component";
import Header from "Component/Header";
import NoMatch from "Route/NoMatch";

import {
  BRANDS,
  CART,
  CHECKOUT,
  CMS_PAGE,
  CUSTOMER_ACCOUNT,
  HOME_PAGE,
  SEARCH,
  VIEWALL,
  FEEDBACK,
  URL_REWRITES,
  LIVE_PARTY,
  ABOUT,
  STORE,
} from "Component/Header/Header.config";
import NavigationTabs from "Component/NavigationTabs";
import NewVersionPopup from "Component/NewVersionPopup";
import NotificationList from "Component/NotificationList";
import Seo from "Component/Seo";
import LocaleWizard from "Route/LocaleWizard";
import UrlRewrites from "Route/UrlRewrites";
import VuePLP from "Route/VuePLP/VuePLP.component";
import LiveExperience from "Route/LiveExperience";
import About from "Route/About";
import WelcomeHomePage from "Component/WelcomeHomePage";
import BrandCMS from "Route/BrandCMS"
import * as Sentry from '@sentry/react';

import {
  CartPage,
  Checkout,
  CmsPage,
  ConfirmAccountPage,
  HomePage,
  MenuPage,
  MyAccount,
  PasswordChangePage,
  Router as SourceRouter,
  SearchPage,
  WishlistShared,
  withStoreRegex,
} from "SourceComponent/Router/Router.component";
import Feedback from "../../route/Feedback/Feedback.container";
import {
  AFTER_ITEMS_TYPE,
  BEFORE_ITEMS_TYPE,
  SWITCH_ITEMS_TYPE,
} from "SourceComponent/Router/Router.config";
import { isArabic } from "Util/App";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

import "./Router.style";

const SentryRoute = Sentry.withSentryRouting(Route);

export const BrandsPage = lazy(() =>
  import(/* webpackMode: "lazy", webpackChunkName: "brands" */ "Route/Brands")
);

export {
  CartPage,
  Checkout,
  CmsPage,
  HomePage,
  MyAccount,
  PasswordChangePage,
  SearchPage,
  ConfirmAccountPage,
  MenuPage,
  WishlistShared,
  withStoreRegex,
};

export class Router extends SourceRouter {

  static propTypes = {
    ...SourceRouter.propTypes,
    isAppReady: PropTypes.bool.isRequired,
    setLanguage: PropTypes.func.isRequired,
    setCountry: PropTypes.func.isRequired,
  };

  state = {
    ...SourceRouter.state,
    isArabic: false,
    homepageUrl: "/(|men.html|women.html|kids.html|home.html|home_beauty_women.html)/",
  };



  [BEFORE_ITEMS_TYPE] = [
    {
      component: <NotificationList />,
      position: 10,
    },
    {
      component: <DemoNotice />,
      position: 15,
    },
    {
      component: <Header />,
      position: 20,
    },
    {
      component: <NavigationTabs />,
      position: 25,
    },
    {
      component: <Breadcrumbs />,
      position: 30,
    },
    {
      component: <NewVersionPopup />,
      position: 35,
    },
    {
      component: <GoogleTagManager />,
      position: 40,
    },
  ];

  [SWITCH_ITEMS_TYPE] = [
    {
      component: (
        <SentryRoute
          path={withStoreRegex(this.state.homepageUrl)}
          exact
          render={(props) => (
            <GTMRouteWrapper route={HOME_PAGE}>
              <HomePage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 10,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/page")}
          render={(props) => (
            <GTMRouteWrapper route={CMS_PAGE}>
              <CmsPage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 40,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/cart")}
          exact
          render={(props) => (
            <GTMRouteWrapper route={CART}>
              <CartPage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 50,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/checkout/:step?")}
          render={(props) => (
            <GTMRouteWrapper route={CHECKOUT}>
              <Checkout {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 55,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/:account*/createPassword/")}
          render={(props) => (
            <GTMRouteWrapper route={CUSTOMER_ACCOUNT}>
              <PasswordChangePage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 60,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/:account*/confirm")}
          render={(props) => (
            <GTMRouteWrapper route={CUSTOMER_ACCOUNT}>
              <ConfirmAccountPage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 65,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/my-account/:tab?")}
          render={(props) => (
            <GTMRouteWrapper route={CUSTOMER_ACCOUNT}>
              <MyAccount {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 70,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/forgot-password")}
          render={(props) => (
            <GTMRouteWrapper route={CUSTOMER_ACCOUNT}>
              <MyAccount {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 71,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/:gender?/shop-by-brands")}
          render={(props) => (
            <GTMRouteWrapper route={BRANDS}>
              <BrandsPage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 90,
    },

    {
      component: (
        <SentryRoute
          path={withStoreRegex("/catalogsearch/result")}
          render={(props) => (
            <GTMRouteWrapper route={SEARCH}>
              <SearchPage {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 90,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/viewall")}
          render={(props) => (
            <GTMRouteWrapper route={VIEWALL}>
              <VuePLP {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 90,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("feedback")}
          render={(props) => (
            <GTMRouteWrapper route={FEEDBACK}>
              <Feedback />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 95,
    },
    {
      component: (
        <SentryRoute
          render={(props) => (
            <GTMRouteWrapper route={URL_REWRITES}>
              <UrlRewrites {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 1000,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("live-party")}
          render={(props) => (
            <GTMRouteWrapper route={LIVE_PARTY}>
              {this.props.is_live_party_enabled ? <LiveExperience {...props} /> : <NoMatch />}
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 95,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("about")}
          render={(props) => (
            <GTMRouteWrapper route={ABOUT}>
              <About {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 95,
    },
    {
      component: (
        <SentryRoute
          path={withStoreRegex("/store/:pagename")}
          render={(props) => (
            <GTMRouteWrapper route={STORE}>
              <BrandCMS {...props} />
            </GTMRouteWrapper>
          )}
        />
      ),
      position: 96,
    },
  ];

  [AFTER_ITEMS_TYPE] = [
    {
      component: <Footer />,
      position: 10,
    },
    {
      component: <CookiePopup />,
      position: 20,
    },
    {
      component: <Seo />,
      position: 30,
    },
  ];

  static getDerivedStateFromProps() {
    return {
      isArabic: isArabic(),
    };
  }

  componentDidMount() {
    const { setCountry, setLanguage } = this.props;
    const country = getCountryFromUrl();
    const language = getLanguageFromUrl();

    if (country) {
      setCountry(country);
    }

    if (language) {
      setLanguage(language);
    }
  }

  renderLocaleWizard() {
    return <LocaleWizard />;
  }


  renderWelcomeHomePage() {
    return (
      <WelcomeHomePage />
    );
  }

  renderContent() {
    const { isArabic } = this.state;
    return (
      <div block="PageWrapper" mods={{ isArabic }}>
        {this.renderItemsOfType(BEFORE_ITEMS_TYPE)}
        <div block="PageWrapper" elem="Content">
          {this.renderMainItems()}
        </div>
        {this.renderItemsOfType(AFTER_ITEMS_TYPE)}
      </div>
    );
  }

  renderDefaultRouterContent() {
    const { isAppReady } = this.props;
    if (isAppReady) {
      return this.renderContent();
    }

    return this.renderWelcomeHomePage();

  }
}

export default Router;