import Image from "Component/Image";
import Link from "Component/Link";
import { MOBILE_MENU_SIDEBAR_ID } from "Component/MobileMenuSideBar/MoblieMenuSideBar.config";
import { PureComponent } from "react";
import { hideActiveOverlay } from "SourceStore/Overlay/Overlay.action";
import {
  CategoryButton,
  CategoryItems,
} from "Util/API/endpoint/Categories/Categories.type";
import { isArabic } from "Util/App";
import "./MenuGrid.style";
import { setPrevPath } from "Store/PLP/PLP.action";
import { connect } from "react-redux";

export const mapDispatchToProps = (_dispatch) => ({
  setPrevPath: (prevPath) => _dispatch(setPrevPath(prevPath))
});

class MenuGrid extends PureComponent {
  state = {
    isArabic: isArabic(),
    isAllShowing: true,
  };

  static propTypes = {
    button: CategoryButton,
    items: CategoryItems.isRequired,
  };

  static defaultProps = {
    button: {},
  };

  constructor(props) {
    super(props);
    this.showAllCategories = this.showAllCategories.bind(this);
  }

  onItemClick = () => {
    const { toggleOverlayByKey, setPrevPath,setLastTapItemOnHome } = this.props;
    setLastTapItemOnHome("")
    toggleOverlayByKey(MOBILE_MENU_SIDEBAR_ID);
    setPrevPath(window.location.href);
  };

  renderItem = (item, i) => {
    const { image_url, label, link } = item;

    if (!link) {
      return null;
    }

    const updatedLink = link.match(
      /\/men|\/women|\/kids-baby_boy-boy-girl-baby_girl|\/kids/
    )
      ? link
          .replace("/men.html", ".html")
          .replace("/women.html", ".html")
          .replace("/kids-baby_boy-boy-girl-baby_girl.html", ".html")
          .replace("/kids.html", ".html")
          .replace("/home.html", ".html")
      : link;

    return (
      <Link
        to={link}
        key={i}
        title={label}
        onClick={this.onItemClick}
      >
        <Image lazyLoad={true} src={image_url} width="80px" height="80px" ratio="custom" alt={label ? label : "MenuGridImages"} />
        <div block="MenuGrid" elem="ItemLabel">
          {label}
        </div>
      </Link>
    );
  };

  renderItems() {
    const { items = [] } = this.props;
    return items.map(this.renderItem);
  }

  renderDesktopButton() {
    const {
      button: { label = "", link },
    } = this.props;

    const linkTo = {
      pathname: link,
      state: { plp_config: {} },
    };

    return (
      <Link to={linkTo} onClick={this.hideMenu}>
        {label}
      </Link>
    );
  }

  hideMenu = () => {
    const { toggleOverlayByKey } = this.props;
    hideActiveOverlay();
    toggleOverlayByKey(MOBILE_MENU_SIDEBAR_ID);
  };

  showAllCategories() {
    this.setState(({ isAllShowing }) => ({ isAllShowing: !isAllShowing }));
  }

  renderViewAllButton() {
    const {
      button: { link = "/" },
    } = this.props;

    return (
      <button block="ViewAll" elem="Button">
        <Link to={link} onClick={this.onItemClick}>
          <span>{__("view all")}</span>
        </Link>
      </button>
    );
  }

  renderSubcategories() {
    const { isArabic } = this.state;

    return (
      <>
        <span block="MenuGrid" elem="Title">
          {this.props.title}
          {/* {__("Shop by product")} */}
        </span>
        {this.renderViewAllButton()}
        <div
          mix={{
            block: "MenuGrid-Column",
            elem: "Content",
            mods: { isArabic },
          }}
        >
          {this.renderDesktopButton()}
          {this.renderItems()}
        </div>
      </>
    );
  }

  render() {
    const { isArabic } = this.state;
    const { isAllShowing } = this.state;

    return (
      <div block="MenuGrid">
        <div
          mix={{
            block: "MenuGrid",
            elem: "Content",
            mods: { isArabic },
          }}
        >
          <div block="MenuGrid" elem="Columns">
            <div
              mix={{
                block: "MenuGrid",
                elem: "Column",
                mods: { isAllShow: isAllShowing },
              }}
            >
              {this.renderSubcategories()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(MenuGrid);