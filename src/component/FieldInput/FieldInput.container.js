import {
    FieldInputContainer as SourceFieldInputContainer
} from 'SourceComponent/FieldInput/FieldInput.container';

export class FieldInputContainer extends SourceFieldInputContainer {
    containerProps = () => {
        const {
            /* eslint-disable react/prop-types, no-unused-vars */
            dispatch,
            selectOptions,
            isControlled,
            handleChange,
            onChangeCheckbox,
            onKeyEnterDown,
            autocomplete,
            /* eslint-enable react/prop-types, no-unused-vars */

            // Props to be transformed
            disabled,
            skipValue,

            // Props to be chosen on-of
            checked,
            defaultChecked,

            // Props that are passed correctly from the beginning
            ...validProps
        } = this.props;

        // check for undefined, as this is boolean value
        const checkedOrDefaultChecked = defaultChecked !== undefined
            ? { defaultChecked }
            : { checked };

        return {
            ...validProps,
            ...checkedOrDefaultChecked,
            disabled,
            'data-skip-value': skipValue,
            autoComplete: this.getAutocomplete()
        };
    };
}

export default FieldInputContainer;
