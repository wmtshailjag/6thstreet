import PropTypes from "prop-types";
import { PureComponent } from "react";

import Link from "Component/Link";
import { Return } from "Util/API/endpoint/Return/Return.type";
import { EVENT_MOE_RETURN_REQUEST_CLICK } from "Util/Event";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import "./MyAccountReturnListItem.style";

class MyAccountReturnListItem extends PureComponent {
  static propTypes = {
    return: Return.isRequired,
    linkTo: PropTypes.string.isRequired,
  };

  renderIncrementId() {
    const {
      return: { return_increment_id },
    } = this.props;

    return (
      <span block="MyAccountReturnListItem" elem="OrderIncrement">
        {return_increment_id}
      </span>
    );
  }

  renderDate() {
    const {
      return: { date },
    } = this.props;

    return (
      <span block="MyAccountReturnListItem" elem="Date">
        {date}
      </span>
    );
  }

  renderStatus() {
    const {
      return: { status },
    } = this.props;

    return (
      <span block="MyAccountReturnListItem" elem="Status">
        {status}
      </span>
    );
  }

  renderOrder() {
    const {
      return: { order_id },
    } = this.props;

    return (
      <div block="MyAccountReturnListItem" elem="OrderNumber">
        {order_id}
      </div>
    );
  }

  sendMoeEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
  }

  render() {
    const { linkTo } = this.props;
    return (
      <Link
        block="MyAccountReturnListItem"
        to={linkTo}
        onClick={() => this.sendMoeEvents(EVENT_MOE_RETURN_REQUEST_CLICK)}
      >
        {this.renderIncrementId()}
        {this.renderDate()}
        {this.renderOrder()}
        {this.renderStatus()}
      </Link>
    );
  }
}

export default MyAccountReturnListItem;
