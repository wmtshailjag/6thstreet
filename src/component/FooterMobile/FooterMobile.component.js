import { Component } from 'react';

import './FooterMobile.style';

class FooterMobile extends Component {
    getCurrentYear() {
        return new Date().getFullYear();
    }

    renderCopyright() {
        return (
        <div block="FooterMobile" elem="Copyright">
            &#169;&nbsp;
            { this.getCurrentYear() }
            &nbsp;
            6TH STREET
        </div>
        );
    }

    renderHyperlinks() {
        return (
        <div block="FooterMobile" elem="Hyperlinks">
            <a href="SHIPPING">Privacy &amp; Cookies</a>
            &nbsp;|&nbsp;
            <a href="fdhgh">T&amp;C</a>
        </div>
        );
    }

    render() {
        return (
            <div block="FooterMobile">
                <div block="FooterMobile" elem="Wrapper">
                    { this.renderCopyright() }
                    { this.renderHyperlinks() }
                </div>
            </div>
        );
    }
}

export default FooterMobile;
