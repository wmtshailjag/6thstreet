import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import './DynamicContentFooter.style';

class DynamicContentFooter extends PureComponent {
    static propTypes = {

    };

    render() {
        if (this.props.footer.title_color) {
            const titleStyle = {
                color: this.props.footer.title_color
            };
        }

        return (
            <div block="DynamicContentFooter">
                {this.props.footer.title && <p block="DynamicContentFooter-Title">{this.props.footer.title}</p>}
                {this.props.footer.subtitle && <p block="DynamicContentFooter-SubTitle">{this.props.footer.subtitle}</p>}
                {this.props.footer.button_label && <a href={this.props.footer.button_link} block="DynamicContentFooter-Button">{this.props.footer.button_label}</a>}
            </div>

        );
    }
}

export default DynamicContentFooter;