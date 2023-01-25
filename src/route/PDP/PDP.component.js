/* eslint-disable fp/no-let */
/* eslint-disable max-len */
import PDPDetail from "Component/PDPDetail";
import PDPDetailsSection from "Component/PDPDetailsSection";
import PDPMainSection from "Component/PDPMainSection";
import PDPMixAndMatch from "Component/PDPMixAndMatch";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import NoMatch from "Route/NoMatch";
import "./PDP.style";
import MyAccountOverlay from "Component/MyAccountOverlay";
import isMobile from "Util/Mobile";
import PDPDispatcher from "Store/PDP/PDP.dispatcher";
import Loader from "Component/Loader";
import { connect } from "react-redux";
import { isArabic } from "Util/App";
import { VUE_PAGE_VIEW } from "Util/Event";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { getUUID } from "Util/Auth";

export const mapStateToProps = (state) => ({
  displaySearch: state.PDP.displaySearch,
  prevPath: state.PLP.prevPath,
});

export const mapDispatchToProps = (dispatch) => ({
  showPDPSearch: (displaySearch) =>
    PDPDispatcher.setPDPShowSearch({ displaySearch }, dispatch),
});

class PDP extends PureComponent {
  static propTypes = {
    nbHits: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };
  state = {
    signInPopUp: "",
    isArabic: isArabic(),
    showPopup: false,
    isMobile: isMobile.any() || isMobile.tablet(),
    showPopupField: "",
  };

  componentDidMount() {
    this.renderVueHits();
  }
  showMyAccountPopup = () => {
    this.setState({ showPopup: true });
  };

  closePopup = () => {
    this.setState({ signInPopUp: "", showPopup: false });
  };

  onSignIn = () => {
    this.closePopup();
  };

  renderVueHits() {
    const {
      prevPath = null,
      dataForVueCall={}
    } = this.props;
    const locale = VueIntegrationQueries?.getLocaleFromUrl();
    VueIntegrationQueries?.vueAnalayticsLogger({
      event_name: VUE_PAGE_VIEW,
      params: {
        event: VUE_PAGE_VIEW,
        pageType: "pdp",
        currency: VueIntegrationQueries?.getCurrencyCodeFromLocale(locale),
        clicked: Date.now(),
        uuid: getUUID(),
        referrer: prevPath,
        url: window.location.href,
        sourceProdID: dataForVueCall?.sourceProdID,
        sourceCatgID: dataForVueCall?.sourceCatgID, // TODO: replace with category id
        prodPrice: dataForVueCall?.prodPrice,
      },
    });
  }

  onPDPPageClicked = () => {
    const { showPDPSearch, displaySearch } = this.props;
    if (displaySearch) {
      showPDPSearch(false);
    }
  };
  renderMySignInPopup() {
    const { showPopup } = this.state;
    if (!showPopup) {
      return null;
    }
    return (
      <MyAccountOverlay
        closePopup={this.closePopup}
        onSignIn={this.onSignIn}
        isPopup
      />
    );
  }
  renderMainSection() {
    return (
      <PDPMainSection
        renderMySignInPopup={this.showMyAccountPopup}
        {...this.props}
      />
    );
  }

  renderDetailsSection() {
    return (
      <PDPDetailsSection
        {...this.props}
        renderMySignInPopup={this.showMyAccountPopup}
      />
    );
  }

  renderMixAndMatchSection() {
    return <PDPMixAndMatch renderMySignInPopup={this.showMyAccountPopup} />;
  }

  renderDetail() {
    const { isMobile } = this.state;
    if (isMobile) {
      return null;
    }
    return <PDPDetail {...this.props} />;
  }

  renderSeperator() {
    const { isMobile } = this.state;
    return <div block="Seperator" mods={{ isMobile: !!isMobile }} />;
  }

  renderPDP() {
    return (
      <div block="PDP" onClick={this.onPDPPageClicked}>
        {this.renderMySignInPopup()}
        {this.renderMainSection()}
        {this.renderSeperator()}
        {this.renderMixAndMatchSection()}
        {this.renderDetailsSection()}
        {this.renderDetail()}
      </div>
    );
  }


  render() {
    const { isLoading, product, nbHits } = this.props;
    if (isLoading) {
      return <Loader isLoading={isLoading} />;
    } else if (!isLoading && nbHits > 0 && product) {
      return this.renderPDP();
    }
    else if ((!isLoading && (!nbHits || nbHits === 0) && (Object.keys(product)?.length === 0))) {
      return <NoMatch />
    }
    else {
      return <div />
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PDP);
