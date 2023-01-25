import Link from "@scandipwa/scandipwa/src/component/Link/Link.component";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { MixType } from "Type/Common";
import "./GenderButton.style";

class GenderButton extends PureComponent {
  static propTypes = {
    onGenderClick: PropTypes.func.isRequired,
    onGenderEnter: PropTypes.func.isRequired,
    onGenderLeave: PropTypes.func.isRequired,
    isCurrentGender: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    urlKey: PropTypes.string.isRequired,
    isUnsetStyle: PropTypes.bool.isRequired,
    mix: MixType,
  };

  static defaultProps = {
    mix: {},
  };

  render() {
    const {
      onGenderClick,
      onGenderEnter,
      onGenderLeave,
      isCurrentGender,
      mix,
      label,
      urlKey,
      isUnsetStyle,
    } = this.props;

    if (!urlKey) {
      return null;
    }
    if(urlKey ==="all"){
      return (
        <Link
          block="GenderButton"
          elem="Link"
          name={label}
          to={`/`}
        >
          <button
            mix={mix}
            name={label}
            block="GenderButton"
            elem="Button"
            mods={{ isCurrentGender, isUnsetStyle }}
            onClick={onGenderClick}
            onMouseEnter={onGenderEnter}
            onMouseLeave={onGenderLeave}
          >
            {label}
          </button>
        </Link>
      );
    }

    return (
      <Link
        block="GenderButton"
        elem="Link"
        name={label}
        to={`/${urlKey.toLowerCase()}.html`}
      >
        <button
          mix={mix}
          name={label}
          block="GenderButton"
          elem="Button"
          mods={{ isCurrentGender, isUnsetStyle }}
          onClick={onGenderClick}
          onMouseEnter={onGenderEnter}
          onMouseLeave={onGenderLeave}
        >
          {label}
        </button>
      </Link>
    );
  }
}

export default GenderButton;
