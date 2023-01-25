import PropTypes from "prop-types";
import { MyAccountReturnCreateItem as SourceComponent } from "Component/MyAccountReturnCreateItem/MyAccountReturnCreateItem.component";
import { CONST_HUNDRED } from "Util/Common";
import { getCountryCurrencyCode } from "Util/Url/Url";
import Price from "Component/Price";

import { formatPrice } from "../../../packages/algolia-sdk/app/utils/filters";

export class MyAccountCancelCreateItem extends SourceComponent {
  static propTypes = {
    displayDiscountPercentage: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    displayDiscountPercentage: true,
  };

  renderDetails() {
    const {
      displayDiscountPercentage,
      item: {
        name,
        color,
        price,
        original_price,
        size: sizeField,
        qty_to_cancel: qty,
      },
    } = this.props;
    let currency_code = getCountryCurrencyCode();
    const size =
      !!sizeField && typeof sizeField === "object"
        ? sizeField.value
        : sizeField;
    let finalPrice = [
      {
        [currency_code]: {
          "6s_base_price": Math.floor(original_price),
          "6s_special_price": Math.floor(price),
          default: Math.floor(price),
          default_formated: `${currency_code} ${Math.floor(price)}`,
        },
      },
    ];
    return (
      <div block="MyAccountReturnCreateItem" elem="Details">
        <h2>{name}</h2>
        <div block="MyAccountReturnCreateItem" elem="DetailsOptions">
          {!!color && (
            <p>
              {__("Color: ")}
              <span>{color}</span>
            </p>
          )}
          {!!qty && (
            <p>
              {__("Qty: ")}
              <span>{+qty}</span>
            </p>
          )}
          {!!size && (
            <p>
              {__("Size: ")}
              <span>{size}</span>
            </p>
          )}
        </div>
        <Price price={finalPrice} renderSpecialPrice={false} />
      </div>
    );
  }

  render() {
    return (
      <div block="MyAccountReturnCreateItem">
        <div block="MyAccountReturnCreateItem" elem="Content">
          {this.renderField({
            type: "CANCELLATION",
          })}
          {this.renderImage()}
          {this.renderDetails()}
        </div>
        <div block="MyAccountReturnCreateItem" elem="Resolution">
          {this.renderReasons()}
          {/* { this.renderResolutions() } */}
        </div>
      </div>
    );
  }
}

export default MyAccountCancelCreateItem;
