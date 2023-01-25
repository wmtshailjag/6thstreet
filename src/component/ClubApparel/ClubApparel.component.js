import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Field from 'Component/Field';
import Loader from 'Component/Loader';
import { customerType } from 'Type/Account';

import './ClubApparel.style';

export class ClubApparel extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        hideIfZero: PropTypes.bool.isRequired,
        pointsAreApplied: PropTypes.bool,
        clubApparelPoints: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
        toggleClubApparelPoints: PropTypes.func.isRequired,
        customer: customerType.isRequired
    };

    static defaultProps = {
        pointsAreApplied: false
    };

    hideComponent() {
        const { hideIfZero, clubApparelPoints } = this.props;

        return hideIfZero && parseFloat(clubApparelPoints) <= 0;
    }

    handleCheckboxChange = () => {
        const {
            toggleClubApparelPoints,
            pointsAreApplied,
            customer: { id }
        } = this.props;

        toggleClubApparelPoints(!pointsAreApplied, id);
    };

    renderLabel() {
        const { clubApparelPoints, currency } = this.props;
        return (
            <>
                { __('Use') }
                <span block="ClubApparel" elem="Name">
                    { __('Club Apparel') }
                </span>
                { __('cash points') }
                <span block="ClubApparel" elem="Amount">
                    { `(${ currency } ${ clubApparelPoints })` }
                </span>
            </>
        );
    }

    renderCheckbox(checkboxId) {
        const { pointsAreApplied } = this.props;

        return (
            <Field
              block="ClubApparel"
              elem="Toggle"
              type="toggle"
              id={ checkboxId }
              name={ checkboxId }
              value={ checkboxId }
              checked={ pointsAreApplied }
              onClick={ this.handleCheckboxChange }
            />
        );
    }

    render() {
        const { isLoading } = this.props;

        if (this.hideComponent()) {
            return null;
        }

        const checkboxId = 'club_apparel_applied';

        return (
            <div block="ClubApparel">
                <Loader isLoading={ isLoading } />
                { this.renderCheckbox(checkboxId) }
                <label block="ClubApparel" elem="Label" htmlFor={ checkboxId }>
                    { this.renderLabel() }
                </label>
            </div>
        );
    }
}

export default ClubApparel;
