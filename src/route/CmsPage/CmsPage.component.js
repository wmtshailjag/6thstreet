import Html from "Component/Html";
import { CmsPage as SourceCmsPage } from "SourceRoute/CmsPage/CmsPage.component";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";
import "./CmsPage.extended.style";

export class CmsPage extends SourceCmsPage {
  state = {
    isArabic: isArabic(),
    isMobile: isMobile.any(),
  };

  renderTitle() {
    if (location.pathname.match(/faq/)) {
      return "FAQ";
    } else if (location.pathname.match(/shipping-policy/)) {
      return "Shipping Policy";
    } else {
      return "Return Policy";
    }
  }

  renderTitleMobile() {
    if (location.href.match(/private-sales/)){
      return "Private sales";
    }else if (location.href.match(/about-apparel-group/)){
      return "About Apparel Group";
    }else if (location.href.match(/reward-points/)){
      return "Reward Points";
    }else if (location.href.match(/try-again-later/)){
      return "Try Again Later";
    }else if (location.href.match(/liked-products/)){
      return "Liked Products";
    }else{
      return null;
    }
  }

  renderCloseButton() {
    const { isArabic } = this.state;
    const { history } = this.props;

    if (location.href.match(/source=mobileApp/)) {
      return null
    }
    return (
      <button
        elem="Button"
        block="MyAccountMobileHeader"
        onClick={() => history.goBack()}
        mods={{ isArabic }}
      />
    );
  }

  shouldUrlRewritesHaveNoPadding() {
    const UrlRewrites = document.getElementById("UrlRewrites");
    UrlRewrites.classList.add("noPadding");
  }
  renderContent() {
    const {
      isLoading,
      page: { content },
      location: { pathname = "" },
    } = this.props;
    const { isMobile } = this.state;

    if (isLoading) {
      return (
        <>
          <div block="CmsPage" elem="SectionPlaceholder" />
          <div block="CmsPage" elem="SectionPlaceholder" />
          <div block="CmsPage" elem="SectionPlaceholder" />
        </>
      );
    }

    if (!isLoading && !content) {
      return null;
    }

    const tws = document.createElement("html");
    tws.innerHTML = content;

    const textChild = tws?.lastChild?.firstChild?.firstChild?.firstChild;
    const result = String(textChild?.innerHTML)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const cmsBlock = pathname.slice(1);
    const toggleArr = document.querySelectorAll(".faq-page-toggle") || [];

    if (toggleArr && toggleArr.length > 0) {
      toggleArr.forEach((toggle) => {
        toggle.addEventListener("click", (e) => {
          const label = e.target.nextSibling;
          const fieldsetContainer = e.target.nextSibling.nextSibling;
          label.classList.toggle("open");
          fieldsetContainer.classList.toggle("open");
        });
      });
    }

    if (location.href.match(/private-sales/) || location.href.match(/about-apparel-group/) || location.href.match(/reward-points/) || location.href.match(/try-again-later/) || location.href.match(/liked-products/)) {

      return (
        <div block={cmsBlock}>
          {isMobile ? (
          <div block="MyAccountMobileHeader" elem="TabOptionHeader">
            {this.renderCloseButton()}
            <h1 block="MyAccountMobileHeader" elem="Heading">
              {this.renderTitleMobile()}
            </h1>
          </div>
          ) : null}
          <div className="cmspagecontentwrap">
            <Html content={content} />
          </div>
        </div>
      );
    }

    return (
      <div block={cmsBlock}>
        {this.shouldUrlRewritesHaveNoPadding()}
        {isMobile ? (
          <div block="MyAccountMobileHeader" elem="TabOptionHeader">
            {this.renderCloseButton()}
            <h1 block="MyAccountMobileHeader" elem="Heading">
              {this.renderTitle()}
            </h1>
          </div>
        ) : null}
        <Html content={result} />
      </div>
    );
  }
}
export default CmsPage;
