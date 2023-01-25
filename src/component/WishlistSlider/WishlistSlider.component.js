import DragScroll from "Component/DragScroll/DragScroll.component";
import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { isArabic } from "Util/App";
import WishlistSliderItem from "./WishlistSlider.Item";
import "./WishlistSlider.style.scss";
class WishlistSlider extends PureComponent {
  static propTypes = {
    sliderLength: PropTypes.number,
    heading: PropTypes.string.isRequired,
    products: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.itemRef = React.createRef();
    this.cmpRef = React.createRef();
    this.scrollerRef = React.createRef();
    this.state = {
      customScrollWidth: null,
      isArabic: isArabic(),
    };
  }
  componentDidMount() {
    if (this.state.customScrollWidth < 0) {
      this.renderScrollbar();
    }
  }

  getProducts = () => {
    const { products, sliderLength } = this.props;
    if (products.length > sliderLength) {
      products.length = sliderLength;
    }
    return products;
  };

  async handleContainerScroll(event) {
    const target = event.nativeEvent.target;
    if(this.scrollerRef && this.scrollerRef.current){
    this.scrollerRef.current.scrollLeft = target.scrollLeft;
    }
  }

  renderHeader() {
    const { heading } = this.props;
    return (
      <div block="WishlistSliderHeader">
        <h2>{heading}</h2>
      </div>
    );
  }

  handleScroll = (event) => {
    const target = event.nativeEvent.target;
    const prentComponent = [...this.cmpRef.current.childNodes].filter(
      (node) => node.id == "ScrollWrapper"
    )[0];
    prentComponent && (prentComponent.scrollLeft = target.scrollLeft);
  };

  renderScrollbar = () => {
    let items = this.getProducts();

    const width =
      (this.itemRef &&
        this.itemRef.current &&
        this.itemRef.current.childRef.current.clientWidth) *
      items.length +
      items.length * 7 * 2 -
      690;
    this.setState({
      customScrollWidth: width,
    });

    // return null;

    return (
      <div
        block="VueProductSlider"
        elem="SliderContainer"
        ref={this.scrollerRef}
        mods={{
          Hidden:
            this.scrollerRef.current &&
            this.scrollerRef.current.clientWidth >=
            this.state.customScrollWidth,
            isArabic: isArabic()
        }}
        onScroll={this.handleScroll}
      >
        <div
          block="Outer"
          style={{ width: this.state.customScrollWidth }}
          elem="Inner"
        ></div>
      </div>
    );
  };
  renderSliderContainer() {
    const items = this.getProducts();
    const { isHome } = this.props;
    return (
      <DragScroll
        data={{ rootClass: "WishlistScrollWrapper", ref: this.cmpRef }}
      >
        <>
          <div
            block="VueProductSlider"
            elem="SliderContainer"
            id="WishlistScrollWrapper"
            ref={this.cmpRef}
            mods={{ isHome }}
            onScroll={(e) => {
              this.handleContainerScroll(e);
            }}
          >
            {isHome && <div block="SliderHelper" mods={{ isHome }}></div>}
            {items.map((item) => {
              const { product } = item;
              return (
                <WishlistSliderItem
                  key={product.sku}
                  data={product}
                  ref={this.itemRef}
                />
              );
            })}
            {isHome && <div block="SliderHelper" mods={{ isHome }}></div>}
          </div>
          {this.renderScrollbar()}
        </>
      </DragScroll>
    );
  }

  render() {
    return (
      <div block="VueProductSlider" elem="Container">
        {this.renderHeader()}
        {this.renderSliderContainer()}
      </div>
    );
  }
}

export default WishlistSlider;
