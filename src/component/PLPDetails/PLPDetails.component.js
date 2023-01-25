// import PropTypes from 'prop-types';
import PropTypes from "prop-types";
import { PureComponent } from "react";
import favIcon from "Style/icons/favorites.svg";
import shareIcon from "Style/icons/share.svg";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import "./PLPDetails.style";
import Image from "Component/Image";

class PLPDetails extends PureComponent {
  static propTypes = {
    brandDescription: PropTypes.string,
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  state = {
    isMobile: isMobile.any() || isMobile.tablet(),
    isArabic: isArabic(),
    
  };

  renderBrandImage = () => {
    const { brandImg, brandName } = this.props;
    return (
      <div block="PLPDetails" elem="BrandImage">
        <Image lazyLoad={true} src={brandImg}  alt={ brandName ?  brandName : "brandImg"}/>
      </div>
    )
  };

  renderBrandName = () => {
    const { brandName } = this.props;
    return (
      <h2 block="PLPDetails" elem="BrandName">
        {brandName}
      </h2>
    );
  };

  renderBrandHtml = () => {
    const { brandDescription } = this.props;
    return (
      <div className={this.state.isToggleOn ? 'PLPDetails-viewmore' : 'PLPDetails-viewless'}>
        <p
          block="PLPDetails"
          elem="BrandHTML"
          dangerouslySetInnerHTML={{ __html: brandDescription }}
        />
        { brandDescription && !brandDescription.offsetHeight < 45 ? 
          <button onClick={this.handleClick}>
            {this.state.isToggleOn ? 'Read more' : 'Read less'}
          </button>
          : ""
        }
      </div>
      
    );
  };

  renderActionButtons = () => {
    return (
      <div block="PLPDetails" elem="ShareIcon">
        <Image lazyLoad={true} src={shareIcon} alt={__("Share Icon")} />
        <Image lazyLoad={true} src={favIcon} alt={__("Favorite Icon")} />
      </div>
    );
  };

  renderContent = () => {
    const { isMobile } = this.state;
    const { brandDescription, brandName } = this.props;
    if (!brandDescription || !brandName) {
      return null;
    }
    if (isMobile) {
      return null;
    }

    return (
      <div block="PLPDetails" elem="Wrapper">
        
        {/* {!brandImg ? "" :
          <div block="PLPDetails" elem="BrandImage">
            {isMobile ? "" : this.renderBrandImage()}
          </div>
        } */}
        <div block="PLPDetails" elem={`BrandDescription`}>
          {/* {this.renderActionButtons()} */}
          {isMobile ? "" : this.renderBrandName()}
          {isMobile ? "" : this.renderBrandHtml()}
        </div>




      </div>
    );
  };

  render() {
    const { isArabic } = this.state;
    return (
      <div block="PLPDetails" mods={{ isArabic }}>
        {this.renderContent()}
      </div>
    );
  }
}

export default PLPDetails;
