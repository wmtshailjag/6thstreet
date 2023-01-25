/* eslint-disable import/prefer-default-export */
import check from './icons/check.svg';
import clock from './icons/clock.svg';
import procent from './icons/procent.svg';

export const TABBY_TOOLTIP_PAY_LATER = 'pay_later';
export const TABBY_TOOLTIP_INSTALLMENTS = 'installments';
export const TABBY_TOOLTIP_PDP = 'pdp';

export const TABBY_ROW_DATA = [
    {
        title: __('No fees'),
        text: __('Zero interest and no hidden fees.'),
        img: procent
    },
    {
        title: __('No credit card? No problem!'),
        text: __('Use any debit card to repay.'),
        img: check
    },
    {
        title: __('Quick and easy'),
        text: __('Simply verify your details and complete your checkout.'),
        img: clock
    }
];

export const TABBY_SUB_ROW_DATA = [
    __('Select Pay after delivery and complete your order'),
    __('Receive your package and enjoy it'),
    __('Pay 14 days later using your debit or credit card by logging into your Tabby account')
];
