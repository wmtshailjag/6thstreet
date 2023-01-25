import {
    MyAccountReturnSuccess as SourceComponent
} from 'Component/MyAccountReturnSuccess/MyAccountReturnSuccess.component';
import { formatDate } from 'Util/Date';

export class MyAccountCancelCreateSuccess extends SourceComponent {
    renderHeading() {
        const { orderNumber, customerEmail } = this.props;

        return (
            <div block="MyAccountReturnSuccess" elem="Heading">
                <h3>{ __('Order #%s', orderNumber) }</h3>
                <p>{ __('We have received your request.') }</p>
                { !!customerEmail && (
                    <p>
                        { __('An email has been sent to ') }
                        <span>{ customerEmail }</span>
                    </p>
                ) }
            </div>
        );
    }

    renderContent() {
        const { isLoading, cancelNumber } = this.props;

        if (!isLoading && !cancelNumber) {
            return null;
        }

        return (
            <>
                { this.renderHeading() }
                { this.renderItems() }
                { this.renderDetails() }
            </>
        );
    }

    renderDetails() {
        const { cancelNumber, orderNumber, date } = this.props;
        const dateObject = new Date(date.replace(/-/g, "/"));
        const dateString = formatDate('YY/MM/DD at hh:mm', dateObject);

        return (
            <div block="MyAccountReturnSuccess" elem="Details">
                <h3>{ __('Request information') }</h3>
                <p>
                    { __('Cancel ID: ') }
                    <span>{ cancelNumber }</span>
                </p>
                <p>
                    { __('Order ID: ') }
                    <span>{ orderNumber }</span>
                </p>
                <p>
                    { __('Cancel date: ') }
                    <span>{ dateString }</span>
                </p>
            </div>
        );
    }
}

export default MyAccountCancelCreateSuccess;
