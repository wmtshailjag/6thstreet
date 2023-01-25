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

import { Form as SourceForm } from "SourceComponent/Form/Form.component";
import { ChildrenType, MixType } from "Type/Common";

export class Form extends SourceForm {
  static propTypes = {
    onSubmitSuccess: PropTypes.func,
    onSubmitError: PropTypes.func,
    onSubmit: PropTypes.func,
    children: ChildrenType.isRequired,
    id: PropTypes.string,
    mix: MixType,
    isValidateOnChange: PropTypes.bool,
    parentCallback: PropTypes.func,
  };

  static defaultProps = {
    onSubmitSuccess: () => {},
    onSubmitError: () => {},
    onSubmit: () => {},
    parentCallback: () => {},
    mix: {},
    id: "",
    isValidateOnChange: false,
  };

  constructor(props, state) {
    super(props, state);

    this.state = {
      ...state,
      fieldsAreValid: true,
    };
  }

  collectFieldsInformation = () => {
    const { refMap = {} } = this.state;
    const { children: propsChildren } = this.props;

    const {
      children,
      fieldsAreValid,
      invalidFields = [],
    } = Form.cloneAndValidateChildren(propsChildren, refMap);

    this.setState({ children, fieldsAreValid });

    const inputValues = Object.values(refMap).reduce((inputValues, input) => {
      const { current } = input;
      if (current && current.id && current.value) {
        const { name, value, checked } = current;

        if (current.dataset.skipValue === "true") {
          return inputValues;
        }

        if (current.type === "checkbox") {
          const boolValue = checked;
          return { ...inputValues, [name]: boolValue };
        }

        return { ...inputValues, [name]: value };
      }

      return inputValues;
    }, {});

    if (invalidFields.length) {
      const { current } = refMap[invalidFields[0]];

      current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return {
      inputValues,
      invalidFields,
    };
  };

  onChange = async () => {
    const { id, isValidateOnChange, parentCallback } = this.props;
    const { refMap = {}, ignoreEmptyFieldCollecton } = this.state;

    if (isValidateOnChange) {
      const isAllFieldsFilled = Object.entries(refMap).reduce((acc, field) => {
        if (!ignoreEmptyFieldCollecton) {
          const {
            current: { value },
          } = field[1];

          if (!value) {
            acc.push(value);
          }
        }

        return acc;
      }, []);

      if (isAllFieldsFilled.length === 0) {
        const portalData = id
          ? await window.formPortalCollector.collect(id)
          : [];

        const { invalidFields } = portalData.reduce((acc, portalData) => {
          const { invalidFields = [], inputValues = {} } = portalData;

          const {
            invalidFields: initialInvalidFields,
            inputValues: initialInputValues,
          } = acc;

          return {
            invalidFields: [...initialInvalidFields, ...invalidFields],
            inputValues: { ...initialInputValues, ...inputValues },
          };
        }, this.collectFieldsInformation());

        const asyncData = Promise.all(
          portalData.reduce((acc, { asyncData }) => {
            if (!asyncData) {
              return acc;
            }

            return [...acc, asyncData];
          }, [])
        );

        asyncData.then(() => {
          parentCallback(invalidFields);
        });

        this.setState({ ignoreEmptyFieldCollecton: true });
      }
    }
  };

  render() {
    const { mix, id } = this.props;
    const { children, fieldsAreValid } = this.state;

    return (
      <form
        block="Form"
        mix={mix}
        mods={{ isInvalid: !fieldsAreValid }}
        ref={(ref) => {
          this.form = ref;
        }}
        id={id}
        onSubmit={this.handleFormSubmit}
        onChange={this.onChange}
        autoComplete="on"
      >
        {children}
      </form>
    );
  }
}

export default Form;
