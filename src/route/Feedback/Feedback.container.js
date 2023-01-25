import { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { DEFAULT_STATE_NAME } from "Component/NavigationAbstract/NavigationAbstract.config";
import { TOP_NAVIGATION_TYPE } from "Store/Navigation/Navigation.reducer";
import { changeNavigationState } from "Store/Navigation/Navigation.action";
import { showNotification } from "Store/Notification/Notification.action";
import { postFeedback } from "Util/API/endpoint/Feedback/Feedback.endpoint";
import { updateMeta } from "Store/Meta/Meta.action";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import Event,{EVENT_GTM_FOOTER, EVENT_FEEDBACK_FORM_SUBMIT } from "Util/Event";
import Logger from "Util/Logger";
import Feedback from "./Feedback.component";

export const BreadcrumbsDispatcher = import(
  "Store/Breadcrumbs/Breadcrumbs.dispatcher"
);

export const mapStateToProps = (state) => ({
    headerState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
    config: state.AppConfig.config,
    country: state.AppState.countr
});

export const mapDispatchToProps = (dispatch) => ({
  changeHeaderState: (state) =>
    dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
  updateBreadcrumbs: (breadcrumbs) =>
    BreadcrumbsDispatcher.then(({ default: dispatcher }) =>
      dispatcher.update(breadcrumbs, dispatch)
    ),
  updateMeta: (meta) => dispatch(updateMeta(meta)),
  showNotification: (type, message) =>
    dispatch(showNotification(type, message)),
});

export class FeedbackContainer extends PureComponent {
  static propTypes = {
    updateBreadcrumbs: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    updateMeta: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { updateMeta } = this.props;
    updateMeta({ title: __("Feedback") });
  }

  componentDidMount() {
    this.updateBreadcrumbs();
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
    const { updateBreadcrumbs } = this.props;
    const breadcrumbs = [
      {
        url: "/feedback",
        name: __("Feedback"),
      },
      {
        url: "/",
        name: __("Home"),
      },
    ];

    updateBreadcrumbs(breadcrumbs);
  }
  sendMOEEvents() {
    Moengage.track_event(EVENT_FEEDBACK_FORM_SUBMIT, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
    Event.dispatch(EVENT_GTM_FOOTER,EVENT_FEEDBACK_FORM_SUBMIT);
  }
  async onSubmit(data) {
    const {
      firstname,
      lastname,
      email,
      phoneNumber: telephone,
      comment,
    } = data;

    const { showNotification } = this.props;

    try {
      const response = await postFeedback({
        "contactForm[name]": `${firstname} ${lastname}`,
        "contactForm[email]": email,
        "contactForm[telephone]": telephone,
        "contactForm[comment]": comment,
      });
      if (response) {
        if (response.type == "success"){
          this.sendMOEEvents();
        }
        showNotification(response.type ? "success" : "error", response.message);
      }
    } catch (err) {
      Logger.error(err);
    }
  }

  render() {
    return <Feedback onSubmit={this.onSubmit.bind(this)} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackContainer);
