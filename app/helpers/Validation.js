/**
 @class Validation
 @desc helper class to provide static validation methods
 */
class Validation {
  /**
   @method filterString
   @param {String} str
   @desc test if a string only contains alphanumeric and underscores
   @return {Boolean} returns true if it passes the test
   */
  static isAllowedString(str) {
    const re = /^\w+$/g;
    return re.test(str);
  }

  /**
   @method isValidUsername
   @param {String} username
   @desc asserts that the username does not contain a space
   @return {Boolean} return true if the assertions passes
   */
  static isValidUsername(username) {
    if (Validation.isAllowedString(username)) {
      // ensure the username does not contain a whitespace
      return (username.indexOf(' ') < 0);
    }
    return false;
  }

  /**
   @method isValidEmail
   @param {String} email
   @desc checks if a provided email address is valid
   @return {Boolean} returns true if the emails is valid
   */
  static isValidEmail(email) {
    const re = /[a-z,0-9]/ig;
    const dotPos = email.lastIndexOf('.');
    const atPos = email.lastIndexOf('@');
    const whitespace = email.lastIndexOf(' ');
    const atPosMinus = email.substring(atPos - 1, atPos);
    return (atPos > 0 && dotPos > atPos &&
      whitespace < 0 && re.test(atPosMinus));
  }

  /**
    @method resolveMongooseErrorMsg
    @param {Object} errors
    @desc accepts mongoose models errors and break it into one statement
    @return {String} the final statement 
  */
  static resolveMongooseErrorMsg(errors) {
    if(errors) {
      if(errors.hasOwnProperty('code')) {
        if(errors.code === 11000) {
          // a duplicate key error ocured
          const msg = errors.errmsg;
          const key = 
          msg.split(':')[2].split(' ')[1].split('_').shift().toString();
          const value = errors.getOperation()[key];
          return `This ${key} '${value}' already exists!`;
        }
      } else if(errors.hasOwnProperty('errors')) {
        // a regular validation error occured
        const key = Object.keys(errors.errors)[0];
        return errors.errors[key].message;
      }
    }
    return 'Uknown error! Please contact for support'; // if we are unable to decipher what happened!
  }
}

export default Validation;
