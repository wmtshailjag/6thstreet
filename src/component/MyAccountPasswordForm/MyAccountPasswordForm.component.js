import PropTypes from 'prop-types';

import Loader from 'Component/Loader';
import {
    MyAccountPasswordForm as SourceMyAccountPasswordForm
} from 'SourceComponent/MyAccountPasswordForm/MyAccountPasswordForm.component';

export class MyAccountPasswordForm extends SourceMyAccountPasswordForm {
    static propTypes = {
        onPasswordChange: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired
    };

    get fieldMap() {
        return {
            currentPassword: {
                type: 'password',
                placeholder: __('Current Password'),
                validation: ['notEmpty']
            },
            newPassword: {
                type: 'password',
                placeholder: __('New password'),
                validation: ['notEmpty']
            }
        };
    }

    renderActions() {
        return (
            <button
              block="Button"
              mix={ { block: 'MyAccount', elem: 'Button' } }
            >
                { __('Save') }
            </button>
        );
    }

    renderLoader() {
        const { isLoading } = this.props;

        return (
            <Loader isLoading={ isLoading } />
        );
    }

    render() {
        return (
            <div block="MyAccountPasswordForm">
                { super.render() }
                { this.renderLoader() }
            </div>
        );
    }
}

export default MyAccountPasswordForm;
