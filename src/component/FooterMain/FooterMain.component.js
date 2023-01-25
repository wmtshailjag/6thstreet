import { Fragment, PureComponent } from "react";

import FooterCustomerSupport from "Component/FooterCustomerSupport";
import Link from "Component/Link";
import { isArabic } from "Util/App";
import { connect } from "react-redux";
import { URLS } from "Util/Url/Url.config";
import facebook from "./icons/facebook.svg";
import instagram from "./icons/instagram.svg";
import twitter from "./icons/twitter.svg";
import pinterest from "./icons/pinterest.svg";
import snapchat from "./icons/snapchat.svg";
import tiktok from "./icons/tiktok.svg";
import youtube from "./icons/youtube.svg";
import Image from "Component/Image";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";
import Event, {
  EVENT_INSTA_FOLLOW,
  EVENT_FB_FOLLOW,
  EVENT_TIKTOK_FOLLOW,
  EVENT_SNAPCHAT_FOLLOW,
  EVENT_TWITTER_FOLLOW,
  EVENT_PINTEREST_FOLLOW,
  EVENT_YOUTUBE_FOLLOW,
  EVENT_CONSUMER_RIGHTS_CLICK,
  EVENT_SHIPPING_INFO_CLICK,
  EVENT_RETURN_INFO_CLICK,
  EVENT_FEEDBACK_CLICK,
  EVENT_PRIVACY_POLICY_CLICK,
  EVENT_DISCLAIMER_CLICK,
  EVENT_ABOUT6S_CLICK,
  EVENT_GTM_FOOTER,
} from "Util/Event";
import Loader from "Component/Loader";
import "./FooterMain.style";

export const mapStateToProps = (state) => ({
  config: state.AppConfig.config,
  country: state.AppState.country,
  language: state.AppState.language,
});
class FooterMain extends PureComponent {
  state = {
    isArabic: isArabic(),
    isLoad: false,
  };

  getRootURL = () => {
    const { language, country } = this.props;
    if (language && country && URLS) {
      const locale = `${language}-${country.toLowerCase()}`;
      return URLS[locale] || "";
    }
    return "";
  };

  linksMap = [
    {
      title: __("About"),
      items: [
        {
          name: isArabic() ? (
            <span>معلومات عن 6thستريت</span>
          ) : (
            <div block="About">
              <span>{__("About")}</span>
              &nbsp;
              <span>6</span>
              <span>{__("TH")}</span>
              <span>{__("S")}</span>
              <span>{__("TREET")}</span>
            </div>
          ),
          href: "/about",
        },
        {
          name: __("Consumer Rights"),
          href: "https://www.consumerrights.ae/en/Pages/default.aspx",
        },
        {
          name: __("Disclaimer"),
          href: "/disclaimer",
        },
        {
          name: __("Privacy Policy"),
          href: "/privacy-policy",
        },
      ],
    },
    {
      title: __("Customer Service"),
      items: [
        {
          name: __("Shipping Information"),
          href: "/shipping-policy",
        },
        {
          name: __("Returns Information"),
          href: "/return-information",
        },
        {
          name: __("Order Tracking"),
          href: "https://6thstreet.clickpost.in/",
        },
        {
          name: __("FAQs"),
          href: "/faq",
        },
        {
          name: __("Feedback"),
          href: "/feedback",
        },
      ],
    },
    {
      title: __("Download The App"),
      items: [
        {
          id_app: "App1",
          app_store:
            "https://static.6media.me/static/version1600320971/frontend/6SNEW/6snew/en_US/images/apple-store-badge.svg",
          app_onclick:
            "https://apps.apple.com/ro/app/6thstreet-com/id1370217070",
          id_google: "Google1",
          google_play:
            "https://static.6media.me/static/version1600320042/frontend/6SNEW/6snew/en_US/images/google-play-badge.svg",
          google_onclick:
            "https://play.google.com/store/apps/details?id=com.apparel.app6thstreet",
          id_gallery: "Gallery1",
          app_gallery:
            "https://6thstreetmobileapp-eu-c.s3.eu-central-1.amazonaws.com/resources/20190121/en-ae/d/icon_huaweiappgallery.svg",
          gallery_onclick: "https://appgallery.huawei.com/#/app/C102324663",
          header: isArabic() ? (
            <h4>شاركونا الآن</h4>
          ) : (
            <h4>
              <span>Join</span> the <span>community!</span>
            </h4>
          ),
          id_facebook: "Facebook1",
          facebook_href: "https://www.facebook.com/shop6thstreet/",
          id_insta: "Insta1",
          insta_href: "https://www.instagram.com/shop6thstreet/",
          id_twitter: "Twitter1",
          twitter_href: "https://twitter.com/shop6thstreet",
          id_pinterest: "Pinterest1",
          pinterest_href: "https://in.pinterest.com/6thstreetonline/",
          id_youtube: "Youtube1",
          youtube_href: "https://www.youtube.com/c/6thStreet",
          id_tiktok: "Tiktok1",
          tiktok_href: "https://www.tiktok.com/@shop6thstreet",
          id_snapchat: "Snapchat1",
          snapchat_href: "https://www.snapchat.com/add/Shopat6thstreet",
        },
      ],
    },
  ];
  sendMOEEvents(event) {
    Moengage.track_event(event, {
      country: getCountryFromUrl().toUpperCase(),
      language: getLanguageFromUrl().toUpperCase(),
      app6thstreet_platform: "Web",
    });
    Event.dispatch(EVENT_GTM_FOOTER, event);
  }
  renderFirstTwoCloumns() {
    const { isLoad } = this.state;
    const regExp = new RegExp("^(?:[a-z]+:)?//", "i");
    const rootURL = this.getRootURL() || "";
    return this.linksMap
      .filter(
        (column) =>
          column.title === __("About") ||
          column.title === __("Customer Service")
      )
      .map((column) => (
        <div block="FooterMain" elem="Column" key={column.title}>
          <h4>{column.title}</h4>
          <div block="FooterMain" elem="Nav" key={column.title}>
            <ul key={column.title}>
              {column.items.map((items) => {
                const navigateTo = regExp.test(items.href)
                  ? items.href
                  : `${rootURL}${items.href}`;
                const changeRoute = (value) => {
                  const eventName =
                    value == __("Consumer Rights")
                    ? EVENT_CONSUMER_RIGHTS_CLICK
                    : value ==  __("Disclaimer")
                    ? EVENT_DISCLAIMER_CLICK
                    : value ==  __("Privacy Policy")
                    ? EVENT_PRIVACY_POLICY_CLICK
                    : value ==  __("Shipping Information")
                    ? EVENT_SHIPPING_INFO_CLICK
                    : value ==  __("Returns Information")
                    ? EVENT_RETURN_INFO_CLICK
                    : value ==  __("Feedback")
                    ? EVENT_FEEDBACK_CLICK
                    : value.type == "div" && value.props.className ==  __("About")
                    ? EVENT_ABOUT6S_CLICK
                      : "";
                  if (eventName && eventName.length > 0) {
                    this.setState({ isLoad: true });
                    this.sendMOEEvents(eventName);
                    setTimeout(() => {
                      window.location = navigateTo;
                    }, 1500);
                  } else {
                    window.location = navigateTo;
                  }
                };
                return (
                  <li key={items.name}>
                    <Loader isLoading={isLoad} />
                    <button
                      block="FooterMain"
                      elem="Link"
                      type="button"
                      onClick={() => changeRoute(items.name)}
                    >
                      {items.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ));
  }

  renderAppColumn() {
    return this.linksMap
      .filter((column) => column.title === __("Download The App"))
      .map((column) => (
        <div block="FooterMain" elem="LastColumn" key={column.title}>
          <h4>{column.title}</h4>
          <div block="FooterMain" elem="Nav">
            {column.items.map((items,i) => (
              <Fragment key={`last_main_footer_column${i}`}>
                <div block="FooterMain" elem="WrapperFirst">
                  <Link to={items.app_onclick} key={items.id_app}>
                    <Image
                      lazyLoad={true}
                      src={items.app_store}
                      alt="app store download"
                    />
                  </Link>
                  <br />
                  <Link to={items.google_onclick} key={items.id_google}>
                    <Image
                      lazyLoad={true}
                      src={items.google_play}
                      alt="google play download"
                    />{" "}
                  </Link>
                  <br />
                  <Link to={items.gallery_onclick} key={items.id_gallery}>
                    <Image
                      lazyLoad={true}
                      src={items.app_gallery}
                      alt="app gallery download"
                      className="appGallery"
                    />
                  </Link>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      ));
  }
  renderSocialLinks() {
    return this.linksMap
      .filter((column) => column.title === __("Download The App"))
      .map((column, index) => (
        <div block="FooterMain" elem="SocialColumn" key={index}>
          <div block="FooterMain" elem="SocialLinks">
            {column.items.map((items,i) => (
              <Fragment key={`last_main_footer_column_${i}`}>
                <div block="FooterMain" elem="SocialTitle">
                  {items.header}
                </div>
                <div block="FooterMain" elem="WrapperSecond">
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.insta_href}
                      key={items.id_insta}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_INSTA_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={instagram} alt="instagram" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.facebook_href}
                      key={items.id_facebook}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_FB_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={facebook} alt="facebook" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.tiktok_href}
                      key={items.id_tiktok}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_TIKTOK_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={tiktok} alt="Tiktok" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.snapchat_href}
                      key={items.id_snapchat}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_SNAPCHAT_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={snapchat} alt="Snapchat" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.twitter_href}
                      key={items.id_twitter}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_TWITTER_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={twitter} alt="Twitter" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon">
                    <Link
                      to={items.pinterest_href}
                      key={items.id_pinterest}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_PINTEREST_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={pinterest} alt="Pinterest" />
                    </Link>
                  </div>
                  <div block="FooterMain" elem="SocialIcon youtube">
                    <Link
                      to={items.youtube_href}
                      key={items.id_youtube}
                      target="_blank"
                      onClick={() => {
                        this.sendMOEEvents(EVENT_YOUTUBE_FOLLOW);
                      }}
                    >
                      <Image lazyLoad={true} src={youtube} alt="Youtube" />
                    </Link>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      ));
  }
  render() {
    const { isArabic } = this.state;
    return (
      <div block="FooterMain">
        <div block="FooterMain" elem="Layout" mods={{ isArabic }}>
          {this.renderSocialLinks()}
          {this.renderFirstTwoCloumns()}
          <FooterCustomerSupport />
          {this.renderAppColumn()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(FooterMain);
