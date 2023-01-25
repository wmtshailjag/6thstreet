import PropTypes from "prop-types";
import UrlRewritesQuery from "Query/UrlRewrites.query";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { hideActiveOverlay } from "Store/Overlay/Overlay.action";
import { resetPLPPage } from "Store/PLP/PLP.action";
import { LocationType } from "Type/Common";
import history from "Util/History";
import { fetchQuery } from "Util/Request";
import UrlRewrites from "./UrlRewrites.component";
import {
  TYPE_CATEGORY,
  TYPE_NOTFOUND,
  TYPE_PRODUCT,
} from "./UrlRewrites.config";
import isMobile from "Util/Mobile";
export const mapStateToProps = (state) => ({
  locale: state.AppState.locale,
});

export const mapDispatchToProps = (_dispatch) => ({
  hideActiveOverlay: () => _dispatch(hideActiveOverlay()),
  resetPLPPage: () => _dispatch(resetPLPPage()),
});

export class UrlRewritesContainer extends PureComponent {
  static propTypes = {
    location: LocationType.isRequired,
    locale: PropTypes.string.isRequired,
    hideActiveOverlay: PropTypes.func.isRequired,
  };

  containerFunctions = {
    // getData: this.getData.bind(this)
  };

  state = {
    prevPathname: "",
    isLoading: true,
    type: "",
    id: -1,
    sku: "",
    query: "",
    brandDescription: "",
    brandImg: "",
    brandName: "",
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const possibleSku = this.getPossibleSku();
    this.setState({
      sku: possibleSku,
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { pathname } = location;
    const { locale, hideActiveOverlay,resetPLPPage } = this.props;
    const { locale: prevLocale } = prevProps;

    const { prevPathname, query, sku } = this.state;
    const {
      prevPathname: prevStatePathname,
      query: prevQuery,
      sku: prevSku,
    } = prevState;

    this.onPageReload();
    if (query && query !== prevQuery) {
      let partialQuery = location.search;
      if (location.search) {
        if (partialQuery.indexOf("idx") !== -1) {
          return;
        } else {
          partialQuery = partialQuery.substring(1);
          history.push(`${pathname}${query}`);
        }
      } else if (window.pageType === "CMS_PAGE") {
        history.push(`${pathname}`);
      } else {
        history.push(`${pathname}?${query}`);
      }
    }
    // if (!location.search && query) {
    // history.push(`${pathname}?${query}`);
    // }
    let prevLocation;
    let finalPrevLocation;
    history.listen((nextLocation) => {
      finalPrevLocation = prevLocation;
      prevLocation = nextLocation;

      if (
        finalPrevLocation &&
        finalPrevLocation.search &&
        finalPrevLocation.search.includes("&p=") &&
        nextLocation.search.includes("&p=") && 
        isMobile.any()
      ) {
        let customPrevLoc = new URLSearchParams(finalPrevLocation.search);
        customPrevLoc.delete("p");
        let customCurrLoc = new URLSearchParams(location.search);
        customCurrLoc.delete("p");
        if (
          customCurrLoc.toString() !== customPrevLoc.toString() &&
          history.action === "POP"
        ) {
          const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
          url.searchParams.set("p", 0);
          const { pathname, search } = url;
          window.location.replace(pathname + search)
          resetPLPPage();
          this.requestUrlRewrite(true);
        }
      }
    });
    if (
      pathname !== prevPathname ||
      locale !== prevLocale ||
      sku !== prevSku
      // !prevStatePathname
    ) {
      hideActiveOverlay();
      document.body.style.overflow = "visible";
      // Request URL rewrite if pathname or locale changed
      this.requestUrlRewrite(true);
    }
  }

  onPageReload = () => {
    const { resetPLPPage } = this.props;
    let previousLocation = location.href;
    window.onload = function () {
      const url = new URL(previousLocation.replace(/%20&%20/gi, "%20%26%20"));

      if (url.searchParams.get("p") && url.searchParams.get("p") !== "0") {
        resetPLPPage();
        url.searchParams.set("p", 0);

        window.scrollTo(0, 0);
        const { pathname, search } = url;
        history.push(pathname + search);
      }
    };
  };
  async requestUrlRewrite(isUpdate = false) {
    // TODO: rename this to pathname, urlParam is strange
    const { pathname: urlParam = "", search } = location;
    const slicedUrl = urlParam.slice(urlParam.search("id/"));
    // eslint-disable-next-line no-magic-numbers
    const magentoProductId = Number(slicedUrl.slice("3").split("/")[0]);
    const possibleSku = this.getPossibleSku();
    this.setState({
      prevPathname: urlParam,
      isLoading: isUpdate
    });
    if (search.startsWith("?q=")) { // Normal PLP, Catalog Search
      this.setState({
        prevPathname: urlParam,
        type: TYPE_CATEGORY,
        id: magentoProductId,
        sku: possibleSku,
        query: search,
        brandDescription: "",
        brandImg: "",
        brandName: "",
      });
      window.pageType = TYPE_CATEGORY;
    } else if (search.startsWith("?p")) { // URL with query params, when resolver returns null
      this.setState({
        prevPathname: urlParam,
        type: TYPE_CATEGORY,
        id: magentoProductId,
        sku: possibleSku,
        query: "",
      });
      window.pageType = TYPE_CATEGORY;
    } else { // PDP & PLP w/o query params
      let gClidParam = "";
      let hasQueryString = 0;
      let appendQueryString;
      if (search.startsWith("?")) {
        const url = new URL(location.href.replace(/%20&%20/gi, "%20%26%20"));
        if (search.startsWith("?gclid=")) {
          let gclidValue = url.searchParams.get("gclid");
          gClidParam = `&gclid=${gclidValue}`
        } else {
          hasQueryString = 1;
          appendQueryString = `&${url.search.split('?')[1].toString()}`;
        }
      }

      const { urlResolver } = await fetchQuery(
        UrlRewritesQuery.getQuery({ urlParam })
      );
      let UpdatedURL;
      if (urlResolver && urlResolver.data.url) {
        UpdatedURL = urlResolver.data.url.split("&p=")[0] + '&p=0' + urlResolver.data.url.split("&p=")[1].substring(1)
      }

      const {
        type = magentoProductId || possibleSku ? TYPE_PRODUCT : TYPE_NOTFOUND,
        id,
        query = gClidParam || hasQueryString ? `?${UpdatedURL}` : UpdatedURL,
        data: {
          //url: query,
          brand_html: brandDescription,
          brand_logo: brandImg,
          brand_name: brandName,
        },
      } = urlResolver || { data: {} };
      if (!urlResolver) {
        this.setState({
          prevPathname: urlParam,
          // type: search.startsWith("?qid") ? TYPE_PRODUCT : TYPE_NOTFOUND,
          type: TYPE_NOTFOUND,
          id: magentoProductId,
          sku: possibleSku,
          isLoading: false,
          query: search,
        });
        // window.pageType = search.startsWith("?qid")
        //   ? TYPE_PRODUCT
        //   : TYPE_NOTFOUND;
        window.pageType = TYPE_NOTFOUND;
      } else {
        const finalType =
          type === TYPE_NOTFOUND && decodeURI(location.search).match(/idx=/)
            ? TYPE_CATEGORY
            : type;
        window.pageType = finalType;
        this.setState({
          prevPathname: urlParam,
          type: finalType,
          id: id === undefined ? magentoProductId : id,
          isLoading: false,
          sku: possibleSku,
          query: finalType === TYPE_PRODUCT ? "" : hasQueryString ? `${query}${appendQueryString}` : `${query}${gClidParam}`,
          brandDescription: brandDescription,
          brandImg: brandImg,
          brandName: brandName,
        });
      }
    }
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 3000);
    // TODO: switch to "executeGet" afterwards
  }

  getPossibleSku() {
    const { pathname } = location;

    const uriElements = pathname
      .substr(0, pathname.indexOf(".html"))
      .substr(1)
      .split("-");

    const result = uriElements
      .reduce((acc, element) => {
        if (/\d/.test(element) || acc.length !== 0) {
          acc.push(element);
        }

        return acc;
      }, [])
      .join("-");

    return result.length ? result : false;
  }

  containerProps = () => {
    const { isLoading, type, id, sku, brandDescription, brandImg, brandName } =
      this.state;
    const string_sku = sku.toString();
    return {
      isLoading,
      type,
      id,
      string_sku,
      brandDescription,
      brandImg,
      brandName,
    };
  };

  render() {
    return (
      <UrlRewrites {...this.containerFunctions} {...this.containerProps()} />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UrlRewritesContainer);
