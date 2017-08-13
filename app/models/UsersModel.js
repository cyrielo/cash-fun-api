import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UsersSchema from '../schema/UsersSchema';
import Validation from '../helpers/Validation';

/**
  * @class UsersModel
  * @desc The usermodel containing actual functionalities
  *
*/
class UsersModel {
  constructor() {
    this.UsersModel =  mongoose.model('users', UsersSchema);
  }

  addUser(req) {
    return new Promise((fulfill, reject) => {

      const errors = {};
      const username = req.body.username;
      const fullname = req.body.fullname ? req.body.fullname : username;
      const email = req.body.email;
      const password  = req.body.password;

      if(!username) {
        errors.username = 'Username is required';
      }

      if(!email) {
        errors.email = 'Email address is required';
      }

      if(!password) {
        errors.password = 'You\'ve not chosen a password';
      }

      if(Object.keys(errors).length < 1) {
        // no errors     
        const newUser  = {
          fullname,
          username,
          email,
          password: bcrypt.hashSync(password, 10)
        };

        const User = new this.UsersModel(newUser);
        User.save()
        .then((user) => {
          fulfill({
            status: 201,
            message: 'User created successfully',
            data:{ user_id: user._id}
          });
        })
        .catch((error) => {
          const errorMsg = Validation.resolveMongooseErrorMsg(error);
          reject({
            status: 400,
            message: 'You have errors in the submitted form',
            data: errorMsg
          });
        });
      } 
      else {
        reject({
          status: 400,
          message: 'You have errors in the submitted form',
          data: errors
        });
      }
    });
  }

}

export default UsersModel;

