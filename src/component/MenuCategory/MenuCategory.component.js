/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { connect } from "react-redux";
import Link from "Component/Link";
import MenuDynamicContent from "Component/MenuDynamicContent";
import { CategoryData } from "Util/API/endpoint/Categories/Categories.type";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import { MOBILE_MENU_SIDEBAR_ID } from "Component/MobileMenuSideBar/MoblieMenuSideBar.config";
import { toggleOverlayByKey } from "Store/Overlay/Overlay.action";
import { setLastTapItemOnHome } from "Store/PLP/PLP.action";

import "./MenuCategory.style";

export const mapDispatchToProps = (_dispatch) => ({
  toggleOverlayByKey: (key) => _dispatch(toggleOverlayByKey(key)),
  setLastTapItemOnHome: (item) => _dispatch(setLastTapItemOnHome(item)),
});
class MenuCategory extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(CategoryData).isRequired,
    categoryKey: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isDefaultCategoryOpen: PropTypes.bool.isRequired,
    closeDefaultCategory: PropTypes.func.isRequired,
  };

  state = {
    isVisible: false,
    isArabic: isArabic(),
  };

  onEnter = this.handleHover.bind(this, true);

  onLeave = this.handleHover.bind(this, false);

  onHoverItemClick = (item) => {
    this.handleHover(false);
    this.props.setLastTapItemOnHome(item)
  }

  handleHover(isVisible) {
    this.setState({ isVisible});
  }
  toggleMobileMenuSideBar = () => {
    const { toggleOverlayByKey } = this.props;

    toggleOverlayByKey(MOBILE_MENU_SIDEBAR_ID);
  };

  renderDynamicContent() {
    const { isVisible } = this.state;
    const { data, isDefaultCategoryOpen, categoryKey, setLastTapItemOnHome } =
      this.props;

    if (!isVisible) {
      if (categoryKey === "new_in" && isDefaultCategoryOpen && isMobile.any()) {
        return (
          <div block="DynamicContent" elem="Wrapper">
            <MenuDynamicContent
              setLastTapItemOnHome={this.onHoverItemClick}
              toggleMobileMenuSideBar={this.toggleMobileMenuSideBar}
              content={data}
            />
          </div>
        );
      }

      return null;
    }
    if (isMobile.any()) {
      return (
        <div block="DynamicContent" elem="Wrapper">
          <MenuDynamicContent
            setLastTapItemOnHome={this.onHoverItemClick}
            toggleMobileMenuSideBar={this.toggleMobileMenuSideBar}
            content={data}
          />
        </div>
      );
    }

    return (
      <div block="DynamicContent" elem="Wrapper">
        <MenuDynamicContent
          setLastTapItemOnHome={this.onHoverItemClick}
          toggleMobileMenuSideBar={this.toggleMobileMenuSideBar}
          content={data}
        />
      </div>
    );
  }

  getMenuCategoryLink() {
    const { link } = this.props;
    const { data = [] } = this.props;
    if (typeof link === "string") {
      return link;
    }
    if (data[0] && data[0].link !== undefined) {
      return data[0].link;
    }
    if (data[0] && data[0].button !== undefined) {
      return data[0].button.link;
    }
    return location.pathname;
  }

  renderLabel() {
    const { label } = this.props;
    const link = this.getMenuCategoryLink();

    return (
      <Link to={link} block="MenuCategory" elem="CategoryLink">
        <div block="MenuCategory" elem="CategoryLink-Label">
          {label}
        </div>
      </Link>
    );
  }

  renderMobileLabel() {
    const { label, closeDefaultCategory } = this.props;

    return (
      <div block="MenuCategory" elem="CategoryLabel">
        <button
          block="MenuCategory"
          elem="CategoryButton"
          onClick={() => {
            closeDefaultCategory();
          }}
        >
          {label}
        </button>
      </div>
    );
  }

  render() {
    const { isVisible, isArabic } = this.state;
    const { isDefaultCategoryOpen, categoryKey } = this.props;

    if (!isMobile.any() && categoryKey === "stories") {
      return null;
    }

    if (isMobile.any()) {
      if (categoryKey === "new_in") {
        return (
          <div
            mix={{
              block: "MenuCategory",
              mods: { isArabic, isVisible, isDefaultCategoryOpen },
            }}
            onMouseEnter={this.onEnter}
            onMouseLeave={this.onLeave}
          >
            {this.renderMobileLabel()}
            {this.renderDynamicContent()}
          </div>
        );
      }

      return (
        <div
          mix={{ block: "MenuCategory", mods: { isArabic, isVisible } }}
          onMouseEnter={this.onEnter}
          onMouseLeave={this.onLeave}
        >
          {this.renderMobileLabel()}
          {this.renderDynamicContent()}
        </div>
      );
    }

    return (
      <div
        mix={{ block: "MenuCategory", mods: { isArabic, isVisible } }}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
      >
        {this.renderLabel()}
        {this.renderDynamicContent()}
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(MenuCategory);
