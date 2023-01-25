import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { fetchVueData } from "Util/API/endpoint/Vue/Vue.endpoint";
import { isArabic } from "Util/App";
import BrowserDatabase from "Util/BrowserDatabase";
import VueQuery from "../../query/Vue.query";
import Logger from "Util/Logger";
import DynamicContentVueProductSliderContainer from "../DynamicContentVueProductSlider";
import "./DynamicContentVueSlider.style";
import { getUUIDToken } from "Util/Auth";

export const mapStateToProps = (state) => ({
  gender: state.AppState.gender,
});

class DynamicContentVueSlider extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        label: PropTypes.string,
        link: PropTypes.string,
        plp_config: PropTypes.shape({}), // TODO: describe
      })
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isArabic: isArabic(),
    };
  }

  componentDidMount() {
    let a = this.props;
    this.getPdpWidgetsVueData();
  }

  getPdpWidgetsVueData = () => {
    const { gender } = this.props;
    const userData = BrowserDatabase.getItem("MOE_DATA");
    const customer = BrowserDatabase.getItem("customer");
    const userID = customer && customer.id ? customer.id : null;
    const query = {
      filters: [],
      num_results: 50,
      mad_uuid: userData?.USER_DATA?.deviceUuid || getUUIDToken(),
    };
    let type = this.props.type;
    const payload = VueQuery.buildQuery(type, query, {
      gender,
      userID,
    });
    try {
      fetchVueData(payload)
        .then((resp) => {
          this.setState({
            data: resp.data,
          });
        })
        .catch((err) => {
          console.error("pdp widget vue query catch", err);
        });
    } catch (e) {
      Logger.log(e);
    }
  };

  render() {
    const { isArabic } = this.state;
    const { renderMySignInPopup, index, setLastTapItemOnHome,widgetID } = this.props;
    if (this.state.data?.length === 0 || this.state.data === undefined) {
      return null;
    }
    return (
      <div
        block="VeuSliderWrapper"
        mods={{ isArabic }}
        id={`VeuSliderWrapper${index}`}
      >
        {this.state.data?.length > 0 && (
          <DynamicContentVueProductSliderContainer
            products={this.state.data}
            setLastTapItemOnHome={setLastTapItemOnHome}
            renderMySignInPopup={renderMySignInPopup}
            heading={this.props.layout.title}
            isHome={true}
            pageType={"Home"}
            index={index}
            widgetID={widgetID}
          />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(DynamicContentVueSlider);
