import {
    CheckoutDeliveryOptionsContainer as SourceCheckoutDeliveryOptionsContainer
} from 'SourceComponent/CheckoutDeliveryOptions/CheckoutDeliveryOptions.container';

export class CheckoutDeliveryOptionsContainer extends SourceCheckoutDeliveryOptionsContainer {
    static _getDefaultMethod(props) {
        const { shippingMethods = [] } = props;
        const [{ method_code } = [{}]] = shippingMethods;
        return method_code;
    }

    static getDerivedStateFromProps(props, state) {
        const { shippingMethods = [] } = props;
        const { prevShippingMethods = [] } = state;
        if (shippingMethods.length !== prevShippingMethods.length && shippingMethods.length !== 0) {
            const selectedShippingMethodCode = CheckoutDeliveryOptionsContainer._getDefaultMethod(props);

            return {
                selectedShippingMethodCode,
                prevShippingMethods: shippingMethods
            };
        }

        return null;
    }
}

export default CheckoutDeliveryOptionsContainer;
