import {
    MyAccountReturnSuccess as SourceComponent
} from 'Component/MyAccountReturnSuccess/MyAccountReturnSuccess.component';
import MyAccountReturnSuccessItem from 'Component/MyAccountReturnSuccessItem';
import { formatDate } from 'Util/Date';

import { STATUS_DENIED, STATUS_TITLE_MAP } from './MyAccountReturnView.config';

import './MyAccountReturnView.style';

export class MyAccountReturnView extends SourceComponent {
    renderHeading() {
        const { orderNumber } = this.props;

        return (
            <div block="MyAccountReturnSuccess" elem="Heading">
                <h3>{ __('Order #%s', orderNumber) }</h3>
            </div>
        );
    }

    renderDetails() {
        const { date, status, orderNumber } = this.props;
        const dateObject = new Date(date.replace(/-/g, "/"));
        const dateString = formatDate('DD/MM/YY at hh:mm', dateObject);
        const { [status]: title } = STATUS_TITLE_MAP;

        return (
            <div block="MyAccountReturnView" elem="Details">
                <p block="MyAccountReturnView" elem="DetailsDate">
                    { __('Date Requested: ') }
                    <span>{dateString.split('at').join(__('at'))}</span>
                </p>
                <div block="MyAccountReturnView" elem="SubDetails">
                    <p block="MyAccountReturnView" elem="Status" mods={ { isDenied: status === STATUS_DENIED } }>
                        { __('Status: ') }
                        <span>{ title || status }</span>
                    </p>
                    <p block="MyAccountReturnView" elem="Order">
                        { __('Order ID: ') }
                        <span>{ orderNumber }</span>
                    </p>
                </div>
            </div>
        );
    }

    renderItems() {
        const { items = [] } = this.props;

        return (
            <div block="MyAccountReturnView" elem="Items" mix={ { block: 'MyAccountReturnSuccess', elem: 'Items' } }>
                { items.map((item) => (
                    <div key={ item.id }>
                        <MyAccountReturnSuccessItem
                          item={ item }
                        />
                        <div block="MyAccountReturnView" elem="Reason">
                            <h3>{ __('Reason') }</h3>
                            { !!(item.reason || []).length && <p>{ item.reason[0].value }</p> }
                        </div>
                    </div>
                )) }
            </div>
        );
    }

    renderContent() {
        const { isLoading, returnNumber } = this.props;

        if (isLoading) {
            return null;
        }

        if (!isLoading && !returnNumber) {
            return this.renderReturnNotPossible();
        }

        return (
            <>
                { this.renderHeading() }
                { this.renderDetails() }
                { this.renderItems() }
            </>
        );
    }
}

export default MyAccountReturnView;
