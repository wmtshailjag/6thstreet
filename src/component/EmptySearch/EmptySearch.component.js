import PropTypes from "prop-types";
import { PureComponent } from "react";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";
import BrowserDatabase from "Util/BrowserDatabase";
import VueQuery from "../../query/Vue.query";
import Recommendations from "../Recommendations/Recommendations.container";
import "./EmptySearch.style";
import noProduct from "./icons/no_product.png";
import Image from "Component/Image";
import { getUUIDToken } from "Util/Auth";

class EmptySearch extends PureComponent {
  static propTypes = {
    query: PropTypes.string.isRequired,
  };
  state = {
    products: [],
    isVueData: true,
  };

  getRecommendedProducts() {
    const { gender } = this.props;
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const query = {
      filters: [],
      num_results: 50,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };

    const payload = VueQuery.buildQuery("vue_browsing_history_slider", query, {
      gender,
    });
  
    fetchVueData(payload)
      .then((resp) => {
        this.setState({
          products: resp.data,
        });
      })
      .catch((err) => {
        console.error("fetchVueData error", err);
      });
  }

  componentDidMount() {
    this.getRecommendedProducts();
  }

  renderSearchQuery() {
    const { query } = this.props;

    return (
      <div block="EmptySearch" elem="SearchQuery">
        <p>
          {__("No result found for")} &nbsp;
          <span>{query}</span>
          {__(" but here are few suggestions")}
        </p>
      </div>
    );
  }

  renderStaticContent() {
    return (
      <div block="EmptySearch" elem="StaticContent">
        <Image lazyLoad={true} src={noProduct} alt="no product" />
        <p block="EmptySearch" elem="Sorry">
          {__("Sorry, we couldn't find any Product!")}
        </p>
        <p block="EmptySearch" elem="Check">
          {__("Please check the spelling or try searching something else")}
        </p>
      </div>
    );
  }
  renderRecommendationsPages() {
    const { products, isVueData } = this.state;
    return <Recommendations products={products} isVueData={isVueData} />;
  }

  render() {
    return (
      <div block="EmptySearch">
        {this.renderSearchQuery()}
        {/* {this.renderStaticContent()} */}
        {this.renderRecommendationsPages()}
      </div>
    );
  }
}

export default EmptySearch;
