
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import Field from 'Component/Field';
import Form from 'Component/Form';

import { PHONE_CODES } from 'Component/MyAccountAddressFieldForm/MyAccountAddressFieldForm.config';
import { COUNTRY_CODES_FOR_PHONE_VALIDATION } from 'Component/MyAccountAddressForm/MyAccountAddressForm.config';
import ContentWrapper from 'Component/ContentWrapper';
import { isArabic } from 'Util/App';
import { getCountryFromUrl } from 'Util/Url';

import './Feedback.style';

export class Feedback extends PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    const countryCode = getCountryFromUrl();


    this.state = {
      customerCountry: countryCode,
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber:``,
      comment: ''
    }
  }
  componentDidMount(){
    var data = localStorage.getItem('customer');
    let userData = JSON.parse(data);
    if(userData?.data?.firstname){
      this.setState({
        firstname: userData?.data?.firstname || "",
        lastname: userData?.data?.lastname || "",
        email: userData?.data?.email || "",
      });
    }
  }
  componentDidUpdate(){
    var data = localStorage.getItem('customer');
    let userData = JSON.parse(data);
    if(userData?.data?.firstname){
      this.setState({
        firstname: userData?.data?.firstname || "",
        lastname: userData?.data?.lastname || "",
        email: userData?.data?.email || "",
      });
    }
  }

  getPhoneNumberMaxLength() {
    const { customerCountry } = this.state;

    return COUNTRY_CODES_FOR_PHONE_VALIDATION[customerCountry]
      ? '9' : '8';
  }

  handleChange(value) {
    this.setState({...value});
  }

   render() {
       return (
         <main block="Feedback" aria-label={ __('Feedback Form') }>
           <ContentWrapper
             mix={ { block: 'Feedback' } }
             wrapperMix={ {
                 block: 'Feedback',
                 elem: 'Wrapper'
             } }
             label={ __('Feedback') }
           >
               <h2>
                  {
                    __('CONTACT US')
                  }
                </h2>
               { __('Jot us a note and well get back to you as quickly as possible.')}
               <Form block="Feedback-form">
                  <fieldset block="Feedback-form-fieldset" mods={ { isArabic } }>
                      <Field
                        mods={ { isArabic } }
                        type="text"
                        placeholder={ __('FIRST NAME*') }
                        mix={ {
                          block: 'Feedback-form-field-firstname',
                        } }
                        id="firstname"
                        name="firstname"
                        autocomplete="given-name"
                        isControlled
                        value={this.state.firstname}
                        onChange={(firstname)=>this.handleChange({firstname})}
                        validation={ ['notEmpty'] }
                      />
                      <Field
                        mods={ { isArabic } }
                        type="text"
                        placeholder={ __('LAST NAME*') }
                        mix={ {
                          block: 'Feedback-form-field-lastname'
                        } }
                        id="lastname"
                        name="lastname"
                        autocomplete="family-name"
                        isControlled
                        value={this.state.lastname}
                        onChange={(lastname)=>this.handleChange({lastname})}
                        validation={ ['notEmpty'] }
                      />
                  </fieldset>
                  <Field
                    mods={ { isArabic } }
                    type="text"
                    block="Feedback-form-field-email"
                    placeholder={ __('EMAIL*') }
                    id="email"
                    name="email"
                    autocomplete="email"
                    isControlled
                    value={this.state.email}
                    onChange={(email)=>this.handleChange({email})}
                    validation={ ['notEmpty', 'email'] }
                  />
                  <fieldset block="Feedback-form-fieldset" mods={ { isArabic } }>
                  <Field
                    mods={ { isArabic } }
                    mix={ {
                      block: 'Feedback-form-field-phone-code'
                    } }
                    readOnly
                    type="text"
                    placeholder={ __('Phone code') }
                    id="phoneCode"
                    value={PHONE_CODES[this.state.customerCountry]}
                    name="phoneCode"
                  />
                  <Field
                    mods={ { isArabic } }
                    mix={ {
                      block: 'Feedback-form-field-phone-number'
                    } }
                    type="text"
                    placeholder={ __('Phone number') }
                    id="phoneNumber"
                    isControlled
                    maxLength={ this.getPhoneNumberMaxLength() }
                    pattern="[0-9]*"
                    value={this.state.phoneNumber}
                    onChange={(phoneNumber) => this.handleChange({ phoneNumber })}
                    name="phoneNumber"
                  />
                  </fieldset>
                  <Field
                    mods={ { isArabic } }
                    mix={ {
                      block: 'Feedback-form-field-comment'
                    } }
                    type="textarea"
                    validation={ ['notEmpty'] }
                    placeholder={ __('Provide Your Feedback') }
                    cols="5"
                    rows="3"
                    max="99999"
                    id="comment"
                    name="comment"
                    isControlled
                    value={this.state.comment}
                    onChange={(comment)=>this.handleChange({comment})}
                  />
                  <div
                    block="Feedback-submit-button"
                  >
                    <button
                      block="Button"
                      type="submit"
                      onClick={()=>this.props.onSubmit({
                        firstname: this.state.firstname,
                        lastname: this.state.lastname,
                        email: this.state.email,
                        phoneNumber: this.state.phoneNumber,
                        comment: this.state.comment
                      })}
                    >
                      <span>{ __('Submit') }</span>
                    </button>
                  </div>
               </Form>
           </ContentWrapper>
         </main>
       );
   }
 }


 export default Feedback;
