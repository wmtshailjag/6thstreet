import PropTypes from "prop-types";
import { PureComponent } from "react";
import { getCountryFromUrl } from "Util/Url/Url";

import Form from "Component/Form";
import Loader from "Component/Loader";
import MyAccountReturnCreateItem from "Component/MyAccountReturnCreateItem";
import { ReturnReasonType, ReturnResolutionType } from "Type/API";
import CheckoutAddressBook from "Component/CheckoutAddressBook";
import "./MyAccountExchangeCreate.style";
import MyAccountAddressPopup from "Component/MyAccountAddressPopup";

export class MyAccountExchangeCreate extends PureComponent {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    onReasonChange: PropTypes.func.isRequired,
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
    const { onItemClick, onReasonChange, resolutions, reasonId, handleChangeQuantity, quantityObj } = this.props;

    if (!item.is_exchangeable) {
      return false;
    }

    return (
      <li block="MyAccountExchangeCreate" elem="Item" key={item_id}>
        <MyAccountReturnCreateItem
          item={item}
          {...this.props}
          exchangableQuantity={quantityObj}
          isExchange={true}
          handleChangeQuantity={handleChangeQuantity}
          reasonId={reasonId}
          onClick={onItemClick}
          onReasonChange={onReasonChange}
          resolutions={resolutions}
        />
      </li>
    );
  };

  renderOrderItems() {
    const {
      items = [],
      onFormSubmit,
      showExchangeAddress,
      changeExchangeAddressStatus,
    } = this.props;
    return (
      <Form
        id="create-exchange"
        mix={{ block: showExchangeAddress ? "showExchangeAddress" : "" }}
        onSubmitSuccess={
          this.isCtcItem() > 0 ? changeExchangeAddressStatus : onFormSubmit
        }
      >
        <ul>{items.map(this.renderOrderItem)}</ul>
        {!showExchangeAddress && this.renderActions()}
      </Form>
    );
  }

  checkOutOfStockStatus = () => {
    const { isOutOfStock } = this.props;
    let outOfStockItems = Object.values(isOutOfStock).filter((item) => {
      if (item === true) {
        return item;
      }
    });
    return outOfStockItems.length === Object.keys(isOutOfStock).length;
  };

  isSizelessProduct = () => {
    const { selectedItems, products, disabledStatusArr, selectedNumber } =
      this.props;
    let sizeLessData = [];
    let sizeLessStatus = false;
    if (Object.keys(selectedItems)?.length > 0) {
      Object.keys(selectedItems)?.filter((item) => {
        if (Object.keys(products).length > 0) {
          const { simple_products } = products[item];
          Object.values(simple_products)?.filter((product) => {
            if (product.size.length === 0 && selectedItems[item] !== false) {
              sizeLessData.push(product);
            }
          });
        }
      });
    }
    if (Object.keys(sizeLessData).length !== 0) {
      if (
        Object.keys(sizeLessData).length < Object.keys(selectedItems).length
      ) {
        if (
          Object.keys(disabledStatusArr).length ===
          selectedNumber - Object.keys(sizeLessData).length
        ) {
          sizeLessStatus = true;
        } else {
          sizeLessStatus = false;
        }
      } else if (
        Object.keys(sizeLessData).length === Object.keys(selectedItems).length
      ) {
        sizeLessStatus = true;
      }
    } else {
      sizeLessStatus = false;
    }
    return sizeLessStatus;
  };

  isCtcItem = () => {
    const { items, selectedAddressIds } = this.props;
    let ctcItem = items.filter((item) => {
      if (item.ctc_item && !selectedAddressIds[item.item_id]) {
        return item;
      }
    });
    return ctcItem.length;
  };

  renderActions() {
    const {
      handleDiscardClick,
      selectedNumber,
      disabledStatus,
      disabledStatusArr,
    } = this.props;
    let outOfStockStatus = this.checkOutOfStockStatus();
    let isSizeLessData = this.isSizelessProduct();
    let isDisabled = isSizeLessData
      ? false
      : outOfStockStatus
        ? true
        : Object.keys(disabledStatusArr).length < selectedNumber
          ? true
          : disabledStatus
            ? true
            : false;
    const submitText =
      this.isCtcItem() > 0
        ? __("Continue")
        : selectedNumber !== 1
          ? __("Exchange %s items", selectedNumber)
          : __("Exchange %s item", selectedNumber);
    return (
      <div>
        <div block="MyAccountExchangeCreate" elem="Actions">
          <button
            block="MyAccountExchangeCreate"
            elem="ButtonDiscard"
            type="button"
            mix={{ block: "Button" }}
            onClick={handleDiscardClick}
          >
            {__("Discard")}
          </button>
          <button
            block="MyAccountExchangeCreate"
            elem="ButtonSubmit"
            type="submit"
            disabled={isDisabled}
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
      <h2 block="MyAccountExchangeCreate" elem="OrderNumber">
        {__("Order #%s", incrementId)}
      </h2>
    );
  }

  renderHeading() {
    return (
      <h2 block="MyAccountExchangeCreate" elem="Heading">
        {__("Select 1 or more items you wish to exchange.")}
      </h2>
    );
  }

  renderExchangeNotPossible() {
    return __("Exchange is not possible at the time");
  }

  onAddressSelect = (addressId = 0, itemId) => {
    const { setSelectedAddress } = this.props;
    setSelectedAddress(addressId, itemId);
  };

  renderAddAdress() {
    const {
      customer,
      showCards,
      closeForm,
      openForm,
      isArabic,
      formContent,
      isMobile,
    } = this.props;
    return (
      <div
        block="MyAccountAddressBook"
        elem="ContentWrapper"
        mods={{ formContent }}
      >
        <MyAccountAddressPopup
          isExchange={true}
          formContent={formContent}
          closeForm={closeForm}
          openForm={openForm}
          showCards={showCards}
          customer={customer}
        />
        {isMobile && (
          <button
            block="MyAccountAddressBook"
            elem="MobileBackButton"
            mods={{ isArabic }}
            onClick={showCards}
          >
            {__("Discard")}
          </button>
        )}
      </div>
    );
  }

  renderButtonLabel() {
    const { isMobile } = this.props;

    return isMobile ? (
      <>
        <span
          style={{ paddingRight: "10px", fontWeight: "bold", fontSize: "16px" }}
        >
          +
        </span>{" "}
        {__("New address")}
      </>
    ) : (
      __("Add new address")
    );
  }

  renderOpenPopupButton = () => {
    const {
      notSavedAddress,
      addresses,
      openFirstPopup,
      formContent,
      isArabic,
      openNewForm,
      setPopStatus,
      isSignedIn,
      isMobile,
    } = this.props;

    const isCountryNotAddressAvailable =
      !addresses.some((add) => add.country_code === getCountryFromUrl()) &&
      !isMobile;
    if (!openFirstPopup && addresses && isSignedIn && notSavedAddress()) {
      setPopStatus();
      openNewForm();
    }

    if (isSignedIn && addresses.length > 0) {
      return (
        <div
          block="MyAccountAddressBook"
          elem="NewAddressWrapper"
          mods={{ formContent, isArabic, isCountryNotAddressAvailable }}
        >
          <button
            block="MyAccountAddressBook"
            elem="NewAddress"
            mix={{
              block: "button primary small",
            }}
            onClick={openNewForm}
          >
            {this.renderButtonLabel()}
          </button>
        </div>
      );
    }

    return null;
  };

  renderExchangeAddress = (itemId) => {
    const {
      addresses,
      hideCards,
      showCards,
      closeForm,
      openForm,
      formContent,
      handleAddressDiscardClick,
      changeExchangeAddressStatus,
      tempSelectedAddressIds,
    } = this.props;
    return (
      <div block="AddressContainer">
        {this.renderOpenPopupButton()}
        {formContent ? (
          this.renderAddAdress()
        ) : (
          <CheckoutAddressBook
            isExchange={true}
            onExchangeAddressSelect={(address) =>
              this.onAddressSelect(address, itemId)
            }
            addresses={addresses}
            formContent={formContent}
            closeForm={closeForm}
            openForm={openForm}
            showCards={showCards}
            hideCards={hideCards}
          />
        )}
        <div block="MyAccountExchangeCreate" elem="Actions">
          <button
            block="MyAccountExchangeCreate"
            elem="ButtonDiscard"
            type="button"
            mix={{ block: "Button" }}
            onClick={handleAddressDiscardClick}
          >
            {__("Discard")}
          </button>
          <button
            block="MyAccountExchangeCreate"
            elem="ButtonSubmit"
            onClick={changeExchangeAddressStatus}
            disabled={tempSelectedAddressIds[itemId] ? false : true}
            mix={{ block: "Button" }}
          >
            {__("Next")}
          </button>
        </div>
      </div>
    );
  };

  renderContent() {
    const { isLoading, incrementId } = this.props;
    if (isLoading) {
      return null;
    }

    if (!isLoading && !incrementId) {
      return this.renderExchangeNotPossible();
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
    const { showExchangeAddress, lastSelectedItem } = this.props;
    return (
      <div block="MyAccountExchangeCreate">
        {this.renderLoader()}
        {this.renderContent()}
        {showExchangeAddress && this.renderExchangeAddress(lastSelectedItem)}
      </div>
    );
  }
}

export default MyAccountExchangeCreate;
