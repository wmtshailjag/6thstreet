import { PureComponent } from 'react';

import PDPClickAndCollectPopup from './PDPClickAndCollectPopup.component';

export class PPDPClickAndCollectPopupContainer extends PureComponent {
  render() {
      return (
        <PDPClickAndCollectPopup { ...this.props } />
      );
  }
}

export default PPDPClickAndCollectPopupContainer;
