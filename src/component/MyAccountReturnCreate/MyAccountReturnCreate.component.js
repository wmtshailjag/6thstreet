import PropTypes from "prop-types";
import { PureComponent } from "react";
import Field from "Component/Field";

import Form from "Component/Form";
import Loader from "Component/Loader";
import MyAccountReturnCreateItem from "Component/MyAccountReturnCreateItem";
import { ReturnReasonType, ReturnResolutionType } from "Type/API";

import "./MyAccountReturnCreate.style";

export class MyAccountReturnCreate extends PureComponent {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    onReasonChange: PropTypes.func.isRequired,
    onResolutionChange: PropTypes.func.isRequired,
    onFormSubmit: PropTypes.func.isRequired,
    incrementId: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        item_id: PropTypes.string,
        reason_options: PropTypes.arrayOf(ReturnReasonType),
      })
    ),
    isLoading: PropTypes.bool.isRequired,
    selectedNumber: PropTypes.number.isRequired,
    handleDiscardClick: PropTypes.func.isRequired,
    resolutions: PropTypes.arrayOf(ReturnResolutionType),
  };

  static defaultProps = {
    items: [],
    incrementId: "",
    resolutions: [],
  };

  
  renderOrderItem = (item) => {
    const { item_id } = item;
    const { onItemClick, onResolutionChange, onReasonChange, resolutions, quantityObj,handleChangeQuantity,isArabic } =
      this.props;

    if (!item.is_returnable) {
      return false;
    }
    
    return (
      <li block="MyAccountReturnCreate" elem="Item" key={item_id}>
        <MyAccountReturnCreateItem
          item={item}
          isArabic={isArabic}
          quantityObj={quantityObj}
          handleChangeQuantity={handleChangeQuantity}
          onClick={onItemClick}
          onResolutionChange={onResolutionChange}
          onReasonChange={onReasonChange}
          resolutions={resolutions}
        />
      </li>
    );
  };

  renderOrderItems() {
    const { items = [], onFormSubmit } = this.props;
    return (
      <Form id="create-return" onSubmitSuccess={onFormSubmit}>
        <ul>{items.map(this.renderOrderItem)}</ul>
        {this.renderActions()}
      </Form>
    );
  }

  renderResolutions() {
    const { onResolutionChange, resolutions, onResolutionChangeValue } =
      this.props;
    const { pathname = "" } = location;
    const isCancel = pathname.includes("/return-item/cancel");
    const resolutionValue = resolutions.map(({ id, label }) => ({
      id,
      label,
      value: isCancel ? id + 1 : id,
    }));
    return (
      <Field
        type="select"
        id={`return_resolution`}
        name={`return_resolution`}
        placeholder={__("Select a resolution")}
        mix={{ block: "MyAccountReturnCreateItem", elem: "Resolutions" }}
        onChange={onResolutionChangeValue}
        selectOptions={resolutionValue}
      />
    );
  }

  renderActions() {
    const { handleDiscardClick, selectedNumber, reasonId } = this.props;
    const submitText =
      selectedNumber !== 1
        ? __("Return %s items", selectedNumber)
        : __("Return %s item", selectedNumber);
    return (
      <div>
        {this.renderResolutions()}
        <div block="MyAccountReturnCreate" elem="Actions">
          <button
            block="MyAccountReturnCreate"
            elem="ButtonDiscard"
            type="button"
            mix={{ block: "Button" }}
            onClick={handleDiscardClick}
          >
            {__("Discard")}
          </button>
          <button
            block="MyAccountReturnCreate"
            elem="ButtonSubmit"
            type="submit"
            mix={{ block: "Button" }}
          >
            {submitText}
          </button>
        </div>
      </div>
    );
  }

  renderLoader() {
    const { isLoading } = this.props;

    return <Loader isLoading={isLoading} />;
  }

  renderOrderNumber() {
    const { incrementId } = this.props;

    return (
      <h2 block="MyAccountReturnCreate" elem="OrderNumber">
        {__("Order #%s", incrementId)}
      </h2>
    );
  }

  renderHeading() {
    return (
      <h2 block="MyAccountReturnCreate" elem="Heading">
        {__("Select 1 or more items you wish to return.")}
      </h2>
    );
  }

  renderReturnNotPossible() {
    return __("Return is not possible at the time");
  }

  renderContent() {
    const { isLoading, incrementId } = this.props;
    if (isLoading) {
      return null;
    }

    if (!isLoading && !incrementId) {
      return this.renderReturnNotPossible();
    }

    return (
      <>
        {this.renderOrderNumber()}
        {this.renderHeading()}
        {this.renderOrderItems()}
      </>
    );
  }

  render() {
    return (
      <div block="MyAccountReturnCreate">
        {this.renderLoader()}
        {this.renderContent()}
      </div>
    );
  }
}

export default MyAccountReturnCreate;
