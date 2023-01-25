import {
    CheckoutDeliveryOptions as SourceCheckoutDeliveryOptions
} from 'SourceComponent/CheckoutDeliveryOptions/CheckoutDeliveryOptions.component';

export class CheckoutDeliveryOptions extends SourceCheckoutDeliveryOptions {
    renderShippingMethods() {
        const { shippingMethods = [] } = this.props;

        if (!shippingMethods.length) {
            return this.renderNoDeliveryOptions();
        }

        return shippingMethods.map(this.renderDeliveryOption);
    }
}

export default CheckoutDeliveryOptions;
