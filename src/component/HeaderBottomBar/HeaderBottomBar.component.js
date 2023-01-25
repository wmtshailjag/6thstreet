import PropTypes from "prop-types";

import HeaderMenu from "Component/HeaderMenu";
import HeaderSearch from "Component/HeaderSearch";
import NavigationAbstract from "Component/NavigationAbstract/NavigationAbstract.component";
import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import { getLocaleFromUrl } from "Util/Url/Url";

import "./HeaderBottomBar.style";

class HeaderBottomBar extends NavigationAbstract {
  static propTypes = {
    newMenuGender: PropTypes.string,
  };

  static defaultProps = {
    newMenuGender: "women",
  };

  state = {
    isArabic: isArabic(),
  };

  stateMap = {
    [DEFAULT_STATE_NAME]: {
      menu: true,
    },
  };

  renderMap = {
    menu: this.renderMenu.bind(this),
    search: this.renderSearch.bind(this),
  };

  renderMenu() {
    const { newMenuGender } = this.props;
    const customLocale = getLocaleFromUrl();
    if(!customLocale){
      return null;
    }
    if (isMobile.any()) {
      return <HeaderMenu key="menu" newMenuGender={newMenuGender} />;
    } 

    return <HeaderMenu key="menu" newMenuGender={newMenuGender} />;
  }

  renderSearch() {
    const { isArabic } = this.state;
    if (isMobile.any()) {
      return (
        <div
          key="search"
          mix={{
            block: "HeaderSearch",
            elem: "Container",
            mods: { isArabic },
          }}
        >
          <HeaderSearch key="search" />
        </div>
      );
    }

    // return <HeaderSearch key="search" />;
    return null;
  }

  render() {
    const { isArabic } = this.state;

    return (
      <div mix={{ block: "HeaderBottomBar", mods: { isArabic } }}>
        <div
          mix={{
            block: "HeaderBottomBar",
            elem: "Content",
            mods: { isArabic },
          }}
        >
          {this.renderNavigationState()}
        </div>
      </div>
    );
  }
}

export default HeaderBottomBar;
