import { Fragment, PureComponent } from 'react';
import BrowserDatabase from 'Util/BrowserDatabase';
import { isArabic } from 'Util/App';
import PropTypes from 'prop-types';
import CDN from "../../util/API/provider/CDN";
import Link from "Component/Link";
import { connect } from 'react-redux';
import { LocationType } from "Type/Common";
import Header from "Component/Header";
import { setCountry, setLanguage, setLanguageForWelcome, setGender } from 'Store/AppState/AppState.action';
import { setAppConfig } from 'Store/AppConfig/AppConfig.action'
import StoreCreditDispatcher from 'Store/StoreCredit/StoreCredit.dispatcher';
import { URLS } from 'Util/Url/Url.config';
import Footer from "Component/Footer";
import Image from "Component/Image";
import CountrySwitcher from 'Component/CountrySwitcher';
import LanguageSwitcher from 'Component/LanguageSwitcher';
import { English as EnglishLogo } from 'Component/Logo';
import isMobile from "Util/Mobile";
import close from "../Icons/Close/icon.svg"
import { getSchema } from "Util/API/endpoint/Config/Config.endpoint";
import './WelcomeHomePage.style';
import { updateMeta } from "Store/Meta/Meta.action";


export const mapStateToProps = (state) => ({
    config: state.AppConfig.config,
    language: state.AppState.language,
    country: state.AppState.country,
    gender: state.AppState.gender,
});

export const mapDispatchToProps = (dispatch) => ({
    setCountry: (value) => dispatch(setCountry(value)),
    setLanguage: (value) => dispatch(setLanguage(value)),
    setGender: (value) => dispatch(setGender(value)),
    setAppConfig: (value) => dispatch(setAppConfig(value)),
    updateStoreCredits: () => StoreCreditDispatcher.getStoreCredit(dispatch),
    setLanguageForWelcome: (value) => dispatch(setLanguageForWelcome(value)),
    setMeta: (meta) => dispatch(updateMeta(meta)),

});

export const APP_STATE_CACHE_KEY = 'APP_STATE_CACHE_KEY';
export const PREVIOUS_USER = 'PREVIOUS_USER';

class WelcomeHomePage extends PureComponent {
    static propTypes = {
        location: LocationType.isRequired,
        setMeta: PropTypes.func.isRequired,
    };


    constructor(props) {
        super(props);
        const appStateCacheKey = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)
        const PREVIOUS_USER = BrowserDatabase.getItem('PREVIOUS_USER')
        if (PREVIOUS_USER) {
            const { country, language, gender } = this.props;
            const locale = `${language}-${country.toLowerCase()}`;
            let url = `${URLS[locale]}/${gender}.html`
            window.location.href = url;
        }
        if (appStateCacheKey) {
            const { country, language, locale, gender } = appStateCacheKey;
        }

        this.state = {
            isPopupOpen: !isMobile.any() && !!!appStateCacheKey,
            welcomeImg: null
        }
    }


    linkMap = {
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
                header: __("Follow the latest trends"),
                id_facebook: "Facebook1",
                facebook_href: "https://www.facebook.com/shop6thstreet/",
                id_insta: "Insta1",
                insta_href: "https://www.instagram.com/shop6thstreet/",
            },
        ],
    }


    componentDidMount() {
        const { setMeta } = this.props;
        setMeta({ title: __("Shop Online @ 6thStreet.com for Men, Women & Kids across GCC") });
        window.pageType = "welcome";
        this.getWelcomeImageUrl();
        this.setSchemaJSON();
    }

    componentDidUpdate() {
        const { language, country } = this.props;
        const locale = `${language}-${country.toLowerCase()}`
        let genders = ["women", "men", "kids"]
        genders.forEach((gender) => {
            const hint = document.createElement("link");
            hint.setAttribute("rel", "prefetch");
            hint.setAttribute("as", "document");
            hint.setAttribute("href", `${URLS[locale]}/${gender}.html`);

            try {
                const head = document.getElementsByTagName("head");
                if (head?.length) {
                    head[0].appendChild(hint);
                }
            }
            catch (err) {
                console.error(err);
            }
        })
    }

    componentWillUnmount() {
        window.pageType = undefined;
    }

    async setSchemaJSON() {
        const { locale = "" } = this.props;
        try {
            const response = await getSchema(locale);
            if (!!!response?.error) {
                const tag = document.createElement('script');
                if (tag) {
                    tag.type = 'application/ld+json';
                    tag.innerHTML = JSON.stringify(response);
                    document.querySelectorAll("script[type='application/ld+json']").forEach((node) => node.remove());
                    document.head.appendChild(tag);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    closePopup = (e) => {
        const { language, setLanguageForWelcome, country } = this.props;
        setCountry(country);
        setLanguage(language);
        setLanguageForWelcome(language);

        let countryList = ['BH']; 
        if(countryList.includes(country)){
            this.onGenderSelect(e, "all")
        }
        
        this.setState({
            isPopupOpen: false
        })

        
    }

    setLocalAndGenderCookies(locale, gender) {
        if (locale && gender) {
            const maxAge = 86400 * 90; // 1 Day * 90
            document.cookie = `locale=${locale}; max-age=${maxAge}; path=/`;
            if(gender === "all"){
                document.cookie = `gender=; max-age=${maxAge}; path=/`;
            }else{
                document.cookie = `gender=${gender}.html; max-age=${maxAge}; path=/`;
            }
        }
    }
    onGenderSelect = (event, val) => {
        event.persist();
        event.preventDefault();
        const { country, language, setGender } = this.props;
        const locale = `${language}-${country.toLowerCase()}`;
        setGender(val);
        let data = {
            locale: locale
        }

        BrowserDatabase.setItem(data, 'PREVIOUS_USER');
        this.setLocalAndGenderCookies(locale, val);
        let url = val === "all"? `${URLS[locale]}` : `${URLS[locale]}/${val}.html`
        window.location.href = url
    }

    getWelcomeImageUrl = async () => {
        let device = isMobile.any() ? 'm' : 'd'
        let url = `homepage/${device}/home.json`;
        try {
            const resp = await CDN.get(`config_staging/${url}`);
            if (resp) {
                this.setState({
                    welcomeImg: resp
                })
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    renderAppColumn = () => {
        return <div block="FooterMain" elem="LastColumn" >
            <h4>{this.linkMap.title}</h4>
            <div block="FooterMain" elem="Nav">
                {this.linkMap.items.map((items, i) => (
                    <Fragment key={`last_main_footer_column_${i}`}>
                        <div block="FooterMain" elem="WrapperFirst">
                            <Link to={items.app_onclick} key={items.id_app}>
                                <Image lazyLoad={true} src={items.app_store} alt="app store download" />
                            </Link>
                            <br />
                            <Link to={items.google_onclick} key={items.id_google}>
                                <Image lazyLoad={true} src={items.google_play} alt="google play download" />{" "}

                            </Link>
                            <br />
                            <Link to={items.gallery_onclick} key={items.id_gallery}>
                                <Image lazyLoad={true} src={items.app_gallery} alt="app gallery download" className="appGallery" />
                            </Link>
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    }

    render() {
        const { isPopupOpen, welcomeImg } = this.state;
        const { language, country } = this.props;
        const locale = `${language}-${country.toLowerCase()}`;
        const PREVIOUS_USER = BrowserDatabase.getItem('PREVIOUS_USER')
        return (

            <>
                { !PREVIOUS_USER &&
                    <div>
                        <div block="WelcomeHomePage" mods={{ isArabic: language === "ar" }}>
                            {
                                !isMobile.any()
                                    ?
                                    <Header />
                                    :
                                    null
                            }
                            <div block="WelcomeHomePage" elem="Top" >
                                <div block="WelcomeHomePage-Top-Logo" >
                                    {/* <EnglishLogo /> */}
                                </div>
                            </div>
                            {isMobile.any() &&
                                <div block="WelcomeHomePage" elem="StoreSwitcher" mods={{ isArabic: language === "ar" }}>
                                    <div block="Text" mods={{ isArabic: language === "ar" }}>
                                        {
                                            language === "en" ?
                                                <div>
                                                    <div block="Text-welcome">
                                                        <span>Welcome,</span>
                                                        &nbsp;
                                                        <span>you are shopping in</span>
                                                    </div>
                                                </div>
                                                :
                                                <div>
                                                    <div block="Text-welcome">يا هلا فيك،</div>
                                                    <div block="Text-shop">أنت تتسوق في</div>
                                                </div>
                                        }
                                    </div>
                                    <div block="WelcomeHomePage" elem="LanguageSwitcher" mods={{ isArabic: language === "ar" }}>
                                        <LanguageSwitcher isWelcomeMobileView={true} />
                                    </div>
                                    <div block="WelcomeHomePage" elem="CountrySwitcher" mods={{ isArabic: language === "ar" }}>
                                        <CountrySwitcher />
                                    </div>
                                </div>
                            }

                            {isPopupOpen &&
                                <div block="WelcomeHomePage" elem="Popup">
                                    <div block="WelcomeHomePage-Popup" elem="Action" mods={{ isArabic: language === "ar" }}>
                                        <img block="WelcomeHomePage-Popup-Action" elem="Close" src={close} onClick={this.closePopup} alt={"CloseImage"} />
                                    </div>
                                    <div block="WelcomeHomePage-Popup" elem="Content" mods={{ isArabic: language === "ar" }}>
                                        {
                                            language === "en" ?
                                                <div block="WelcomeHomePage-Popup-Content" elem="Text">
                                                    <span>Welcome,</span>
                                                    <span>you are shopping in</span>
                                                </div>
                                                :
                                                <div block="WelcomeHomePage-Popup-Content" elem="Text">
                                                    <span>يا هلا فيك،</span>
                                                    <span>أنت تتسوق في</span>
                                                </div>
                                        }
                                        <div block="WelcomeHomePage-Popup-Content" elem="SwitcherContainer" mods={{ isArabic: language === "ar" }}>
                                            <LanguageSwitcher welcomePagePopup={true} />
                                            <CountrySwitcher />
                                            <button
                                                block="WelcomeHomePage-Popup-Content-SwitcherContainer"
                                                elem="ConfirmButton"
                                                onClick={this.closePopup}
                                            >
                                                {__("OK")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }

                            {
                                welcomeImg &&
                                <div block="WelcomeHomePage" elem="MainSection" >
                                    {
                                        Object.keys(welcomeImg).map((gender, index) => {
                                            const navigateTo = `${URLS[locale]}/${gender}.html`
                                            return (
                                                <a
                                                    href={navigateTo}
                                                    block="WelcomeHomePage-GenderSelection"
                                                    onClick={(e) => this.onGenderSelect(e, gender)}
                                                    key={index}
                                                >
                                                    <img src={welcomeImg[gender][language].img} alt={welcomeImg[gender][language].label ? welcomeImg[gender][language].label : "WelcomeHomepageGenderSelection"}/>
                                                    <button block="WelcomeHomePage-GenderSelection-Button">
                                                        {welcomeImg[gender][language].label}
                                                    </button>
                                                </a>
                                            )
                                        })
                                    }
                                </div>
                            }
                            {isPopupOpen && <div block="WelcomeHomePage" elem="ShadeWrapper"></div>}
                        </div>
                        {
                            isMobile.tablet()
                                ?
                                <div block="WelcomeHomePage" elem="Bottom">
                                    {this.renderAppColumn()}
                                </div>
                                :
                                null
                        }
                        {
                            isMobile.any() || isMobile.tablet()
                                ?
                                null
                                :
                                <Footer />
                        }

                    </div>

                }
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeHomePage);
