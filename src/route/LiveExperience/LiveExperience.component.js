import { PureComponent } from "react";
import Countdown from "react-countdown";
import ContentWrapper from "Component/ContentWrapper";
import isMobile from "Util/Mobile";
import "./LiveExperience.style.scss";
import cartIcon from "./icons/cart-icon.png";
import timerIcon from "./icons/timer.png";
import calenderIcon from "./icons/calendar.svg";
import playbtn from "./icons/player.svg";
import Refine from "../../component/Icons/Refine/icon.png";
import { isArabic } from "Util/App";
import UrlRewritesQuery from "Query/UrlRewrites.query";
import { fetchQuery } from "Util/Request";

import BrowserDatabase from "Util/BrowserDatabase";
import { getCurrencyCode } from "../../../packages/algolia-sdk/app/utils";
import VueIntegrationQueries from "Query/vueIntegration.query";
import { getStore } from "Store";
import MobileAPI from "Util/API/provider/MobileAPI";

export class LiveExperience extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
      isLive: false,
      archivedItemToShow: 9,
      isRefineButtonClicked: false,
      influencerSearchText: "",
      isArabic: isArabic(),
      ProductDetails: {},
      ProductDetailsObj:{},
      itemIdArr:{},
      item_id: null,
      filterCount: -1,
    };
  }

  componentDidMount() {
    (function () {
      if (!window.initBambuserLiveShopping) {
        window.initBambuserLiveShopping = function (item) {
          window.initBambuserLiveShopping.queue.push(item);
        };
        window.initBambuserLiveShopping.queue = [];
        var scriptNode = document.createElement("script");
        scriptNode["src"] = "https://lcx-embed.bambuser.com/default/embed.js";
        document.body.appendChild(scriptNode);
      }
    })();

    if (this.props.livepartyId) {
      this.onClickPartyPlay(this.props.livepartyId);
    }

    this.renderLiveParty();

    this.renderUpcomingParty();

    this.renderArchivedParty();
  }

  componentDidUpdate() {
    this.renderLiveParty();
  }

  renderLiveParty = async () => {};
  renderUpcomingParty = () => {};
  renderArchivedParty = () => {};

  renderSpckLiveEvent() {
    const content = this.props.live;
    return this.renderLiveBlock(content);
  }
  renderSpckUpcomingEvent() {
    let content = this.props.updatedUpcoming;

    // return
    return content.map(this.renderUpcomingGridBlock);
  }

  renderSpckarchivedEvent() {
    let content = this.props.updatedArchived;
    const { influencerSearchText } = this.state;
    const lowerInfluencerSearchText = influencerSearchText.toLowerCase();
    if (!isMobile.any()) {
      content = content.slice(0, this.state.archivedItemToShow);
    }

    const FilteredContent = content
      ?.filter((val) => {
        if (val.title.toLowerCase().includes(lowerInfluencerSearchText)) {
          return val;
        }
      }).map(this.renderArchivedGridBlock);
    this.setState({ filterCount: FilteredContent.length });
    return FilteredContent;
  }

  handleLoadMore = () => {
    let count = this.state.archivedItemToShow;
    let totalProducts = this.props.updatedArchived.length;
    let itemsToShow = count + 9;
    if (itemsToShow > totalProducts) {
      itemsToShow = totalProducts;
    }
    this.setState({
      archivedItemToShow: itemsToShow,
    });
  };

  renderLiveBlock = (block, i) => {
    const { curtains, title, scheduledStartAt, products } = block;
    const imageSRC = curtains && curtains.pending.backgroundImage;
    let d = new Date(scheduledStartAt);
    let diffInTime = d - Date.now();
    var diffInDay = diffInTime / (1000 * 3600 * 24);
    const { isArabic } = this.state;

    if (imageSRC) {
      return (
        <div key={i} block="spck-live-event">
          <div block="mainImage">
            <img src={imageSRC} alt={title} />
            {this.props.isLive ? (
              <div block="liveNow" mods={{ isArabic }}>
                <p block="liveNow-text">{__("LIVE NOW")}</p>
              </div>
            ) : (
              <div block="eventStart" mods={{ isArabic }}>
                {diffInDay < 1 ? (
                  <div block="eventStart-timer">
                    <img src={timerIcon} alt="timerIcon" />
                    <Countdown date={d} daysInHours={true} />
                  </div>
                ) : (
                  <div block="eventStart-calender">
                    <img src={calenderIcon} alt="calenderIcon" />
                    <div block="calenderFormatter" mods={{ isArabic }}>{` ${d.getDate()}-${
                      this.state.month[d.getMonth()]
                    } at ${d.toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}`}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <a
            block="eventPlayBtn"
            onClick={() => this.onClickPartyPlay(block.id)}
          >
            <img src={playbtn} alt="event-playbtn" />
          </a>
          <div block="eventInfo">
            <h3 block="eventTitle">{title}</h3>
          </div>
        </div>
      );
    }
  };

  renderUpcomingGridBlock = (block, i) => {
    const { curtains, title, description, scheduledStartAt } = block;
    const imageSRC = curtains.pending.backgroundImage;
    let d = new Date(scheduledStartAt);

    let diffInTime = d - Date.now();
    var diffInDay = diffInTime / (1000 * 3600 * 24);
    const { isArabic } = this.state;

    if (imageSRC) {
      return (
        <li key={i} block="spckItem" mods={{ isArabic }}>
          <div block="eventImage">
            <img src={imageSRC} alt={title} />
          </div>
          <div block="eventStart">
            {diffInDay < 1 ? (
              <div block="eventStart-timer">
                <img src={timerIcon} alt="timerIcon" />
                <Countdown date={d} daysInHours={true} />
              </div>
            ) : (
              <div block="eventStart-calender">
                <img src={calenderIcon} alt="calenderIcon" />
                <div block="calenderFormatter" mods={{ isArabic }}>{`${d.getDate()}-${
                  this.state.month[d.getMonth()]
                } at ${d.toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}`}</div>
              </div>
            )}
          </div>
          <a
            block="eventPlayBtn"
            onClick={() => this.onClickPartyPlay(block.id)}
          >
            {" "}
            <img src={playbtn} alt="event-playbtn" />
          </a>
          <div block="eventInfo">
            <h3 block="eventTitle">{title}</h3>
            <p block="eventDesc">{description}</p>
          </div>
        </li>
      );
    }
  };

  renderArchivedGridBlock = (block, i) => {
    // debugger
    const { curtains, title, description } = block;
    const imageSRC = curtains?.pending?.backgroundImage;
    if (imageSRC) {
      return (
        <li key={i} block="spckItem" id={block.id}>
          <div block="eventImage">
            <img src={imageSRC} alt={title} />
          </div>
          <a
            block="eventPlayBtn"
            onClick={() => this.onClickPartyPlay(block.id)}
          >
            <img src={playbtn} alt="event-playbtn" />
          </a>
          <div block="eventInfo">
            <h3 block="eventTitle">{title}</h3>
            <p block="eventDesc">{description}</p>
          </div>
        </li>
      );
    }
  };

  getProductDetails = async (id) => {
    try {
      return MobileAPI.get(`bambuser/products/${id}`).then(
        async ({ publicUrl }) => {
          const { pathname: urlParam } = new URL(publicUrl);
          const { requestProduct } = this.props;
          const { urlResolver } = await fetchQuery(
            UrlRewritesQuery.getQuery({ urlParam })
          );
          if (urlResolver) {
            const { id } = urlResolver;
            return requestProduct({ options: { id } }).then((response) => {
              return response;
            });
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  addToCart = (addedItem, cartId) => {
    const liveparty = true;
    const {
      sku,
      options: { size },
    } = addedItem;
    const { ProductDetails } = this.state;
    if (ProductDetails) {
      const { addProductToCart } = this.props;
      const {
        ProductDetails: {
          thumbnail_url,
          url,
          color,
          brand_name,
          price = {},
          sku: configSKU,
          objectID,
          simple_products,
        },
      } = this.state;
      const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
      const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];
      const code = Object.keys(simple_products);
      return addProductToCart(
        {
          sku,
          configSKU,
          qty: 1,
          optionId: size !== "null" ? "EU" : null,
          optionValue: size,
          selectedClickAndCollectStore: "",
        },
        color,
        size,
        basePrice,
        brand_name,
        thumbnail_url,
        url,
        itemPrice,
        null,
        cartId,
        liveparty
      );
    }
  };

  UpdateProductsInCart = (updatedItem, currency) => {
    const { updateProductInCart } = this.props;
    const {
      options: { size },
    } = updatedItem;
    const { itemIdArr, ProductDetailsObj } = this.state;
    const isUpdatedItem = Object.values(ProductDetailsObj).filter((obj) => {
      let filteredObj = null;
      Object.keys(obj.simple_products).filter((objSku) => {
        if (objSku === updatedItem.sku) {
          filteredObj = obj;
        }
      });
      return filteredObj;
    });
    if (!isUpdatedItem) {
      return;
    }
    const {
      thumbnail_url,
      url,
      color,
      brand_name,
      price = {},
      discount,
      sku: configSKU,
      objectID,
      simple_products,
    } = Object.values(isUpdatedItem)[0];
    const itemPrice = price[0][Object.keys(price[0])[0]]["6s_special_price"];
    const basePrice = price[0][Object.keys(price[0])[0]]["6s_base_price"];
    return updateProductInCart(
      itemIdArr[updatedItem.sku],
      updatedItem.quantity,
      color,
      size,
      discount,
      brand_name,
      thumbnail_url,
      url,
      basePrice,
      currency
    );
  };

  removeProducts = (itemId) => {
    const { removeProduct } = this.props;
    return removeProduct(itemId);
  };

  sendMessageToNative = (payload) => {
    if (window) {
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(payload);
    }
  };

  onClickPartyPlay = async (bId) => {
    const locale = VueIntegrationQueries.getLocaleFromUrl();
    const [lang, country] = locale && locale.split("-");
    const currency = getCurrencyCode(country);
    let objectId = null;
    const livepartyId = this.props.livepartyId;
    window.onBambuserLiveShoppingReady = (player) => {
      player.configure({
        currency: currency,
        locale: locale,
      });

      // Cart Integeration Code of Bambuser Live Shopping Cart
      player.on(player.EVENT.ADD_TO_CART, (addedItem, callback) => {
        const cart_id = BrowserDatabase.getItem("CART_ID_CACHE_KEY");
        const cartId =
          this.props.cartId !== "null" ? this.props.cartId : cart_id;

        this.addToCart(addedItem, cartId)
          .then((res) => {
            const {
              data: { item_id },
            } = res;
            this.setState({ item_id: item_id, cartId: cartId,itemIdArr :{...this.state.itemIdArr,[addedItem.sku]:item_id }});
            callback(true); // item successfully added to cart
          })
          .catch((error) => {
            if (error.type === "out-of-stock") {
              // Unsuccessful due to 'out of stock'
              callback({
                success: false,
                reason: "out-of-stock",
              });
            } else {
              // Unsuccessful due to other problems
              callback(false);
            }
          });
      });

      // The user wants to change the quantity of an item in cart
      player.on(player.EVENT.UPDATE_ITEM_IN_CART, (updatedItem, callback) => {
        const { item_id, ProductDetailsObj, itemIdArr } = this.state;
        let productQuantity = null;
        const isUpdatedItemCount = Object.values(ProductDetailsObj).filter((obj) => {
          let filteredProductCount = null;
          Object.keys(obj.simple_products).filter((objSku) => {
            if (objSku === updatedItem.sku) {
              filteredProductCount = obj.simple_products[objSku].quantity;
            }
          });
          if(filteredProductCount){
            productQuantity = +filteredProductCount
          }
          return filteredProductCount;
        });
        if (updatedItem.quantity > 0) {
          if(updatedItem.quantity < 11 && updatedItem.quantity <= productQuantity) {
            this.UpdateProductsInCart(updatedItem, currency)
            .then(() => {
              // cart update was successful
              callback(true);
            })
            .catch(function (error) {
              if (error.type === "out-of-stock") {
                callback({
                  success: false,
                  reason: "out-of-stock",
                });
              } else {
                callback(false);
              }
            });
          }else if(updatedItem.quantity > productQuantity){
            callback({
              success: false,
              reason: "custom-error",
              message: "Some products or selected quantities are no longer available",
            });
          }else {
            callback({
              success: false,
              reason: "custom-error",
              message: "You have exceeded the maximum limit to add this product",
            });
          }
        }

        if (updatedItem.quantity === 0) {
          this.removeProducts(
            itemIdArr[updatedItem.sku])
            .then(() => {
              // successfully deleted item
              callback(true);
            })
            .catch(() => {
              // failed to delete item
              callback(false);
            });
        }
      });

      player.on(player.EVENT.CHECKOUT, () => {
        const { cartId, livepartyId } = this.props;
        if (livepartyId) {
          const payload = getStore().getState().Cart.cartId;
          this.sendMessageToNative(payload);
        } else {
          player.showCheckout(
            window.open(window.location.origin + "/cart", "_self")
          );
        }
      });

      if (livepartyId) {
        player.on(player.EVENT.CLOSE, () => {
          const payload = true;
          this.sendMessageToNative(payload);
        });
      }

      // player.on(player.EVENT.SYNC_CART_STATE, () => {
      //   // Use your method to check if the user has checkout
      //   const { cart_id } = this.state;
      //   console.log("running", this.getCartTotals(cart_id));
      //   if (this.getCartTotals(cart_id))  {
      //     // Emptying the in-player cart
      //     player.updateCart({
      //       items: [],
      //     });
      //   }
      // });

      player.on(player.EVENT.PROVIDE_PRODUCT_DATA, (event) => {
        event.products.forEach(async ({ id }) => {
          objectId = id;
          const yourProduct = await this.getProductDetails(id);
          const {
            brand_name,
            description,
            name,
            price,
            sku,
            color,
            gallery_images,
            simple_products,
          } = yourProduct.data;
          this.setState({
            ProductDetails: yourProduct.data,
            ProductDetailsObj: {
              ...this.state.ProductDetailsObj,
              [yourProduct.data.sku]: yourProduct.data,
            },
          });
          player.updateProduct(id, (productFactory) =>
            productFactory.product((productDetailFactory) =>
              productDetailFactory
                .name(name)
                .brandName(brand_name)
                .description(description)
                .sku(sku)
                .defaultVariationIndex(0)
                .variations((variationFactory) => [
                  variationFactory()
                    .attributes((attributeFactory) =>
                      attributeFactory.colorName(color)
                    )
                    .imageUrls(gallery_images)
                    .name(color)
                    .sku(sku)
                    .sizes((sizeFactory) =>
                      Object.keys(simple_products).map((VarientSku) =>
                        sizeFactory()
                          .name(
                            simple_products &&
                              simple_products[VarientSku] &&
                              simple_products[VarientSku].size &&
                              simple_products[VarientSku].size.eu
                              ? simple_products[VarientSku].size.eu
                              : "null"
                          )
                          .inStock(simple_products[VarientSku].quantity > 0)
                          .sku(VarientSku)
                          .price((priceFactory) =>
                            priceFactory
                              .current(price[0][currency]["6s_special_price"])
                              .original(price[0][currency]["6s_base_price"])
                          )
                      )
                    ),
                ])
            )
          );
        });
      });
    };

    window.initBambuserLiveShopping({
      showId: bId,
      type: "overlay",
    });
  };

  handleRefineButtonClick = () => {
    const { isRefineButtonClicked } = this.state;
    const { updatedArchived } = this.props;
    this.setState({
      isRefineButtonClicked: !isRefineButtonClicked,
      archivedItemToShow:
        updatedArchived && updatedArchived.length && updatedArchived.length,
    });
  };

  handleSearchInfluencerText = (e) => {
    this.setState({ influencerSearchText: e.target.value });
  };

  renderRefine() {
    const { isArabic, isRefineButtonClicked } = this.state;

    return (
      <div block="refineButton-div" elem="Refine" mods={{ isArabic }}>
        {isRefineButtonClicked ? (
          <input
            type="text"
            block="influencerSearchInput"
            mods={{ isArabic }}
            placeholder={__("Search for Influencer's title")}
            onChange={this.handleSearchInfluencerText}
          />
        ) : (
          ""
        )}
        <button
          block="refine-button"
          mods={{ isArabic }}
          onClick={this.handleRefineButtonClick}
        >
          {" "}
          <img block="refineImage" mods={{ isArabic }} src={Refine} />{" "}
          {__("Search")}
        </button>
      </div>
    );
  }

  render() {
    let archProducts = this.state.archivedItemToShow;
    let totalProducts = this.props.updatedArchived.length;
    let progressWidth = (archProducts * 100) / totalProducts;
    const { isArabic } = this.state;

    return (
      <>
        {this.props.livepartyId ? (
          <div></div>
        ) : (
          <main block="LiveShopping">
            {/* <div block="catergoryBlockLayout" mods={{ isArabic }}>
              <div block="GenderButton-Container">
                <a href="/all.html">
                  <button block="GenderButton-Button">{__("All")}</button>
                </a>
              </div>
              <div block="GenderButton-Container">
                <a href="/women.html">
                  <button block="GenderButton-Button">{__("Women")}</button>
                </a>
              </div>
              <div block="GenderButton-Container">
                <a href="/men.html">
                  <button block="GenderButton-Button">{__("Men")}</button>
                </a>
              </div>
            </div> */}

            <ContentWrapper
              mix={{ block: "LiveShopping" }}
              wrapperMix={{
                block: "LiveShopping",
                elem: "Wrapper",
              }}
              label={__("LiveShopping")}
            >
              <div block="liveEventBanner">{this.renderSpckLiveEvent()}</div>

              {this.props.updatedUpcoming.length > 0 && (
                <div block="upComing-Grid">
                  <h3 block="sectionTitle" mods={{ isArabic }}>
                    {__("COMING NEXT")}
                  </h3>
                  <div id="live"></div>
                  <ul block="spckItems">{this.renderSpckUpcomingEvent()}</ul>
                </div>
              )}

              {this.props.updatedArchived.length > 0 && (
                <div block="archived-Grid">
                  <div block="Recentlyplayed-heading-layout">
                    <h3 block="sectionTitle">{__("RECENTLY PLAYED")}</h3>
                    <div block="RecentlyPlayed-refine-button">
                      {this.renderRefine()}
                    </div>
                  </div>
                  <div id="archived"></div>
                  <ul block="spckItems">{this.renderSpckarchivedEvent()}</ul>
                </div>
              )}

              {this.props.updatedArchived.length > 9 && !isMobile.any() ? (
                <div block="Product-LoadMore">
                  {
                    <>
                      <div block="Product-Loaded-Info">
                        {__(
                          "You’ve viewed %s of %s videos",
                          this.state.filterCount !== -1
                            ? this.state.filterCount
                            : archProducts,
                          totalProducts
                        )}
                      </div>

                      <div block="Product-ProgressBar">
                        <div block="Product-ProgressBar-Container">
                          <div
                            block="Product-ProgressBar-Bar"
                            style={{ width: `${progressWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  }

                  <div block="LoadMore">
                    <button
                      block="button"
                      onClick={this.handleLoadMore}
                      // disabled={disablebtn || this.props.productLoad}
                      ref={this.buttonRef}
                    >
                      {__("Load More")}
                    </button>
                  </div>
                </div>
              ) : (
                ""
              )}
            </ContentWrapper>
            <div id="all"></div>
          </main>
        )}
      </>
    );
  }
}

export default LiveExperience;
