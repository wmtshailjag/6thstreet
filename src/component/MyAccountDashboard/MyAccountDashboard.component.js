// import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import MyAccountCustomerForm from 'Component/MyAccountCustomerForm';

import './MyAccountDashboard.style';

class MyAccountDashboard extends PureComponent {
    render() {
        return (
            <div block="MyAccountDashboard">
                <MyAccountCustomerForm />
            </div>
        );
    }
}

export default MyAccountDashboard;
