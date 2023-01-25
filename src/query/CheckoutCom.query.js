import { Field } from 'Util/Query';

export class CheckoutComQuery {
    /**
     * Get apple pay config query
     * @return {Field}
     */
    getApplePayConfigQuery() {
        return new Field('storeConfig')
            .addField(
                new Field('checkout_com').addFieldList([this._getApplePayPaymentConfigQuery()])
            );
    }

    /**
     * Get apple pay payment method config query
     * @return {Field}
     * @private
     */
    _getApplePayPaymentConfigQuery() {
        return new Field('apple_pay')
            .addFieldList([
                'merchant_id',
                'button_style',
                'supported_networks',
                'merchant_capabilities'
            ]);
    }

    /**
     * Get apple pay verification query
     * @param validationUrl
     * @returns {*}
     */
    getVerifyCheckoutComApplePayQuery(validationUrl) {
        return new Field('verifyCheckoutComApplePay')
            .addArgument('validation_url', 'String!', validationUrl)
            .addFieldList(this._getApplePayPaymentStatusMessageFields());
    }

    /**
     * Get apple pay status fields
     * @returns {string[]}
     * @private
     */
    _getApplePayPaymentStatusMessageFields() {
        return [
            'nonce',
            'operationalAnalyticsIdentifier',
            'displayName',
            'domainName',
            'merchantIdentifier',
            'epochTimestamp',
            'expiresAt',
            'merchantSessionIdentifier',
            'signature',
            'statusMessage',
            'status'
        ];
    }
}

export default new CheckoutComQuery();
