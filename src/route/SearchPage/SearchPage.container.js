// import PropTypes from 'prop-types';
import VueIntegrationQueries from "Query/vueIntegration.query";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import {
  mapDispatchToProps,
  mapStateToProps,
  PLPContainer,
} from "Route/PLP/PLP.container";
import { getCountriesForSelect } from "Util/API/endpoint/Config/Config.format";
import { getUUID } from "Util/Auth";
import { VUE_PAGE_VIEW } from "Util/Event";
import SearchPage from "./SearchPage.component";
import { TYPE_CATEGORY } from "../../route/UrlRewrites/UrlRewrites.config";
import browserHistory from "Util/History";
import { getCountryFromUrl } from "Util/Url/Url";

export class SearchPageContainer extends PLPContainer {
  constructor(props) {
    super(props);
    const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
    if (url.search.includes("?q=")) {
      url.searchParams.set("p", 0);
      // update the URL, preserve the state
      const { pathname, search } = url;
      browserHistory.replace(pathname + search);
    }
  }
  componentDidMount() {
    window.pageType = TYPE_CATEGORY;
    const { prevPath = null } = this.props;
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    VueIntegrationQueries.vueAnalayticsLogger({
      event_name: VUE_PAGE_VIEW,
      params: {
        event: VUE_PAGE_VIEW,
        pageType: "search",
        currency: VueIntegrationQueries.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: prevPath,
        url: window.location.href,
      },
    });
  }
  updateBreadcrumbs() {
    const {
      updateBreadcrumbs,
      location: { pathname = "", search = "" } = {},
      options: { q } = {},
    } = this.props;
    const link = `${pathname}${search}`;
    let breadCrumbName = q?.trim() ? q?.trim() : "Available products";
    updateBreadcrumbs([
      { name: breadCrumbName, url: link },
      { name: __("Home"), url: "/" },
    ]);
  }

  containerProps = () => {
    const { options, pages, isLoading, filters } = this.props;
    const { activeFilters } = this.state;
    return { options, pages, isLoading, filters, activeFilters };
  };

  setMetaData() {
    const { setMeta, country, config, options: { q } = {} } = this.props;

    if (!q) {
      return;
    }

    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};

    setMeta({
      title: __(
        "Search results for %s. Online shopping in %s | 6thStreet",
        q,
        countryName
      ),
      keywords: __("%s online shopping", q),
      description: getCountryFromUrl() === 'QA' ? __(
        // eslint-disable-next-line max-len
        "Buy %s. Explore your favourite brands ✯ Free Receiving ✯ Cash On Receiving ✯ 100% original brands | 6thStreet.",
        q
      )
        :
        __(
          // eslint-disable-next-line max-len
          "Buy %s. Explore your favourite brands ✯ Free delivery ✯ Cash On Delivery ✯ 100% original brands | 6thStreet.",
          q
        ),
      twitter_title: __(
        "Search results for %s. Online shopping in %s | 6thStreet",
        q,
        countryName
      ),
      twitter_desc: getCountryFromUrl() === 'QA' ? __(
        // eslint-disable-next-line max-len
        "Buy %s. Explore your favourite brands ✯ Free Receiving ✯ Cash On Receiving ✯ 100% original brands | 6thStreet.",
        q
      )
        :
        __(
          // eslint-disable-next-line max-len
          "Buy %s. Explore your favourite brands ✯ Free delivery ✯ Cash On Delivery ✯ 100% original brands | 6thStreet.",
          q
        ),
      og_title: __(
        "Search results for %s. Online shopping in %s | 6thStreet",
        q,
        countryName
      ),
      og_desc: getCountryFromUrl() === 'QA' ? __(
        // eslint-disable-next-line max-len
        "Buy %s. Explore your favourite brands ✯ Free Receiving ✯ Cash On Receiving ✯ 100% original brands | 6thStreet.",
        q
      )
        :
        __(
          // eslint-disable-next-line max-len
          "Buy %s. Explore your favourite brands ✯ Free delivery ✯ Cash On Delivery ✯ 100% original brands | 6thStreet.",
          q
        ),
    });
  }

  render() {
    return (
      <SearchPage {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchPageContainer)
);
