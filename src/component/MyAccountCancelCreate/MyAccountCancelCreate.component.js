import Form from 'Component/Form';
import Field from 'Component/Field';

import MyAccountCancelCreateItem from 'Component/MyAccountCancelCreateItem';
import { MyAccountReturnCreate } from 'Component/MyAccountReturnCreate/MyAccountReturnCreate.component';

import './MyAccountCancelCreate.style';

class MyAccountCancelCreate extends MyAccountReturnCreate {
    renderOrderItem = (item) => {
        const { item_id } = item;
        const {
            onItemClick,
            onResolutionChange,
            onReasonChange,
            resolutions
        } = this.props;

        return (
            <li block="MyAccountReturnCreate" elem="Item" key={item_id}>
                <MyAccountCancelCreateItem
                    item={item}
                    onClick={onItemClick}
                    onResolutionChange={onResolutionChange}
                    onReasonChange={onReasonChange}
                    resolutions={resolutions}
                />
            </li>
        );
    };

    renderHeading() {
        return (
            <h2 block="MyAccountReturnCreate" elem="Heading">
                {__('Select 1 or more items you wish to cancel.')}
            </h2>
        );
    }

    renderOrderItems() {
        const { items = [], onFormSubmit } = this.props;
        return (
            <Form id="create-cancel" onSubmitSuccess={onFormSubmit}>
                <ul>
                {items.map((item) => {
                    if (+item?.qty_to_cancel > 0 && +item?.qty_canceled <= +item?.qty_to_cancel) {
                        return this.renderOrderItem(item);
                    }
                })}
                </ul>
                {this.renderActions()}
            </Form>
        );
    }

    renderResolutions() {
        const {
            onResolutionChangeValue,
            resolutions,
        } = this.props;
        if (!!!resolutions?.length) {
            return null;
        }
        const resolutionValue = resolutions.map(({ id, label }) => ({
            id,
            label,
            value: id + 1
        }));
        return (
            <Field
                type="select"
                id={`cancel_resolution`}
                name={`cancel_resolution`}
                placeholder={__('Select a resolution')}
                mix={{ block: 'MyAccountReturnCreateItem', elem: 'Resolutions' }}
                onChange={onResolutionChangeValue}
                selectOptions={resolutionValue}
            />
        );
    }

    isDisabled() {
        const { selectedNumber, reasonId } = this.props;
        if (selectedNumber !== 0) {
            if (reasonId) {
                return false;
            } else {
                return true;
            }
        } else {
            return true
        }
    }
    renderActions() {
        const { handleDiscardClick, selectedNumber, resolutions, resolutionId, reasonId } = this.props;
        const itemString = selectedNumber === 1 ? __('item') : __('items');
        const submitText = selectedNumber <= 0
            ? __('Cancel') : `${__('Cancel')} ${selectedNumber} ${itemString}`;
        return (
            <div>
                {this.renderResolutions()}
                <div block="MyAccountReturnCreate" elem="Actions">
                    <button
                        block="MyAccountReturnCreate"
                        elem="ButtonDiscard"
                        type="button"
                        mix={{ block: 'Button' }}
                        onClick={handleDiscardClick}
                    >
                        {__('Discard')}
                    </button>
                    <button
                        block="MyAccountReturnCreate"
                        elem="ButtonSubmit"
                        type="submit"
                        mix={{ block: 'Button' }}
                        disabled={
                            this.isDisabled()
                        }
                    >
                        {submitText}
                    </button>
                </div>
            </div>
        );
    }
}

export default MyAccountCancelCreate;
