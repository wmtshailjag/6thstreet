
import Image from "Component/Image";
import { APP_STATE_CACHE_KEY } from "Store/AppState/AppState.reducer";
import Link from "Component/Link";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import { isArabic } from "Util/App";
import Event, {
    EVENT_CLICK_RECENT_SEARCHES_CLICK,
    EVENT_EXPLORE_MORE_SEARCH_CLICK
} from "Util/Event";
import { formatCDNLink } from "Util/Url";
import BrowserDatabase from "Util/BrowserDatabase";
import DynamicContentFooter from "../DynamicContentFooter/DynamicContentFooter.component";
import DynamicContentHeader from "../DynamicContentHeader/DynamicContentHeader.component";
import "./ExploreMore.style";
import { getCountryFromUrl, getLanguageFromUrl } from "Util/Url";

class ExploreMore extends PureComponent {
    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.shape({
                link: PropTypes.string,
                url: PropTypes.string,
                title: PropTypes.string,
            })
        ).isRequired,
        header: PropTypes.shape({
            title: PropTypes.string,
        }),
        items_per_row: PropTypes.number,
    };

    static defaultProps = {
        items_per_row: 4,
        header: {},
    };
    state = {
        isArabic: isArabic(),
        isAllShowing: true,
        impressionSent: false,
    };


    onclick = (item) => {
        Event.dispatch(EVENT_EXPLORE_MORE_SEARCH_CLICK, item?.tag ? item?.tag : item);
        Moengage.track_event(EVENT_EXPLORE_MORE_SEARCH_CLICK, {
            country: getCountryFromUrl().toUpperCase(),
            language: getLanguageFromUrl().toUpperCase(),
            search_term: item?.tag ? item?.tag : item || "",
            app6thstreet_platform: "Web",
          });

    };

    renderItem = (item, i) => {
        const { link, url } = item;
        const { isArabic } = this.state;
        const { items_per_row, index } = this.props;
        let item_height = this.props.data

        let ht = item_height.toString() + "px";
        let contentClass = "contentAll";
        if (item_height >= 500 && items_per_row === 2) {
            contentClass = `Content_${i}`;
        }
        const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
            ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
            : "home";
        let requestedGender = isArabic ? getGenderInArabic(gender) : gender;

        return (
            <div
                block="CategoryItem"
                mods={{ isArabic }}
                elem="Content"
                className={contentClass}
                key={i}
            >
                <Link
                    to={formatCDNLink(link)}
                    key={i}
                    data-banner-type="grid"
                    data-promotion-name={item.promotion_name ? item.promotion_name : ""}
                    data-tag={item.tag ? item.tag : ""}
                    onClick={() => {
                        this.onclick(item);
                    }}
                >
                    <Image
                        lazyLoad={index === 34 ? false : true}
                        src={url}
                        className="GridImage"
                        alt={item.promotion_name ? item.promotion_name : "GridImage"}
                    />
                    {item.footer && (
                        <div block="Footer">
                            {item.footer.title && (
                                <p block="Footer-Title">{item.footer.title}</p>
                            )}
                            {item.footer.subtitle && (
                                <p block="Footer-SubTitle">{item.footer.subtitle}</p>
                            )}
                            {item.footer.button_label && (
                                <p>
                                    <a block="Footer-Button">{item.footer.button_label}</a>
                                </p>
                            )}
                        </div>
                    )}
                </Link>
            </div>
        );
    };

    renderItemMobile = (item, i) => {
        const { link, url } = item;
        const { index } = this.props;
        let ht = this.props.item_height.toString() + "px";
        const gender = BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
            ? BrowserDatabase.getItem(APP_STATE_CACHE_KEY)?.gender
            : "home";
        let requestedGender = isArabic ? getGenderInArabic(gender) : gender;

        return (
            <div block="CategoryItem" elem="Content" key={i}>
                <Link
                    to={formatCDNLink(link)}
                    key={i}
                    data-banner-type="grid"
                    data-promotion-name={item.promotion_name ? item.promotion_name : ""}
                    data-tag={item.tag ? item.tag : ""}
                    onClick={() => {
                        this.onclick(item);
                    }}
                >
                    <Image lazyLoad={index === 34 ? false : true} src={url} alt={item.promotion_name ? item.promotion_name : "categoryItemImage"} />

                    {item.footer && (
                        <div block="Footer">
                            {item.footer.title && (
                                <p block="Footer-Title">{item.footer.title}</p>
                            )}
                            {item.footer.subtitle && (
                                <p block="Footer-SubTitle">{item.footer.subtitle}</p>
                            )}
                            {item.footer.button_label && (
                                <a block="Footer-Button">{item.footer.button_label}</a>
                            )}
                        </div>
                    )}
                </Link>
            </div>
        );
    };

    renderItems() {
        let items = this.props.data.items
        if (items.length > 0) {
            return items.map(this.renderItem);
        }

    }

    renderGrid() {
        const { items_per_row, header: { title } = {} } = this.props.data;

        const style = { gridTemplateColumns: `repeat(4, 1fr)` };

        return (
            <>
                {this.props.data.header && title && (
                    <DynamicContentHeader header={this.props.data.header} />
                )}

                <div block="DynamicContentGrid" elem="Grid" style={style}>
                    {this.renderItems()}
                </div>
            </>
        );
    }

    render() {
        let setRef = (el) => {
            this.viewElement = el;
        };
        const { index } = this.props;

        return (
            <div
                ref={setRef}
                block="DynamicContentGrid"
                id={`DynamicContentGrid${index}`}
            >
                {this.renderGrid()}
            </div>
        );
    }
}



export default ExploreMore;
