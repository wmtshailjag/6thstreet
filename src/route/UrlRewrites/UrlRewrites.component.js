import GTMRouteWrapper from "Component/GoogleTagManager/GoogleTagManagerRouteWrapper.component";
import {
  CATEGORY,
  CMS_PAGE,
  NOT_FOUND,
  PDP as PRODUCT_PAGE,
} from "Component/Header/Header.config";
import Loader from "Component/Loader";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import CmsPage from "Route/CmsPage";
import NoMatch from "Route/NoMatch";
import PDP from "Route/PDP";
import PLP from "Route/PLP";
import {
  TYPE_CATEGORY,
  TYPE_CMS_PAGE,
  TYPE_PRODUCT,
} from "./UrlRewrites.config";
import "./UrlRewrites.style";

class UrlRewrites extends PureComponent {
  constructor(props) {
    super(props);
    window.history.scrollRestoration = "manual";
  }

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.number,
    sku: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    type: "",
    id: -1,
    sku: "",
  };

  typeMap = {
    [TYPE_CATEGORY]: this.renderCategory.bind(this),
    [TYPE_CMS_PAGE]: this.renderCmsPage.bind(this),
    [TYPE_PRODUCT]: this.renderPDP.bind(this),
  };

  render404;

  renderPDP() {
    const { id, string_sku, brandDescription, brandImg, brandName } =
      this.props;
    return (
      <GTMRouteWrapper route={PRODUCT_PAGE}>
        <PDP
          id={id}
          sku={string_sku}
          brandDescription={brandDescription}
          brandImg={brandImg}
          brandName={brandName}
        />
      </GTMRouteWrapper>
    );
  }

  renderCategory() {
    const { brandDescription, brandImg, brandName, query } = this.props;
    return (
      <GTMRouteWrapper route={CATEGORY}>
        <PLP
          brandDescription={brandDescription}
          brandImg={brandImg}
          brandName={brandName}
          query={query}
        />
      </GTMRouteWrapper>
    );
  }

  renderCmsPage() {
    const { id } = this.props;

    return (
      <GTMRouteWrapper route={CMS_PAGE}>
        <CmsPage pageIds={id} />
      </GTMRouteWrapper>
    );
  }

  render() {
    const { type, isLoading } = this.props;

    this.render404 = () => (
      <GTMRouteWrapper route={NOT_FOUND}>
        <NoMatch {...this.props} />
      </GTMRouteWrapper>
    );

    if (isLoading) {
      return (
        <>
          <div block="EmptyPage"></div>
          <Loader isLoading={isLoading} />
        </>
      );
    }
    const renderFunction = this.typeMap[type] || this.render404;

    return (
      <div block="UrlRewrites" id="UrlRewrites">
        {renderFunction()}
      </div>
    );
  }
}

export default UrlRewrites;
