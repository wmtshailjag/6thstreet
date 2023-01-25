/* eslint-disable fp/no-let */
import { useEffect, useState } from "react";
import ContentWrapper from "Component/ContentWrapper/ContentWrapper.component";
import MyAccountOverlay from "Component/MyAccountOverlay";
import "./VuePLP.style";
import "../PLP/PLP.style";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import VueQuery from "../../query/Vue.query";
import BrowserDatabase from "Util/BrowserDatabase";
import { getUUIDToken } from "Util/Auth";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";
import ProductItem from "Component/ProductItem";
import { useDispatch, useSelector } from "react-redux";

export const BreadcrumbsDispatcher = import(
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

const VuePLP = (props) => {
  const stateObj = {
    vueRecommendation: props?.location?.state?.vueProducts || [],
    showPopup: false,
  };

  const [state, setState] = useState(stateObj);

  const gender = useSelector((state) => state.AppState.gender);
  //dispatch
  const dispatch = useDispatch();

  const getRequestOptions = () => {
    let params;
    if (location.search && location.search.startsWith("?q")) {
      const { params: parsedParams } = WebUrlParser.parsePLP(location.href);
      params = parsedParams;
    } else {
      const { params: parsedParams } = WebUrlParser.parsePLPWithoutQuery(
        location.href
      );
      params = parsedParams;
    }
    return params;
  };
  const { q = {} } = getRequestOptions();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const showMyAccountPopup = () => {
    setState({ ...state, showPopup: true });
  };

  const closePopup = () => {
    setState({ ...state, showPopup: false });
  };

  const onSignIn = () => {
    closePopup();
  };

  const request = async () => {
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const vueSliderType = `vue_${q}`;
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    const query = {
      filters: [],
      num_results: 50,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };
    const defaultQueryPayload = {
      userID,
      product_id: params?.product_id || "",
    };
    if (vueSliderType !== "vue_visually_similar_slider") {
      defaultQueryPayload.gender = gender;
    }
    const payload = VueQuery.buildQuery(
      vueSliderType,
      query,
      defaultQueryPayload
    );
    fetchVueData(payload)
      .then((resp) => {
        setState({
          ...state,
          vueRecommendation: resp.data,
        });
      })
      .catch((err) => {
        console.error("fetchVueData error", err);
      });
  };

  useEffect(() => {
    updateBreadcrumbs();
  }, []);

  useEffect(() => {
    if (state?.vueRecommendation?.length === 0) {
      request();
    }
  }, [state?.vueRecommendation]);

  const fetchBreadCrumbsName = (q) => {
    switch (q) {
      case "style_it_slider":
        return __("Style It With");
      case "visually_similar_slider":
        return __("You May Also Like");
      case "recently_viewed_slider":
        return __("Recently Viewed");
      case "top_picks_slider":
        return __("You May Like");
    }
  };

  const updateBreadcrumbs = () => {
    let breadCrumbName = q
        ? fetchBreadCrumbsName(q)
      : "Available products";
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update([{ name: breadCrumbName }], dispatch)
    );
  };

  const renderProduct = (item, index, qid) => {
    const { sku } = item;
    return (
      <ProductItem
        position={index}
        product={item}
        renderMySignInPopup={showMyAccountPopup}
        key={sku}
        page="vuePlp"
        pageType="vuePlp"
        qid={qid}
        isVueData={true}
      />
    );
  };

  const renderProducts = () => {
    const { vueRecommendation } = state;
    var qid = null;
    if (new URLSearchParams(window.location.search).get("qid")) {
      qid = new URLSearchParams(window.location.search).get("qid");
    } else {
      qid = localStorage.getItem("queryID");
    }
    return vueRecommendation.map((i, index) =>
      renderProduct(i, index + 1, qid)
    );
  };

  const renderPage = () => {
    return (
      <div block="PLPPage">
        <ul block="ProductItems">{renderProducts()}</ul>
      </div>
    );
  };

  return (
    <div block="UrlRewrites" id="UrlRewrites">
      <main
        block={"PLP"}
        mix={{ block: "VuePLP", elem: "VuePLPContainer" }}
        id="plp-main-scroll-id"
      >
        <ContentWrapper label={__("Product List Page")}>
          {state.showPopup && (
            <MyAccountOverlay
              isVuePLP={true}
              closePopup={closePopup}
              onSignIn={onSignIn}
              isPopup
            />
          )}
          <div>
            <div block="Products" elem="Wrapper">
              <div block="PLPPagesContainer">
                <div block="PLPPages Products-Lists" id="Products-Lists">
                  {state.vueRecommendation ? renderPage() : null}
                </div>
              </div>
            </div>
          </div>
        </ContentWrapper>
      </main>
    </div>
  );
};

export default VuePLP;
