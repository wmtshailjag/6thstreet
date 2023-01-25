/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from "prop-types";
import { PureComponent } from "react";
import { TransformComponent } from "react-zoom-pan-pinch";

import Image from "Component/Image";

export class ProductGalleryBaseImage extends PureComponent {
  static propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    imageRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
    containerRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
  };

  static defaultProps = {
    imageRef: () => {},
    containerRef: () => {},
  };

  render() {
    const { src, alt, imageRef, containerRef } = this.props;

    return (
      <TransformComponent>
        <div ref={containerRef}>
          <img
            lazyLoad={false}
            src={src}
            ratio="custom"
            mix={{
              block: "ProductGallery",
              elem: "SliderImage",
              mods: { isPlaceholder: !src },
            }}
            ref={imageRef}
            isPlaceholder={!src}
            alt={alt}
          />
          {/* <Image lazyLoad={true} ref={imageRef} alt={alt} src={src} itemProp="image" /> */}
        </div>
      </TransformComponent>
    );
  }
}

export default ProductGalleryBaseImage;
