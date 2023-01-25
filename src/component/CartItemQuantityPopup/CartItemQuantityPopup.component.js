import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import ClickOutside from 'Component/ClickOutside';

import { isArabic } from 'Util/App';
import { Select } from 'Component/Icons';
import { CART_ITEM_QUANTITY_POPUP_ID } from './CartItemQuantityPopup.config';
import './CartItemQuantityPopup.style';

class CartItemQuantityPopup extends PureComponent {
    static propTypes = {
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
        toggle: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired
    };

    renderQuantityOptions() {
        const { max, value, onChange } = this.props;

        return (
            Array.from(Array(max))
            .map((_, index) => {
                const isSelected = index+1 === value
                return (
                    <button
                        key={ index + 1 }
                        block="QuantityButton"
                        mods={{
                            isSelected
                        }}
                        onClick = { () => onChange(index+1) }
                    >
                        { index + 1 }
                        {
                            isSelected && <Select />
                        }
                    </button>
                );
            })
        );
    };
    
    handleClickOutside() {
        const { toggle } = this.props;
        toggle();
    }

    render() {
        return (
            <ClickOutside onClick={ this.handleClickOutside.bind(this) }>
                <div
                    id={ CART_ITEM_QUANTITY_POPUP_ID }
                    mix={{
                        block: 'CartItemQuantityPopup',
                        mods: { isArabic: isArabic() } 
                    }}
                >
                    <h3>{ __( "SELECT QUANTITY" ) }</h3>
                    <div block="CartItemQuantityPopup" elem="QuantitySelectContainer">
                        { this.renderQuantityOptions() }
                    </div>
                </div>
            </ClickOutside>
        );
    }
}

export default CartItemQuantityPopup;
