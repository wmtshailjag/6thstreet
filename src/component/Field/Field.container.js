/* eslint jsx-a11y/label-has-associated-control: 0 */
// Disabled due bug in `renderCheckboxInput` function

import PropTypes from 'prop-types';

import SourceField from 'SourceComponent/Field/Field.container';

import {
    CHECKBOX_TYPE,
    EMAIL_TYPE,
    NUMBER_TYPE,
    PASSWORD_TYPE,
    RADIO_TYPE,
    SELECT_TYPE,
    TEXT_TYPE,
    TEXTAREA_TYPE,
    TOGGLE_TYPE
} from './Field.config';

import './Field.extended.style';

/**
 * Input fields component
 * @class Field
 */
export class FieldContainer extends SourceField {
    static propTypes = {
        type: PropTypes.oneOf([
            TEXT_TYPE,
            EMAIL_TYPE,
            NUMBER_TYPE,
            TEXTAREA_TYPE,
            PASSWORD_TYPE,
            RADIO_TYPE,
            CHECKBOX_TYPE,
            SELECT_TYPE,
            TOGGLE_TYPE
        ]).isRequired
    };

    containerProps = () => {
        const {
            checked: propsChecked
        } = this.props;

        const {
            value
        } = this.state;

        return {
            checked: propsChecked,
            value
        };
    };
}

export default FieldContainer;
