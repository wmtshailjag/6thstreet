import PropTypes from "prop-types";
import React, { PureComponent } from "react";

class DragScroll extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      activeClass: false,
      isDown: false,
      startX: 0,
      scrollLeft: 0,
    };
  }
  static propTypes = {
    ref: PropTypes.object,
    rootClass: PropTypes.string,
    children: PropTypes.any,
    isHomePage: PropTypes.bool,
  };
  static defaultProps = {
    ref: { current: {} },
    rootClass: "",
  };

  componentDidMount() {
    this.startDragScroll();
  }
  startDragScroll = () => {
    const {
      data: { ref, rootClass },
    } = this.props;
    const dragWrapper = ref.current;
    if (!dragWrapper) {
      return;
    }
    // const slider = dragWrapper.childNodes[0];
    const scrollableNode = [...dragWrapper.childNodes].filter(
      (node) => node.id == rootClass
    );
    const slider = scrollableNode && scrollableNode[0] ? scrollableNode[0] : [];
    if (slider && slider.length == 0) {
      return;
    }

    slider.addEventListener("mousedown", (e) => {
      this.setState({ isDown: true });
      slider.classList.add("active");
      this.setState({ startX: e.pageX - slider.offsetLeft });
      this.setState({ scrollLeft: slider.scrollLeft });
    });
    slider.addEventListener("mouseleave", () => {
      this.setState({ isDown: false });
      slider.classList.remove("active");
    });

    slider.addEventListener("mouseup", () => {
      this.setState({ isDown: false });
      slider.classList.remove("active");
    });

    slider.addEventListener("mousemove", (e) => {
      if (!this.state.isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.state.startX) * 3; //scroll-fast
      if(slider){
        slider.scrollLeft = this.state.scrollLeft - walk;
      }
    });
  };
  render() {
    const {
      children,
      data: { ref },
      rootClass,
    } = this.props;

    return (
      <div ref={ref} className={(rootClass, "DragWrapper")}>
        {React.Children.map(this.props.children, (child) =>
          React.Children.only(child)
        )}
      </div>
    );
  }
}

export default DragScroll;
