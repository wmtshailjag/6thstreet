import PropTypes from 'prop-types';
import { PureComponent } from 'react';

class GoogleTagManagerRouteWrapper extends PureComponent {
    static propTypes = {
        route: PropTypes.string,
        children: PropTypes.node.isRequired
    };

    static defaultProps = {
        route: ''
    };

    componentDidMount() {
        const { route } = this.props;

        window.currentRouteName = route;
    }

    render() {
        const { children } = this.props;

        return children;
    }
}

export default GoogleTagManagerRouteWrapper;
