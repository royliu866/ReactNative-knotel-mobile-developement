
'use strict';


import RegexHelper from '../helpers/regex-helper';




const validationHelper = {

  isRequiredFieldNotEmpty(text, fieldName) {
    text = text.trim();

    if (!text.length) {
      return {
        validated: false,
        error: fieldName + ' is required',
      };
    }

    return {
      validated: true,
      error: ' ',
    };
  },




  isRequiredFieldEmail(email) {
    email = email.trim();

    if (!email.length) {
      return {
        validated: false,
        error: 'Email is required',
      };
    }

    if (!RegexHelper.isEmail(email)) {
      return {
        validated: false,
        error: 'This doesn\'t look like a correct email',
      };
    }

    return {
      validated: true,
      error: ' ',
    };
  },




  isOptionalFieldUSphoneNumber(number) {
    number = number.trim();

    if (!number) {
      return {
        validated: true,
        error: ' ',
      };
    }

    if (number.split('').filter(c => c >= '0' && c <= '9').length !== 10) {
      return {
        validated: false,
        error: 'This doesn\'t look like a correct phone number',
      };
    }

    return {
      validated: true,
      error: ' ',
    };
  },




  isPasswordMeetComplexityRequirements(password) {
    const MinLength = 8;
    const LowercaseLetters = /[a-z]/;
    const UppercaseLetters = /[A-Z]/;
    const Digits = /[0-9]/;
    const SpecialCharacters = /[§|±|!|@|#|$|%|^|&|*|(|)|_|+|-|=|\[|\]|\{|\}|\'|\\|:|;|\||"|,|.|/|<|>|?|`|~]/;

    if (password.length < MinLength) {
      return {
        validated: false,
        error: 'At least 8 characters',
      };
    }

    if (
      !LowercaseLetters.test(password) ||
      !UppercaseLetters.test(password) ||
      !Digits.test(password) ||
      !SpecialCharacters.test(password)
    ) {
      return {
        validated: false,
        error: 'Must contain lowercase and uppercase letters, special characters and digits',
      };
    }

    return {
      validated: true,
      error: ' ',
    };
  },

};


export default validationHelper;
