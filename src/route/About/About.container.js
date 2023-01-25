import { PureComponent } from "react";
import About from "./About.component";
import { isArabic } from "Util/App";
import isMobile from "Util/Mobile";

import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { setGender } from "Store/AppState/AppState.action";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { updateMeta } from "Store/Meta/Meta.action";

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
    gender: state.AppState.gender,
    config: state.AppConfig.config,
    breadcrumbs: state.BreadcrumbsReducer.breadcrumbs,
});

export const mapDispatchToProps = (dispatch) => ({

    updateBreadcrumbs: (breadcrumbs) => {
      BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
        dispatcher.update(breadcrumbs, dispatch)
      );
    },
    changeHeaderState: (state) =>
      dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    setGender: (gender) => dispatch(setGender(gender)),
    updateMeta: (meta) => dispatch(updateMeta(meta)),
});

export class AboutContainer extends PureComponent {

    static propTypes = {
        updateBreadcrumbs: PropTypes.func.isRequired,
        changeHeaderState: PropTypes.func.isRequired,
        setGender: PropTypes.func.isRequired,
        config: PropTypes.object.isRequired,
        breadcrumbs: PropTypes.array.isRequired,
        gender: PropTypes.string.isRequired,
        updateMeta: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        // this.setMetaData();
        this.cmpRef = React.createRef();
        this.scrollerRef = React.createRef();
        this.itemRef = React.createRef();
        this.state = {
          isArabic: isArabic(),
          isMobile: isMobile.any() || isMobile.tablet(),
          isTablet: isMobile.tablet(),
          prevPathname: "",
          currentLocation: "",
        };
    }

    componentDidMount() {
        const {
          location: { pathname },
          updateMeta
        } = this.props;

        this.setState({ currentLocation: pathname });
        updateMeta({ title: __("About 6THStreet") });
        this.updateBreadcrumbs();
    }

    componentDidUpdate(prevProps) {
        this.updateHeaderState();
    }

    updateHeaderState() {
        const { changeHeaderState } = this.props;
    
        changeHeaderState({
            name: DEFAULT_STATE_NAME,
            isHiddenOnMobile: true,
        });
    }

    updateBreadcrumbs() {
        const {
        updateBreadcrumbs,
        setGender,
        } = this.props;

        const breadcrumbs = [
            {
            url: "",
            name: __("About us"),
            },
            {
                url: "/",
                name: __("Home"),
            },
            // ...productBreadcrumbs,
        ];

        updateBreadcrumbs(breadcrumbs);
    }

    render() {
        return (
            <About {...this.props} />
        )
    }
}

// export default AboutContainer;

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(AboutContainer)
  );