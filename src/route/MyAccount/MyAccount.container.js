import StoreCredit from "Component/StoreCredit";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  BreadcrumbsDispatcher,
  mapDispatchToProps as sourceMapDispatchToProps,
  mapStateToProps as sourceMapStateToProps,
  MyAccountContainer as SourceMyAccountContainer,
  MyAccountDispatcher,
} from "SourceRoute/MyAccount/MyAccount.container";
import { updateMeta } from "Store/Meta/Meta.action";
import { setIsMobileTabActive } from "Store/MyAccount/MyAccount.action";
import StoreCreditDispatcher from "Store/StoreCredit/StoreCredit.dispatcher";
import {
  ADDRESS_BOOK,
  CLUB_APPAREL,
  CONTACT_HELP,
  DASHBOARD,
  MY_ORDERS,
  MY_WISHLIST,
  RETURN_ITEM,
  EXCHANGE_ITEM,
  SETTINGS_SCREEN,
  STORE_CREDIT,
  WALLET_PAYMENTS,
} from "Type/Account";
import { MY_ACCOUNT_URL } from "./MyAccount.config";
import ClubApparelDispatcher from "Store/ClubApparel/ClubApparel.dispatcher";
export { BreadcrumbsDispatcher, MyAccountDispatcher };
import { customerType } from "Type/Account";
import { ClubApparelMember } from "Util/API/endpoint/ClubApparel/ClubApparel.type";

export const mapStateToProps = (state) => ({
  ...sourceMapStateToProps(state),
  customer: state.MyAccountReducer.customer,
  is_exchange_enabled: state.AppConfig.is_exchange_enabled,
  clubApparel: state.ClubApparelReducer.clubApparel,
  mobileTabActive: state.MyAccountReducer.mobileTabActive,
  country: state.AppState.country,
  language: state.AppState.language,
  payload: state.PopupReducer.popupPayload
});

export const mapDispatchToProps = (dispatch) => ({
  ...sourceMapDispatchToProps(dispatch),
  getMember: (id) => ClubApparelDispatcher.getMember(dispatch, id),
  setMobileTabActive: (value) => dispatch(setIsMobileTabActive(value)),
  setMeta: (meta) => dispatch(updateMeta(meta)),
  updateStoreCredit: () => StoreCreditDispatcher.getStoreCredit(dispatch),
});

export const exchangeTabMap = {
  [EXCHANGE_ITEM]: {
    url: "/exchange-item",
    name: __("My Return/Exchange"),
    alternateName: __("Cancel an item"),
    alternateSecondName: __("Exchange an item"),
    className: "",
  },
};
export const returnState = {
  [RETURN_ITEM]: {
    url: "/return-item",
    name: __("My Returns"),
    alternateName: __("Cancel an item"),
    alternateSecondName: __("Return an item"),
    className: "",
  },
}

export const exchangeReturnState = {
  [RETURN_ITEM]: {
    url: "/return-item",
    name: __("My Return/Exchange"),
    alternateName: __("Cancel an item"),
    alternateSecondName: __("Exchange an item"),
    className: "",
  },
}
export const tabMap = {
  [STORE_CREDIT]: {
    url: "/storecredit/info",
    name: <StoreCredit />,
    alternativePageName: __("Balance"),
    linkClassName: "StoreCreditLink",
  },
  [CLUB_APPAREL]: {
    url: "/club-apparel",
    name: __("Club Apparel Loyalty"),
    className: "MobileHide",
  },
  [DASHBOARD]: {
    url: "/dashboard",
    name: __("My Profile"),
    className: "",
  },
  [MY_ORDERS]: {
    url: "/my-orders",
    name: __("My Orders"),
    className: "MobileHide",
  }
};

export const tabMap2 = {
  [MY_WISHLIST]: {
    url: "/my-wishlist",
    name: __("My wishlist"),
    className: "",
  },
  [ADDRESS_BOOK]: {
    url: "/address-book",
    name: __("My Address Book"),
    className: "",
  },
  [WALLET_PAYMENTS]: {
    url: "/wallet-payments",
    name: __("Payment Methods"),
    className: "",
  },
  [SETTINGS_SCREEN]: {
    url: "/settings",
    name: __("Settings"),
    className: "DesktopHide",
  },
  [CONTACT_HELP]: {
    url: "/contact-help",
    name: __("Contact & Help"),
    className: "DesktopHide",
  },
};

export class MyAccountContainer extends SourceMyAccountContainer {
  static propTypes = {
    ...SourceMyAccountContainer.propTypes,
    mobileTabActive: PropTypes.bool.isRequired,
    setMobileTabActive: PropTypes.func.isRequired,
    setMeta: PropTypes.func.isRequired,
    updateStoreCredit: PropTypes.func.isRequired,
    clubApparel: ClubApparelMember.isRequired,
    getMember: PropTypes.func.isRequired,
    customer: customerType,
    country: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
  };


  static defaultProps = {
    customer: null,
  };

  state = {
    clubApparel: null,
    exchangeTabMap: exchangeTabMap,
  };

  static navigateToSelectedTab(props, state = {}) {
    const {
      match: { params: { tab: historyActiveTab = DASHBOARD } = {} } = {},
    } = props;

    const { activeTab } = state;

    if (activeTab !== historyActiveTab) {
      return { activeTab: historyActiveTab };
    }

    return null;
  }


  changeActiveTab(activeTab) {
    const { history,is_exchange_enabled } = this.props;
    let newTabMap = is_exchange_enabled? {...tabMap,...exchangeReturnState,...tabMap2}:
    {...tabMap,...returnState,...tabMap2}
    const { [activeTab]: { url } } = newTabMap;
    history.push(`${ MY_ACCOUNT_URL }${ url }`);
}

  static getDerivedStateFromProps(props, state) {
    const { clubApparel } = props;
    const { clubApparel: currentClubApparel } = state;
    const isNavigateToSelectedTab = MyAccountContainer.navigateToSelectedTab(
      props,
      state
    );
    if (clubApparel !== currentClubApparel) {
      if (isNavigateToSelectedTab) {
        return {
          clubApparel,
          ...MyAccountContainer.navigateToSelectedTab(props, state),
        };
      }
      return { clubApparel };
    }
    return { ...MyAccountContainer.navigateToSelectedTab(props, state) };
  }

  componentDidMount() {
    const {
      setMeta,
      updateStoreCredit,
      customer: { id },
      getMember,
    } = this.props;

    updateStoreCredit();
    setMeta({ title: __("My Account") });
    if (id) {
      getMember(id);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      customer: { id },
      country,
      language,
      getMember,
    } = this.props;

    const {
      customer: { id: prevId },
      country: prevCountry,
      language: prevLanguage,
    } = prevProps;

    if (prevId !== id || prevCountry !== country || prevLanguage !== language) {
      getMember(id);
    }
  }

  updateBreadcrumbs() {
    const { updateBreadcrumbs,is_exchange_enabled } = this.props;
    const { activeTab } = this.state;
    let finalTabMap;
    let newTabMap = is_exchange_enabled? {...tabMap,...exchangeReturnState,...tabMap2}:
    {...tabMap,...returnState,...tabMap2}
    if (activeTab === EXCHANGE_ITEM) {
      finalTabMap = exchangeTabMap[activeTab];
    } else {
      finalTabMap = newTabMap[activeTab];
    }
    const { url, name, alternativePageName } = finalTabMap;
    updateBreadcrumbs([
      { url: `${MY_ACCOUNT_URL}${url}`, name: alternativePageName || name },
      { name: __("My Account"), url: `${MY_ACCOUNT_URL}/${DASHBOARD}` },
      { name: __("Home"), url: "/" },
    ]);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountContainer);
