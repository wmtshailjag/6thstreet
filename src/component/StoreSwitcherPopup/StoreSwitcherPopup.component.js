/* eslint-disable prefer-destructuring */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable fp/no-let */
import PropTypes from "prop-types";
import { PureComponent } from "react";
import Image from "Component/Image";
import { isArabic } from "Util/App";
import WelcomeScreen from "Component/WelcomeScreen";
import { SelectOptions } from "Type/Field";
import ClickOutside from "Component/ClickOutside";
import "./StoreSwitcherPopup.style";

class StoreSwitcherPopup extends PureComponent {
  static propTypes = {
    countrySelectOptions: SelectOptions.isRequired,
    closePopup: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
  };



  render() {
    const { countrySelectOptions, country, closePopup } = this.props;

    return (
      <ClickOutside onClick={this.props.closePopup}>
        <div block="StoreSwitcherPopup">
          <div block="StoreSwitcherPopup" elem="Container" mods={{ isArabic: isArabic() }}>
            {/* <Image lazyLoad={true}
            mix={{
              block: "StoreSwitcherPopup",
              elem: "Image",
            }}
            src="https://static.6media.me/static/version1600395563/frontend/6SNEW/6snew/en_US/images/store-selector-background.png"
            alt="Store"
          /> */}
            <WelcomeScreen
              countrySelectOptions={countrySelectOptions}
              country={country}
              closePopup={closePopup}
            />
          </div>
        </div>
      </ClickOutside>
    );
  }
}

export default StoreSwitcherPopup;
