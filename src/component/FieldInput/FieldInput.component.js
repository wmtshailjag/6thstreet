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

import PropTypes from 'prop-types';
import { isArabic } from 'Util/App';

import {
    FieldInput as SourceFieldInput
} from 'SourceComponent/FieldInput/FieldInput.component';
import { PASSWORD_TYPE } from '../Field/Field.config';


export class FieldInput extends SourceFieldInput {
    static propTypes = {
        formRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) })
        ])
    };

    static defaultProps = {
        formRef: () => {}
    };

    toggleMask(e) {
        e.persist();
        const { formRef } = this.props;
        try {
            if(formRef?.current?.type === "password"){
                formRef.current.type = "text";
                e.target.innerText = __("Mask");
            }
            else if(formRef?.current?.type === "text"){
                formRef.current.type = "password";
                e.target.innerText = __("Show");
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    render() {
        const {
            type,
            formRef,
            isDisabled,
            ...validProps
        } = this.props;

        return (
            <>
                {
                    type===PASSWORD_TYPE && !!!isDisabled
                    ?
                    <span
                        block="Mask"
                        mods={{
                            isArabic: isArabic(),
                        }}
                        role="button"
                        onClick={ this.toggleMask.bind(this) }
                    >
                        { __("Show") }
                    </span>
                    :
                    null
                }
                <input
                    type={ type }
                    ref={ formRef }
                    { ...validProps }
                />
            </>
        );
    }
}

export default FieldInput;
