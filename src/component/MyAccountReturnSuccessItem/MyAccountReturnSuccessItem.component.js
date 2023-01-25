import PropTypes from 'prop-types';
import { MyAccountReturnCreateItem } from 'Component/MyAccountReturnCreateItem/MyAccountReturnCreateItem.component';
import { ReturnSuccessItemType } from 'Type/API';

import { formatPrice } from '../../../packages/algolia-sdk/app/utils/filters';

import './MyAccountReturnSuccessItem.style';

export class MyAccountReturnSuccessItem extends MyAccountReturnCreateItem {
    static propTypes = {
        item: ReturnSuccessItemType.isRequired,
        displayDiscountPercentage: PropTypes.bool.isRequired
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
                qty: qtyRegular,
                qty_requested: qtyRequested
            } = {}
        } = this.props;
        const size = typeof sizeField === 'string' ? sizeField : (sizeField || {}).value;
        const qty = qtyRegular || qtyRequested;

        return (
            <div block="MyAccountReturnSuccessItem" elem="Details">
                <h2>{ name }</h2>
                <div block="MyAccountReturnSuccessItem" elem="DetailsOptions">
                    { !!color && (
                        <p>
                            { __('Color: ') }
                            <span>{ color }</span>
                        </p>
                    ) }
                    { !!qty && (
                        <p>
                            { __('Qty: ') }
                            <span>{ +qty }</span>
                        </p>
                    ) }
                    { !!size && (
                        <p>
                            { __('Size: ') }
                            <span>{ size }</span>
                        </p>
                    ) }
                </div>
                <p block="MyAccountReturnSuccessItem" elem="Price">
                    {`${formatPrice(+price)}`}
                    {/* <span
                      block="MyAccountReturnSuccessItem"
                      elem="PriceRegular"
                      mods={ { isDiscount: !!(price < original_price) } }
                    >
                        { `${ formatPrice(+original_price) }` }
                    </span>
                    { !!(price < original_price) && (
                        <>
                            {
                                displayDiscountPercentage &&
                                <span block="MyAccountReturnSuccessItem" elem="PriceDiscountPercent">
                                    { `(-${ (+price / +original_price).toFixed() }%)` }
                                </span>
                            }
                            <span block="MyAccountReturnSuccessItem" elem="PriceDiscount">
                                { `${ formatPrice(+price) }` }
                            </span>
                        </>
                    ) } */}
                </p>
            </div>
        );
    }

    render() {
        return (
            <div block="MyAccountReturnSuccessItem">
                <p>{ __('Item details') }</p>
                <div block="MyAccountReturnSuccessItem" elem="Content">
                    { this.renderImage() }
                    { this.renderDetails() }
                </div>
            </div>
        );
    }
}
export default MyAccountReturnSuccessItem;
