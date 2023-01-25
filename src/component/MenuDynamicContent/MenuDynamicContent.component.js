// import PropTypes from 'prop-types';
import { PureComponent } from "react";
import { DynamicContent as DynamicContentType } from "Util/API/endpoint/StaticFiles/StaticFiles.type";
import { PRODUCT_SLIDER_TYPE } from "Component/DynamicContent/DynamicContent.config";
import Event, { EVENT_GTM_IMPRESSIONS_HOME } from "Util/Event";
import Logger from "Util/Logger";
// import DynamicContent from "Component/DynamicContent";
import DynamicContent from "Component/DynamicContent";
import MenuBanner from "Component/MenuBanner";
import MenuBrands from "Component/MenuBrands";
import MenuGrid from "Component/MenuGrid";

import "./MenuDynamicContent.style";

class MenuDynamicContent extends PureComponent {
  static propTypes = {
    content: DynamicContentType.isRequired,
  };

  state = {
    impressions: [],
    sliderImpressionCount: 0,
  };

  renderMap = {
    banner: MenuBanner,
    grid: MenuGrid,
    slider: MenuBrands,
  };

  renderBlock = (block, i) => {
    const { type, ...restProps } = block;
    const Component = this.renderMap[type];
    const { toggleMobileMenuSideBar } = this.props;

    if (!Component) {
      // TODO: implement all types
      // Logger.log(type, restProps);
      return null;
    }

    // Gather product impressions from all page for gtm
    if (type === PRODUCT_SLIDER_TYPE) {
      restProps.setImpressions = (additionalImpressions = []) => {
        this.setState(({ impressions = [], sliderImpressionCount }) => ({
          impressions: [...impressions, ...additionalImpressions],
          sliderImpressionCount: sliderImpressionCount + 1,
        }));
      };
    }

    return (
      <Component
        toggleMobileMenuSideBar={toggleMobileMenuSideBar}
        setLastTapItemOnHome={this.props.setLastTapItemOnHome}
        {...restProps}
        key={i}
      />
    );
  };

  renderBlocks = () => {
    const { content = [] } = this.props;
    return content.map(this.renderBlock);
  };

  sendImpressions = () => {
    const { impressions, sliderImpressionCount } = this.state;
    const { content } = this.props;
    const sliderCount = content.filter(
      ({ type }) => PRODUCT_SLIDER_TYPE === type
    ).length;

    if (impressions.length && sliderImpressionCount === sliderCount) {
      Event.dispatch(EVENT_GTM_IMPRESSIONS_HOME, { impressions });
      this.setState({ impressions: [] });
    }
  };

  render() {
    return (
      <div block="DynamicContent">
        {this.renderBlocks()}
        {/* {this.sendImpressions()} */}
      </div>
    );
  }
}

export default MenuDynamicContent;
