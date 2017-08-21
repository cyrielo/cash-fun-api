import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsersSchema from '../schema/UsersSchema';
import Validation from '../helpers/Validation';
import config from '../config';

/**
  * @class UsersModel
  * @desc The usermodel containing actual functionalities
  *
*/
class UsersModel {
  constructor() {
    this.UsersModel =  mongoose.model('users', UsersSchema);
  }

  /**
    * @methid login
    * @param {Object}
    * @desc verifies that the account with certain credentials exists
    * @return {Promise} a promise object
  */
  login(req) {
    return new Promise((fulfill, reject) => {
      const email = req.body.email;
      const password = req.body.password;

      if(!email || !password) {
        reject({
          status: 400,
          message: 'Email and password is required!'
        });
      }
      this.UsersModel.findOne({
        email
      })
      .then((user) => {
        bcrypt.compare(password, user.password)
        .then((passwordMatch) => {
          if(passwordMatch) {
           user['password'] = undefined; // concealling the password hash
            fulfill({
              status: 200,
              message: 'Login successful',
              data: {
                token: jwt.sign(user, config.auth_secret, { expiresIn:'24h' })
              }
            });            
          } else {
            reject({
              status: 400,
              message: 'Invalid email and password combination!'
            });            
          }
        });
      })
      .catch((error) => {
        reject({
          status: 400,
          message: 'Invalid email and password combination'
        })
      });
    });
  }

  /**
    * @method addUser
    * @param {Object} req
    * @desc this creates a unique user in the database
    * @return {Promise} a promise object
    *
  */
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
            data: {
              user_id: user._id, 
              token: jwt.sign(user, config.auth_secret, { expiresIn: '24h'})}
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

  /**
    * @method getUsers
    * @param {Object} req
    * @desc get users in the system
    * @return {Promise} a promise object
  */
  getUsers(req) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.find()
      .then((users) => {
        fulfill({
          status: 200,
          message: 'users listed',
          data: users
        })
      })
      .catch((error) => {
        reject({
          status: 500,
          message: 'An error occured!',
          data: error
        });
      });
    });
  }

}

export default UsersModel;

