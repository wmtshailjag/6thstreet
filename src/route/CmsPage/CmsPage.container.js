import { CMS_PAGE } from "Component/Header/Header.config";
import CmsPageQuery from "Query/CmsPage.query";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { LOADING_TIME } from "Route/CmsPage/CmsPage.config";
import {
  CmsPageContainer as SourceCmsPageContainer,
  mapDispatchToProps,
  mapStateToProps,
} from "SourceRoute/CmsPage/CmsPage.container";
import { debounce, fetchQuery } from "Util/Request";
import { appendWithStoreCode } from "Util/Url";
import CmsPage from "./CmsPage.component";

export class CmsPageContainer extends SourceCmsPageContainer {
  async requestPage() {
    const { id } = this.getRequestQueryParams();
    const { cmsPage } = await fetchQuery(CmsPageQuery.getQuery({ id }));
    this.onPageLoad(cmsPage);
  }

  onPageLoad = (cmsPage) => {
    const {
      location: { pathname },
      updateMeta,
      setHeaderState,
      updateBreadcrumbs,
    } = this.props;

    const { content_heading, meta_title, title } = cmsPage;

    debounce(this.setOfflineNoticeSize, LOADING_TIME)();

    updateBreadcrumbs(cmsPage);
    updateMeta({ title: meta_title || title });

    if (pathname !== appendWithStoreCode("/") && pathname !== "/") {
      setHeaderState({
        name: CMS_PAGE,
        title: content_heading,
        onBackClick: () => history.goBack(),
      });
    }

    this.setState({ page: cmsPage, isLoading: false });
  };

  render() {
    return <CmsPage {...this.props} {...this.state} />;
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withRouter(CmsPageContainer))
);
