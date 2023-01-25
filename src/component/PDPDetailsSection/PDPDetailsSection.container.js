import { PureComponent } from "react";
import { connect } from "react-redux";
import { Product } from "Util/API/endpoint/Product/Product.type";
import PDPDetailsSection from "./PDPDetailsSection.component";

export const mapStateToProps = (state) => ({
  product: state.PDP.product,
  gender: state.AppState.gender,
  config: state.AppConfig.config,
  country: state.AppState.country,
  language: state.AppState.language,
  pdpWidgetsData: state.AppState.pdpWidgetsData,
});

export class PDPDetailsSectionContainer extends PureComponent {
  static propTypes = {
    product: Product.isRequired,
  };

  containerProps = () => {
    const {
      product,
      pdpWidgetsData,
      gender,
      renderMySignInPopup,
      clickAndCollectStores,
      config,
      country,
      language,
      brandDescription,
      brandImg,
      brandName,
      pdpWidgetsAPIData
    } = this.props;
    return {
      product,
      pdpWidgetsData,
      gender,
      renderMySignInPopup,
      clickAndCollectStores,
      config,
      country,
      language,
      brandDescription,
      brandImg,
      brandName,
      pdpWidgetsAPIData
    };
  };

  render() {
    return <PDPDetailsSection {...this.containerProps()} />;
  }
}

export default connect(mapStateToProps, null)(PDPDetailsSectionContainer);
