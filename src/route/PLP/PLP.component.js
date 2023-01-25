/* eslint-disable fp/no-let */
import ContentWrapper from "Component/ContentWrapper/ContentWrapper.component";
import DynamicContent from "Component/DynamicContent";
import MyAccountOverlay from "Component/MyAccountOverlay";
import PLPDetails from "Component/PLPDetails";
import PLPFilters from "Component/PLPFilters";
import PLPPages from "Component/PLPPages";
import isMobile from "Util/Mobile";
import { isArabic } from "Util/App";
import { PureComponent } from "react";
import CircleItemSliderSubPage from "../../component/DynamicContentCircleItemSlider/CircleItemSliderSubPage";
// import DynamicContentCircleItemSlider from '../../component/DynamicContentCircleItemSlider';
import "./PLP.style";
import { connect } from "react-redux";
import NoMatch from "Route/NoMatch";
import Loader from "Component/Loader";


export const mapStateToProps = (state) => ({
  prevPath: state.PLP.prevPath,
});
export const mapDispatchToProps = (_dispatch) => ({});

export class PLP extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      bannerData: null,
      signInPopUp: "",
      showPopup: false,
      circleBannerUrl: null,
      activeFilters: {},
      isArabic: isArabic(),
    };
  }

  componentDidMount() {
    let bannerData = localStorage.getItem("bannerData");
    let bannerUrl = localStorage.getItem("CircleBannerUrl");
    if (bannerData) {
      let banner = JSON.parse(bannerData);
      this.setState({
        bannerData: banner,
        circleBannerUrl: bannerUrl
      });
    }
  }
  componentWillUnmount() {
    const { resetPLPData } = this.props;
    // resetPLPData();
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
  // componentWillUnmount(){
  //     localStorage.removeItem("bannerData");
  // }

  renderPLPDetails() {
    return <PLPDetails {...this.props} />;
  }

  renderPLPFilters() {

    return <PLPFilters {...this.props} isPLPSortBy={false} />;
  }

  renderPLPSortBy() {
    return <PLPFilters {...this.props} isPLPSortBy={true} />;
  }

  renderPLPPages() {
    const { prevPath = null, updateFiltersState } = this.props;
    return (
      <PLPPages
        {...this.props}
        updateFiltersState={updateFiltersState}
        renderMySignInPopup={this.showMyAccountPopup}
        prevPath={prevPath}
      />
    );
  }

  renderBanner() {
    let isFromCircleItemSlider = window.location.href.includes('plp_config');

    if (this.state.bannerData && isFromCircleItemSlider)
      return (
        <div>
          <CircleItemSliderSubPage bannerData={this.state.bannerData} />
        </div>
      );
  }

  renderPLPWidget = () => {
    const { plpWidgetData } = this.props;
    const { pathname } = location;
    const tagName = pathname
      .replace(".html", "")
      .replace("/", "")
      .replaceAll("/", "_");

    const widget = plpWidgetData.filter((item) => item.tag == tagName);
    if (widget && widget.length == 0) {
      return null;
    }
    const { gender, setLastTapItem } = this.props;

    // return <h1>Plp Widget</h1>;
    return (
      <DynamicContent
        gender={gender}
        content={widget}
        setLastTapItemOnHome={setLastTapItem}
        renderMySignInPopup={this.showMyAccountPopup}
      />
    );
  };

  render() {
    const { signInPopUp } = this.state;
    const { isArabic } = this.state;
    const {pages, isLoading} = this.props;
    if(!isLoading && (!pages["0"] || pages["0"].length === 0 || pages.undefined)){
      return (
        <NoMatch/>
      )
    }
    if (      
      (pages.undefined && pages.undefined.length > 0) ||
      (pages["0"] && pages["0"].length > 0)
    ) {
      
    return (
      <main block="PLP" id="plp-main-scroll-id">
        <ContentWrapper label={__("Product List Page")}>
          {this.renderMySignInPopup()}
          {this.renderPLPDetails()}
          {this.state.bannerData && this.renderBanner()}
          {this.renderPLPWidget()}
          <div>


            <div block="Products" elem="Wrapper">
              {this.renderPLPFilters()}
              {this.renderPLPPages()}

            </div>
            {
              !isMobile.any() && <div block="SortBy" mods={{ isArabic }}>{this.renderPLPSortBy()}</div>
            }

          </div>
        </ContentWrapper>
      </main>
      )}

      return  <Loader isLoading={isLoading} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PLP);
