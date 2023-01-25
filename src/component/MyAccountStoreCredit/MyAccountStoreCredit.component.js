import dateformat from 'dateformat';
import React, { PureComponent } from 'react';

import { StoreCreditData } from 'Util/API/endpoint/StoreCredit/StoreCredit.type';

import './MyAccountStoreCredit.style';

class MyAccountStoreCredit extends PureComponent {
    static propTypes = {
        storeCredit: StoreCreditData.isRequired
    };

    blockClass = 'MyAccountStoreCredit';

    renderBalance() {
        const {
            storeCredit: {
                current_balance: balance
            } = {}
        } = this.props;

        return (
            <div block={ this.blockClass } elem="Balance">
                <span block={ this.blockClass } elem="BalanceText">
                    { __('Current Store Credit:') }
                </span>
                <span block={ this.blockClass } elem="BalanceAmount">
                    { balance || '' }
                </span>
            </div>
        );
    }

    renderTableHead(headers = []) {
        return (
            <thead>
                { headers.map((header, index) => (
                    <th key={index}>{ header }</th>
                )) }
            </thead>
        );
    }

    renderTableRows(rows = []) {
        return (
            <tbody>
                { rows.map((cells = [], index) => (
                    <tr key={index}>
                        { cells.map((value, i) => (
                            <td key={i}>{ value }</td>
                        )) }
                    </tr>
                )) }
            </tbody>
        );
    }

    renderHistory() {
        const {
            storeCredit: {
                history = []
            } = {}
        } = this.props;

        if (!history || !history.length) {
            return null;
        }

        const headers = [
            __('Action'),
            __('Balance Change'),
            __('Balance'),
            __('Date')
        ];
        const rows = history.map((row) => {
            const {
                action, balance_change, balance_amount, updated_at
            } = row;
            let splitDate =  updated_at.split('/')
            let finalUpdatedDate = [splitDate[1],splitDate[0],splitDate[2]].join('/')
            return [
                action,
                balance_change,
                balance_amount,
                finalUpdatedDate
            ];
        });

        return (
            <div block={ this.blockClass } elem="History">
                <div block={ this.blockClass } elem="BlockTitle">
                    { __('Transactions History') }
                </div>
                <table block={ this.blockClass } elem="HistoryTable">
                    { this.renderTableHead(headers) }
                    { this.renderTableRows(rows) }
                </table>
            </div>
        );
    }

    render() {
        return (
            <div block={ this.blockClass }>
                { this.renderBalance() }
                { this.renderHistory() }
            </div>
        );
    }
}

export default MyAccountStoreCredit;
