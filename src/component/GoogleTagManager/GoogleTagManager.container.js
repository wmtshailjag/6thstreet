import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import GoogleTagManager from './GoogleTagManager.component';

const mapStateToProps = (state) => ({
    gtm: state.AppConfig.config.gtm,
    state
});

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GoogleTagManager));
