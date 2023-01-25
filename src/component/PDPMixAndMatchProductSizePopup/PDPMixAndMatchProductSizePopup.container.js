import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import PDPMixAndMatchProductSizePopup from './PDPMixAndMatchProductSizePopup.component';

export class PPDPMixAndMatchProductSizePopupContainer extends PureComponent {

  static propTypes = {
    product: PropTypes.object.isRequired,
    onSizeTypeSelect: PropTypes.func.isRequired,
    onSizeSelect: PropTypes.func.isRequired,
    selectedSizeCode: PropTypes.string.isRequired,
    selectedSizeType: PropTypes.string.isRequired,
    addToCart: PropTypes.func.isRequired,
    routeChangeToCart: PropTypes.func.isRequired,
    togglePDPMixAndMatchProductSizePopup: PropTypes.func.isRequired
  };

  render() {
      return (
        <PDPMixAndMatchProductSizePopup { ...this.props } />
      );
  }
}

export default PPDPMixAndMatchProductSizePopupContainer;
