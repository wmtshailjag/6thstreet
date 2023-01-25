/* eslint-disable fp/no-let */
/* eslint-disable prefer-destructuring */
import Field from "Component/Field";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { SelectOptions } from "Type/Field";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import "./LanguageSwitcher.style";

class LanguageSwitcher extends PureComponent {
  static propTypes = {
    languageSelectOptions: SelectOptions.isRequired,
    onLanguageSelect: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
  };

  state = {
    isArabic: isArabic(),
    isMobile: isMobile.any() || isMobile.tablet(),
  };

  getNonSelectedLanguage() {
    const { languageSelectOptions, language } = this.props;
    return languageSelectOptions.filter((obj) => obj.id !== language);
  }

  renderLanguageSelect() {
    const { languageSelectOptions, onLanguageSelect, language } = this.props;

    return (
      <Field
        id="language-switcher-language"
        name="language"
        type="select"
        placeholder={__("Choose language")}
        selectOptions={languageSelectOptions}
        value={language}
        onChange={onLanguageSelect}
      />
    );
  }

  renderLanguageButton() {
    const { onLanguageSelect } = this.props;

    const buttonLabelObject = this.getNonSelectedLanguage();
    let label = buttonLabelObject[0].label;
    if (label === "Arabic") {
      label = "العربية";
    }

    return (
      <button
        /* eslint-disable-next-line */
        onClick={() => onLanguageSelect(buttonLabelObject[0].id)}
      >
        <span>{label}</span>
      </button>
    );
  }

  renderLanguageButtonForMobile() {
    const { onLanguageSelect, language } = this.props;

    const buttonLabelObject = this.getNonSelectedLanguage();
    let label = buttonLabelObject[0].label;
    if (label === "Arabic") {
      label = "العربية";
    }
    const { isArabic } = this.state;

    return (
      <button
        /* eslint-disable-next-line */
        mods={isArabic}
        block={this.props.welcomePagePopup ? "Popup-button" : ""}
      >
        <span
          block={
            language === "en"
              ? "Language-Active"
              : "Language-Inactive"
          }
          onClick={() => onLanguageSelect(buttonLabelObject[0].id)}
        >
          English
        </span>
        <span
          block={
            language === "ar"
              ? "Language-Active"
              : "Language-Inactive"
          }
          onClick={() => onLanguageSelect(buttonLabelObject[0].id)}
        >
          العربية
        </span>
      </button>
    );
  }

  render() {
    const { isArabic } = this.state;
    let k = this.props.welcomePagePopup;
    const { isWelcomeMobileView, welcomePagePopup } = this.props

    return (
      <div block="LanguageSwitcher" mods={{ isArabic }}>
        {this.renderLanguageSelect()}
        {(isWelcomeMobileView || welcomePagePopup) ? this.renderLanguageButtonForMobile() : this.renderLanguageButton()}
      </div>
    );
  }
}

export default LanguageSwitcher;
