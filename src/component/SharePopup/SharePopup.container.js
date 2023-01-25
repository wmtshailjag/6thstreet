import { PureComponent } from 'react';
import SharePopup from './SharePopup.component';

export class SharePopupContainer extends PureComponent {
  render() {
      return (
        <SharePopup { ...this.props } />
      );
  }
}

export default SharePopupContainer;
