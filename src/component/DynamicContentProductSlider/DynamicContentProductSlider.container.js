import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import Algolia from "Util/API/provider/Algolia";
import Logger from "Util/Logger";
import DynamicContentProductSlider from "./DynamicContentProductSlider.component";
import { getUUIDToken } from "Util/Auth";

export const mapStateToProps = (_state) => ({
  language: _state.AppState.language,
});

export class DynamicContentProductSliderContainer extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    data_url: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    setImpressions: PropTypes.func,
  };

  static defaultProps = {
    title: "",
    setImpressions: () => { },
  };

  state = {
    products: [],
    isLoading: true,
  };

  constructor(props) {
    super(props);

    this.requestItems();
  }

  containerProps = () => {
    const {
      title,
      data_url,
      language,
      renderMySignInPopup,
      isHomePage = false,
      setLastTapItemOnHome,
      index = 0,
      heading
    } = this.props;

    const { products, isLoading } = this.state;

    return {
      title,
      data_url,
      language,
      isLoading,
      products,
      renderMySignInPopup,
      isHomePage,
      index,
      setLastTapItemOnHome,
      heading
    };
  };
  async requestItems() {
    const { data_url, setImpressions } = this.props;
    const { params } = WebUrlParser.parsePLP(data_url);

    try {
      // request first 10 items from algolia
      const { data: products } = await new Algolia().getPromotions({
        ...params,
        limit: 10,
      });

      setImpressions(products);
      this.setState({
        products,
        isLoading: false,
      });
    } catch (e) {
      // TODO: handle error
      Logger.log(e);

      this.setState({
        products: [],
        isLoading: true,
      });
    }
  }

  render() {
    return <DynamicContentProductSlider {...this.containerProps()} />;
  }
}

export default connect(mapStateToProps)(DynamicContentProductSliderContainer);
