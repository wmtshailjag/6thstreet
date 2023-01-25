import PropTypes from "prop-types";
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { PureComponent } from "react";
import Image from "Component/Image";

import tabby from "../../style/icons/tabby.png";
import {
  TABBY_ROW_DATA,
  TABBY_SUB_ROW_DATA,
  TABBY_TOOLTIP_INSTALLMENTS,
  TABBY_TOOLTIP_PAY_LATER
} from "./TabbyMiniPopup.config";

import "./TabbyMiniPopup.style.scss";
import { isArabic } from "Util/App";

class TabbyMiniPopup extends PureComponent {
  static propTypes = {
    closeTabbyPopup: PropTypes.func.isRequired,
    content: PropTypes.string,
  };

  static defaultProps = {
    content: "",
  };

  state = {
    isArabic: isArabic(),
  };

  renderPopup() {
    const { closeTabbyPopup, content } = this.props;
    const { isArabic } = this.state;
    return (
      <div
        block="TabbyMiniPopup"
        elem="Wrapper"
        mods={{ twoColumns: content === TABBY_TOOLTIP_PAY_LATER }}
        mix={{
          block: "TabbyMiniPopup",
          elem: "Wrapper",
          mods: {
            payments:
              content === TABBY_TOOLTIP_PAY_LATER ||
              content === TABBY_TOOLTIP_INSTALLMENTS,
              isArabic
          },
        }}
      >
        <div block="TabbyMiniPopup" elem="Content" mods={{isArabic}}>
          <button
            block="TabbyMiniPopup"
            elem="CloseBtn"
            onClick={closeTabbyPopup}
          >
            {" "}
          </button>
          <a href="https://tabby.ai">
            <Image lazyLoad={true} src={tabby} alt={"tabby"} />
          </a>
          {this.renderTabbyContent()}
        </div>
      </div>
    );
  }

  renderTabbyContent = () => {
    const { content } = this.props;

    if (content === TABBY_TOOLTIP_INSTALLMENTS) {
      return this.renderInstallmentsContent();
    }

    if (content === TABBY_TOOLTIP_PAY_LATER) {
      return this.renderPayLaterContent();
    }

    return this.renderPdpContent();
  };

  renderPdpContent() {
    return (
      <>
        <h4>{__("Split your purchase into equal monthly installments")}</h4>
        <div block="TabbyMiniPopup" elem="Columns">
          <div block="TabbyMiniPopup" elem="Column">
            {TABBY_ROW_DATA.map((row, index) => this.renderTabbyPopupRow(row, index))}
          </div>
        </div>
        <p block="TabbyMiniPopup" elem="ContentFooter">
          {__("Sounds good? Just select Tabby at checkout.")}
        </p>
      </>
    );
  }

  renderInstallmentsContent() {
    return (
      <>
        <h4>{__("Split into 4 equal monthly payments")}</h4>
        <div block="TabbyMiniPopup" elem="Columns">
          <div block="TabbyMiniPopup" elem="Column">
            {TABBY_ROW_DATA.map((row, index) => this.renderTabbyPopupRow(row, index))}
          </div>
        </div>
        <p block="TabbyMiniPopup" elem="ContentFooter">
          {__("Sounds good? Just select Tabby at checkout.")}
        </p>
      </>
    );
  }

  renderPayLaterContent() {
    return (
      <>
        <h4>{__("Buy now and pay after delivery")}</h4>
        <div block="TabbyMiniPopup" elem="Columns" mods={{ grid: "two" }}>
          <div block="TabbyMiniPopup" elem="Column">
            {TABBY_SUB_ROW_DATA.map((text, index) =>
              this.renderTabbyPopupSubRow(text, index)
            )}
          </div>
          <div block="TabbyMiniPopup" elem="Column">
            {TABBY_ROW_DATA.map((row, index) => this.renderTabbyPopupRow(row, index))}
          </div>
        </div>
        <p block="TabbyMiniPopup" elem="ContentFooter">
          {__("Sounds good? Select Pay after delivery at checkout.")}
        </p>
      </>
    );
  }

  renderTabbyPopupRow(row, index) {
    const { img, title, text } = row;

    return (
      <div block="TabbyMiniPopup" elem="Row" key={index}>
        <Image lazyLoad={true} src={img} alt="icon" />
        <div block="TabbyMiniPopup" elem="RowText">
          <h5>{title}</h5>
          <p>{text}</p>
        </div>
      </div>
    );
  }

  renderTabbyPopupSubRow(text, index) {
    return (
      <div block="TabbyMiniPopup" elem="SubRow" key={index}>
        <div block="TabbyMiniPopup" elem="SubRowCircle">
          {index + 1}
        </div>
        <div block="TabbyMiniPopup" elem="SubRowText">
          {text}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div block="TabbyMiniPopup" elem="Overlay">
        {this.renderPopup()}
      </div>
    );
  }
}

export default TabbyMiniPopup;
