import { MyAccountQuery as SourceMyAccountQuery } from 'SourceQuery/MyAccount.query';
import { Field } from 'Util/Query';

export class MyAccountQuery extends SourceMyAccountQuery {
    _getCustomerFields() {
        return [
            'created_at',
            'group_id',
            'prefix',
            'firstname',
            'middlename',
            'lastname',
            'suffix',
            'email',
            'default_billing',
            'default_shipping',
            'dob',
            'taxvat',
            'id',
            'is_subscribed',
            this._getAddressesField()
        ];
    }

    getSignInMutation(options) {
        const { email, password } = options;

        return new Field('generateCustomerToken')
            .addArgument('email', 'String!', email)
            .addArgument('password', 'String!', password)
            .addField('token');
    }
}

export default new MyAccountQuery();
