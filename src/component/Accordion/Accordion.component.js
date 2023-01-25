import PropTypes from "prop-types";
import { PureComponent } from "react";

import { ChildrenType, MixType } from "Type/Common";
import { isArabic } from "Util/App";
import { ChevronUp, ChevronRight, Plus, Minus } from "../Icons";

import "./Accordion.style";

export class Accordion extends PureComponent {
  static propTypes = {
    title: PropTypes.oneOf([PropTypes.string, PropTypes.element]).isRequired,
    children: ChildrenType.isRequired,
    shortDescription: PropTypes.oneOf([PropTypes.string, PropTypes.element]),
    mix: MixType,
    is_expanded: PropTypes.bool,
  };

  static defaultProps = {
    shortDescription: null,
    mix: null,
    is_expanded: false,
  };

  state = {
    isExpanded: false,
  };

  componentDidMount() {
    const { is_expanded } = this.props;

    if (is_expanded) {
      this.setState({ isExpanded: true });
    }
  }

  toggleAccordion = () =>
    this.setState(({ isExpanded }) => ({ isExpanded: !isExpanded }));

  renderHeading() {
    const { title, MyAccountSection } = this.props;
    const { isExpanded } = this.state;

    return (
      <div block="Accordion" elem="Heading">
        {typeof title === "string" && <h2 className="prodDetailTitle">{title}</h2>}
        {typeof title !== "string" && title}
        <button
          block="Accordion"
          elem="Expand"
          mods={{ isExpanded, isArabic: isArabic() }}
          onClick={this.toggleAccordion}
        >
          {isExpanded ? MyAccountSection ? (
            <Minus alt={`Expand ${title}`} />) : (<ChevronUp alt={`Expand ${title}`} />
          ) : MyAccountSection ? (
            <Plus alt={`Close ${title}`} />) :
            (<ChevronRight alt={`Close ${title}`} />
            )}
        </button>
      </div>
    );
  }

  renderShortDescription() {
    const { shortDescription } = this.props;

    if (!shortDescription) {
      return null;
    }

    if (typeof shortDescription === "string") {
      return (
        <p block="Accordion" elem="ShortDescription">
          {shortDescription}
        </p>
      );
    }

    return shortDescription;
  }

  render() {
    const { mix, children } = this.props;
    const { isExpanded } = this.state;

    return (
      <div
        block="Accordion"
        mods={{ isExpanded }}
        mix={{ ...mix, mods: { isExpanded } }}
      >
        {this.renderHeading()}
        {this.renderShortDescription()}
        {isExpanded && children}
      </div>
    );
  }
}

export default Accordion;
