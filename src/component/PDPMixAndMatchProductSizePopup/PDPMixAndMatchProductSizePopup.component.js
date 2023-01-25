import PropTypes from "prop-types";
import { PureComponent } from "react";

import Popup from "Component/Popup";
import { isArabic } from "Util/App";

import { PDP_MIX_AND_MATCH_POPUP_ID } from "./PDPMixAndMatchProductSizePopup.config";
import "./PDPMixAndMatchProductSizePopup.style";

class PDPMixAndMatchProductSizePopup extends PureComponent {
  static propTypes = {
    product: PropTypes.object.isRequired,
    onSizeTypeSelect: PropTypes.func.isRequired,
    onSizeSelect: PropTypes.func.isRequired,
    selectedSizeCode: PropTypes.string.isRequired,
    selectedSizeType: PropTypes.string.isRequired,
    addToCart: PropTypes.func.isRequired,
    routeChangeToCart: PropTypes.func.isRequired,
    togglePDPMixAndMatchProductSizePopup: PropTypes.func.isRequired,
  };

  getSizeTypeSelect() {
    const { sizeObject = {}, selectedSizeType, onSizeTypeSelect } = this.props;

    if (sizeObject.sizeTypes !== undefined) {
      const listItems = sizeObject.sizeTypes.map((type = "") => (
        <div
          block="PDPMixAndMatchProductSizePopup"
          elem="SizeTypeOptionContainer"
          key={`MixAndMatch-${type}`}
        >
          <input
            type="radio"
            block="PDPMixAndMatchProductSizePopup"
            elem="SizeTypeOption"
            value={type}
            name="mixAndMatchsizeType"
            id={`MixAndMatch-${type}`}
            checked={selectedSizeType === type}
            onChange={onSizeTypeSelect}
          ></input>
          <label for={`MixAndMatch-${type}`}>{type.toUpperCase()}</label>
        </div>
      ));

      return listItems;
    }

    return null;
  }

  renderSizeTypeSelect() {
    return (
      <div block="PDPMixAndMatchProductSizePopup" elem="SizeTypeSelector">
        {this.getSizeTypeSelect()}
      </div>
    );
  }

  renderSizeOption(simple_products, code, label) {
    const { selectedSizeCode, onSizeSelect } = this.props;

    return (
      <div
        block="PDPMixAndMatchProductSizePopup-SizeSelector"
        elem="SizeOptionContainer"
        key={`MixAndMatch-${code}`}
      >
        <input
          type="radio"
          id={`MixAndMatch-${code}`}
          block="PDPMixAndMatchProductSizePopup"
          elem="SizeOption"
          value={code}
          name="mixAndMatchSize"
          disabled={simple_products[code].quantity === "0"}
          checked={selectedSizeCode === code}
          onChange={onSizeSelect}
        />
        <label for={`MixAndMatch-${code}`}>{label}</label>
      </div>
    );
  }

  getSizeSelect() {
    const {
      product: { simple_products },
      product,
      selectedSizeType,
      sizeObject = {},
    } = this.props;

    if (
      sizeObject.sizeCodes !== undefined &&
      simple_products !== undefined &&
      product[`size_${selectedSizeType}`].length !== 0
    ) {
      return (
        <div
          block="PDPMixAndMatchProductSizePopup-SizeSelector"
          elem="AvailableSizes"
        >
          {sizeObject.sizeCodes.reduce((acc, code) => {
            const label = simple_products[code].size[selectedSizeType];

            if (label) {
              acc.push(this.renderSizeOption(simple_products, code, label));
            }

            return acc;
          }, [])}
        </div>
      );
    }

    return null;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  renderQuantityBasedMessage(qty) {
    switch (qty) {
      case "0":
        return (
          <div
            block="PDPMixAndMatchProductSizePopup-SizeSelector"
            elem="QuantityBasedMessage"
          >
            {this.capitalizeFirstLetter(`${__("out of stock")}`)}
          </div>
        );
      case "1":
        return (
          <div
            block="PDPMixAndMatchProductSizePopup-SizeSelector"
            elem="QuantityBasedMessage"
          >
            {__("1 left in stock")}
          </div>
        );
      case "2" || "3":
        return (
          <div
            block="PDPMixAndMatchProductSizePopup-SizeSelector"
            elem="QuantityBasedMessage"
          >
            {__("Low stock")}
          </div>
        );
      default:
        return null;
    }
  }

  renderSizeSelect() {
    return (
      <div block="PDPMixAndMatchProductSizePopup" elem="SizeSelector">
        {this.getSizeSelect()}
      </div>
    );
  }

  render() {
    return (
      <Popup
        id={PDP_MIX_AND_MATCH_POPUP_ID}
        mix={{
          block: "PDPMixAndMatchProductSizePopup",
          mods: { isArabic: isArabic() },
        }}
        onHide={this.props.togglePDPMixAndMatchProductSizePopup}
      >
        <h3>{__("Select Size")}</h3>
        <div block="PDPMixAndMatchProductSizePopup" elem="SizeSelectContainer">
          {this.renderSizeTypeSelect()}
          {this.renderSizeSelect()}
        </div>
      </Popup>
    );
  }
}

export default PDPMixAndMatchProductSizePopup;
