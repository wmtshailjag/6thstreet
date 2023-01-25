import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { setGender } from "Store/AppState/AppState.action";
import { updateMeta } from "Store/Meta/Meta.action";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { setPDPLoading } from "Store/PDP/PDP.action";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import { getCountriesForSelect } from "Util/API/endpoint/Config/Config.format";
import { Product } from "Util/API/endpoint/Product/Product.type";
import {
  getBreadcrumbs,
  getBreadcrumbsUrl,
} from "Util/Breadcrumbs/Breadcrubms";
import Event, {
  EVENT_GTM_PRODUCT_DETAIL,
  VUE_PAGE_VIEW,
  EVENT_MOE_PRODUCT_DETAIL,
} from "Util/Event";
import PDP from "./PDP.component";
import browserHistory from "Util/History";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import { getCurrency } from "Util/App";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";
import BrowserDatabase from "Util/BrowserDatabase";
import VueQuery from "../../query/Vue.query";
import { getUUIDToken } from "Util/Auth";
import { isArabic } from "Util/App";
export const BreadcrumbsDispatcher = import(
  /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
  isLoading: state.PDP.isLoading,
  product: state.PDP.product,
  clickAndCollectStores: state.PDP.clickAndCollectStores,
  options: state.PDP.options,
  nbHits: state.PDP.nbHits,
  country: state.AppState.country,
  gender: state.AppState.gender,
  config: state.AppConfig.config,
  breadcrumbs: state.BreadcrumbsReducer.breadcrumbs,
  menuCategories: state.MenuReducer.categories,
  pdpWidgetsData: state.AppState.pdpWidgetsData,
});

export const mapDispatchToProps = (dispatch) => ({
  requestPdpWidgetData: () => PDPDispatcher.requestPdpWidgetData(dispatch),
  requestProduct: (options) => PDPDispatcher.requestProduct(options, dispatch),
  resetProduct: () => PDPDispatcher.resetProduct({}, dispatch),
  requestProductBySku: (options) =>
    PDPDispatcher.requestProductBySku(options, dispatch),
  getClickAndCollectStores: (brandName, sku, latitude, longitude) =>
    PDPDispatcher.getClickAndCollectStores(
      brandName,
      sku,
      latitude,
      longitude,
      dispatch
    ),
  setIsLoading: (isLoading) => dispatch(setPDPLoading(isLoading)),
  updateBreadcrumbs: (breadcrumbs) => {
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    );
  },
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  setGender: (gender) => dispatch(setGender(gender)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

export class PDPContainer extends PureComponent {
  static propTypes = {
    options: PropTypes.shape({ id: PropTypes.number }).isRequired,
    requestProduct: PropTypes.func.isRequired,
    requestProductBySku: PropTypes.func.isRequired,
    getClickAndCollectStores: PropTypes.func.isRequired,
    clickAndCollectStores: PropTypes.object.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    product: Product.isRequired,
    id: PropTypes.number.isRequired,
    sku: PropTypes.string,
    updateBreadcrumbs: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    setGender: PropTypes.func.isRequired,
    nbHits: PropTypes.number,
    setMeta: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    gender: PropTypes.string.isRequired,
    menuCategories: PropTypes.array.isRequired,
    brandDeascription: PropTypes.string,
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
    categories_without_path: PropTypes.array,
    description: PropTypes.string,
  };

  static defaultProps = {
    // nbHits: 1,
    sku: "",
    isLoading: true,
  };

  state = {
    productSku: null,
    prevPathname: "",
    currentLocation: "",
    pdpWidgetsAPIData: [],
    isPdpWidgetSet: false,
    isArabic: isArabic()
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const {
      requestPdpWidgetData,
      pdpWidgetsData=[],
      location: { pathname="" },
    } = this.props;
    this.requestProduct();
    if (!pdpWidgetsData || (pdpWidgetsData && pdpWidgetsData.length === 0)) {
      //request pdp widgets data only when not available in redux store.
      requestPdpWidgetData();
    }
    this.setState({ currentLocation: pathname });
  }

  componentDidUpdate(prevProps) {
    const {
      product: { sku, brand_name: brandName } = {},
      product,
      menuCategories = [],
      pdpWidgetsData = [],
    } = this.props;
    const { productSku ="", isPdpWidgetSet=false } = this.state;
    if(Object.keys(product).length) {
      if (!isPdpWidgetSet && pdpWidgetsData.length !== 0) {
        this.getPdpWidgetsVueData();
        this.setState({
          isPdpWidgetSet: true,
        });
      }
    }

    if (menuCategories.length !== 0 && sku && productSku !== sku) {
      this.updateBreadcrumbs();
      this.setMetaData();
      this.updateHeaderState();
      this.fetchClickAndCollectStores(brandName, sku);
      this.appendSchemaData();
    }
  }
  appendSchemaData() {
    const {
      product: {
        brand_name,
        color,
        gallery_images,
        upper_material,
        material,
        url,
        sku,
        name,
        description,
        price,
        categories,
        categories_without_path,
        size_eu,
        size_uk,
        size_us,
        stock_qty,
        in_stock,
      },
      brandImg,
      config,
      country,
      product,
    } = this.props;
    let outOfStockProduct;
    if (size_us && size_uk && size_eu) {
      outOfStockProduct =
        size_us.length === 0 &&
        size_uk.length === 0 &&
        size_eu.length === 0 &&
        in_stock === 0
          ? true
          : in_stock === 1 && stock_qty === 0
          ? true
          : false;
    } else {
      outOfStockProduct =
        in_stock === 0
          ? true
          : in_stock === 1 && stock_qty === 0
          ? true
          : false;
    }
    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};
    const specialPrice =
      price && price[0]
        ? price[0][Object.keys(price[0])[0]]["6s_special_price"].toString()
        : price && Object.keys(price)[0] !== "0"
        ? price[Object.keys(price)[0]]["6s_special_price"].toString()
        : null;
    let galleryImages = [];
    gallery_images.forEach((item) => {
      galleryImages.push(item);
    });
    const currency =
      price && price[0] && Object.keys(price[0])
        ? Object.keys(price[0]).toString()
        : "";
    const checkCategoryLevel = () => {
      if (categories.level4 && categories.level4.length > 0) {
        return categories.level4[0];
      } else if (categories.level3 && categories.level3.length > 0) {
        return categories.level3[0];
      } else if (categories.level2 && categories.level2.length > 0) {
        return categories.level2[0];
      } else if (categories.level1 && categories.level1.length > 0) {
        return categories.level1[0];
      } else if (categories.level0 && categories.level0.length > 0) {
        return categories.level0[0];
      } else return "";
    };
    const categoryLevel = checkCategoryLevel().includes("///")
      ? checkCategoryLevel().split("///").join(">")
      : checkCategoryLevel();
    const schemaData = [
      {
        "@context": "http://schema.org/",
        "@type": "Product",
        brand: {
          "@type": "Brand",
          name: brand_name || "",
          logo: brandImg || "",
        },
        name: name || "",
        image: galleryImages || "",
        description: description || "",
        sku: sku || "",
        category: categoryLevel || "",
        material:
          material && material !== null
            ? material
            : upper_material
            ? upper_material
            : "",
        keywords: __(
          "%s, %s, %s, Online Shopping %s",
          brand_name || "",
          name || "",
          categories_without_path.join(" ") || "",
          countryName || ""
        ),
        color: color || "",
        offers: {
          "@type": "Offer",
          priceCurrency: currency || "",
          price: specialPrice || "",
          availability: !outOfStockProduct
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: url || "",
        },
      },
    ];

    const scriptText = document.createTextNode(JSON.stringify(schemaData));
    const script = document.createElement("script");
    if (script) {
      script.type = "application/ld+json";
      document
        .querySelectorAll("script[type='application/ld+json']")
        .forEach((node) => node.remove());
      script.appendChild(scriptText);
      document.head.appendChild(script);
    }
  }

  componentWillUnmount() {
    document
      .querySelectorAll("script[type='application/ld+json']")
      .forEach((node) => node.remove());
  }

  getPdpWidgetsVueData() {
    const { gender="", pdpWidgetsData=[], product: {sku = ""} = {} } = this.props;
    if (pdpWidgetsData && pdpWidgetsData.length > 0) {
      const userData = BrowserDatabase.getItem("MOE_DATA");
      const customer = BrowserDatabase.getItem("customer");
      const userID = customer && customer.id ? customer.id : null;
      const query = {
        filters: [],
        num_results: 50,
        mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
      };

      let promisesArray = [];
      pdpWidgetsData.forEach((element) => {
        const { type } = element;
        const defaultQueryPayload ={
          userID,
          product_id: sku,
        };
        if(type !== "vue_visually_similar_slider") {
          defaultQueryPayload.gender= gender;
        }
        const payload = VueQuery.buildQuery(type, query, defaultQueryPayload );
        promisesArray.push(fetchVueData(payload));
      });
      Promise.all(promisesArray)
        .then((resp) => {
          this.setState({ pdpWidgetsAPIData: resp });
        })
        .catch((err) => {
          console.err(err);
        });
    }
  }

  fetchClickAndCollectStores(brandName, sku) {
    const { getClickAndCollectStores } = this.props;

    const options = {
      enableHighAccuracy: true,
    };

    const successCallback = ({ coords }) =>
      getClickAndCollectStores(
        brandName,
        sku,
        coords?.latitude,
        coords?.longitude
      );
    const errorCallback = (err) => console.error(err);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    }
  }

  updateHeaderState() {
    const { changeHeaderState } = this.props;

    changeHeaderState({
      name: DEFAULT_STATE_NAME,
      isHiddenOnMobile: true,
    });
  }

  updateBreadcrumbs() {
    const {
      updateBreadcrumbs,
      product: {
        categories = {},
        name,
        sku,
        image_url,
        url,
        thumbnail_url,
        product_type_6s,
        price,
        highlighted_attributes = [],
        size_eu = [],
        size_uk = [],
        size_us = [],
      },
      product,
      setGender,
      nbHits,
      menuCategories,
    } = this.props;
    const {isArabic} = this.state
    if (nbHits === 1) {
      const rawCategoriesLastLevel =
        categories[
          Object.keys(categories)[Object.keys(categories).length - 1]
        ]?.[0];
      const categoriesLastLevel = rawCategoriesLastLevel
        ? rawCategoriesLastLevel.split(" /// ")
        : [];

      const urlArray =
        getBreadcrumbsUrl(categoriesLastLevel, menuCategories) || [];
      if (urlArray.length === 0) {
        categoriesLastLevel.map(() => urlArray.push("/"));
      }
      const breadcrumbsMapped =
        getBreadcrumbs(categoriesLastLevel, setGender, urlArray, isArabic) || [];
      const productBreadcrumbs = breadcrumbsMapped.reduce((acc, item) => {
        acc.unshift(item);

        return acc;
      }, []);

      const breadcrumbs = [
        {
          url: "",
          name: __(name),
        },
        ...productBreadcrumbs,
      ];

      updateBreadcrumbs(breadcrumbs);
      this.setState({ productSku: sku });
    }
    const getDetails = highlighted_attributes.map((item) => ({
      [item.key]: item.value,
    }));
    const productKeys = Object.assign({}, ...getDetails);
    const specialPrice =
      price && price[0]
        ? price[0][Object.keys(price[0])[0]]["6s_special_price"]
        : price && Object.keys(price)[0] !== "0"
        ? price[Object.keys(price)[0]]["6s_special_price"]
        : null;
    const originalPrice =
      price && price[0]
        ? price[0][Object.keys(price[0])[0]]["6s_base_price"]
        : price && Object.keys(price)[0] !== "0"
        ? price[Object.keys(price)[0]]["6s_base_price"]
        : null;
    const checkCategoryLevel = () => {
      if (!categories) {
        return "this category";
      }
      if (categories.level4 && categories.level4.length > 0) {
        return categories.level4[0];
      } else if (categories.level3 && categories.level3.length > 0) {
        return categories.level3[0];
      } else if (categories.level2 && categories.level2.length > 0) {
        return categories.level2[0];
      } else if (categories.level1 && categories.level1.length > 0) {
        return categories.level1[0];
      } else if (categories.level0 && categories.level0.length > 0) {
        return categories.level0[0];
      } else return "";
    };
    const categoryLevel =
      product_type_6s && product_type_6s.length > 0
        ? product_type_6s
        : checkCategoryLevel().includes("///")
        ? checkCategoryLevel().split("///").pop()
        : "";

    Event.dispatch(EVENT_GTM_PRODUCT_DETAIL, {
      product: {
        name: productKeys.name,
        id: sku,
        price: specialPrice || originalPrice,
        brand: productKeys?.brand_name,
        category: categoryLevel,
        varient: productKeys?.color || "",
      },
    });

    const currentAppState = BrowserDatabase.getItem(APP_STATE_CACHE_KEY);
    Moengage.track_event(EVENT_MOE_PRODUCT_DETAIL, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      category: currentAppState.gender
        ? currentAppState?.gender?.toUpperCase()
        : "",
      gender: currentAppState.gender
        ? currentAppState?.gender?.toUpperCase()
        : "",
      subcategory: categoryLevel || product_type_6s,
      color: productKeys?.color || "",
      brand_name: productKeys?.brand_name || "",
      full_price: originalPrice || "",
      product_url: url,
      currency: getCurrency() || "",
      product_sku: sku || "",
      discounted_price: specialPrice || "",
      product_image_url: thumbnail_url || "",
      product_name: name || "",
      app6thstreet_platform: "Web",
    });
  }

  setMetaData() {
    const {
      setMeta,
      country,
      config,
      product: {
        brand_name: brandName,
        name,
        description,
        categories_without_path = [],
        color,
        categories,
      } = {},
    } = this.props;
    if (!name) {
      return;
    }
    const countryList = getCountriesForSelect(config);
    const { label: countryName = "" } =
      countryList.find((obj) => obj.id === country) || {};

    const checkCategory = () => {
      if (!categories) {
        return "this category";
      }
      if (categories.level4 && categories.level4.length > 0) {
        return categories.level4[0];
      } else if (categories.level3 && categories.level3.length > 0) {
        return categories.level3[0];
      } else if (categories.level2 && categories.level2.length > 0) {
        return categories.level2[0];
      } else if (categories.level1 && categories.level1.length > 0) {
        return categories.level1[0];
      } else if (categories.level0 && categories.level0.length > 0) {
        return categories.level0[0];
      } else return "this category";
    };
    const categoryLevel = checkCategory().split("///").pop();
    const getTitle = () => {
      if (!color) {
        return __("Buy %s %s | 6thStreet %s", brandName, name, countryName);
      } else if (color == "Multi") {
        return __(
          "Buy %s %s in Multiple colors | 6thStreet %s",
          brandName,
          name,
          countryName
        );
      } else {
        return __(
          "Buy %s %s in %s | 6thStreet %s",
          brandName,
          name,
          color,
          countryName
        );
      }
    };

    const pdpMetaTitle = getTitle();
    const pdpMetaDescription = __(
      "Shop %s %s at best prices & deals on 6thStreet.com %s. Get top collection in %s with free delivery on minimum order & 100 days free return.",
      brandName,
      name,
      countryName,
      categoryLevel
    );
    setMeta({
      title: pdpMetaTitle,
      keywords: __(
        "%s, %s, %s, Online Shopping %s",
        brandName,
        name,
        categories_without_path.join(" "),
        countryName
      ),
      description: pdpMetaDescription,
      twitter_title: pdpMetaTitle,
      twitter_desc: pdpMetaDescription,
      og_title: pdpMetaTitle,
      og_desc: pdpMetaDescription,
    });
  }

  getIsLoading() {
    const {
      id,
      options: { id: requestedId },
    } = this.props;
    return id !== requestedId;
  }

  async requestProduct() {
    const { requestProduct, requestProductBySku, id, setIsLoading, sku } =
      this.props;
    // ignore product request if there is no ID passed
    if (!id) {
      if (sku) {
        requestProductBySku({ options: { sku } });
        setIsLoading(false);
      }
      return;
    }
    requestProduct({ options: { id } });
  }

  containerProps = () => {
    const {
      nbHits,
      isLoading,
      brandDescription,
      brandImg,
      brandName,
      clickAndCollectStores,
    } = this.props;
    const { pdpWidgetsAPIData=[] } = this.state;

    // const { isLoading: isCategoryLoading } = this.state;

    return {
      nbHits,
      isLoading,
      // isCategoryLoading : isLoading,
      brandDescription,
      brandImg,
      brandName,
      clickAndCollectStores,
      pdpWidgetsAPIData,
    };
  };

  render() {
    const { product={} } = this.props;
    const prodPrice =
      product?.price && product?.price[0]
        ? product?.price[0][Object.keys(product?.price[0])[0]][
            "6s_special_price"
          ]
        : product?.price && Object.keys(product?.price)[0] !== "0"
        ? product?.price[Object.keys(product?.price)[0]]["6s_special_price"]
        : null;
    localStorage.setItem("PRODUCT_NAME", JSON.stringify(product.name));
    return Object.keys(product).length ? (
      <PDP
        {...this.containerProps()}
        {...this.props}
        dataForVueCall={{
          sourceProdID: product?.sku,
          sourceCatgID: product?.product_type_6s,
          prodPrice: prodPrice,
        }}
      />
    ) : (
      <div />
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PDPContainer)
);
