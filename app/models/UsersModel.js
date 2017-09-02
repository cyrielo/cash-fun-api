import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import cloudinary from 'cloudinary';
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
           const userPayload = {
            username: user.username,
            id: user._id,
            fullname: user.fullname
           };
           fulfill({
            status: 200,
            message: 'Login successful',
            data: {
              token: jwt.sign(userPayload, config.auth_secret, { expiresIn:'24h' })
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
        bcrypt.hash(password, 10)
        .then((hash) => {
          const newUser  = {
            fullname,
            username,
            email,
            password: hash
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
      const username = req.query.user;
      const page = req.query.page;
      const limit = parseInt(req.query.limit) || 10;

      let findBy = {};

      if(username) {
        findBy = { username };
      }

      if(username) {
        this.UsersModel.findOne({ username })
        .then((user) => {
          fulfill({
            status: 200,
            message: 'User found!',
            data: user
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            error
          });
        });
      } else if(page) {
        this.UsersModel.find()
        .skip(page * limit)
        .limit(limit)
        .then((users) => {
          fulfill({
            status: 200,
            message: 'paginated users listed',
            data: users
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            message: 'An error occured!',
            data: error
          });
        });
      } else {
        this.UsersModel.find()
        .then((users) => {
          fulfill({
            status: 200,
            message: 'all users listed',
            data: users
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            message: 'An error occured!',
            data: error
          });
        });        
      }
    });
  }

  /**
    @method update
    @param {Object} req
    @param {Object} res
    @desc provide ability to update basic user profile details
    @return {Promise} a promise object
  */
  update(req, res) {
    return new Promise((fulfill, reject) => {
      const uid = res.locals.user.id;
      const fullname = req.body.fullname;
      const username = req.body.username;
      const bio = req.body.bio;
      const gender = req.body.gender;
      const phone = req.body.phone;
      const update = {};


      if(fullname && fullname.trim().length > 0) {
        update.fullname = fullname;
      }

      if(username && username.trim().length > 0) {
        update.username = username;
      }

      if(bio && bio.trim().length > 0) {
        update.bio = bio;
      }

      if(gender && gender.trim().length > 0) {
        update.gender = gender;
      }

      if(phone && phone.trim().length > 0) {
        update.phone = phone;
      }

      this.UsersModel.findByIdAndUpdate(uid, update)
      .then((user) => {
        fulfill({
          status: 200,
          message: 'User updated',
          data: Object.assign(user, update)
        });
      })
      .catch((error) => {
        reject({
          status: 500,
          error
        })
      });

    });
  }

  updatePassword(req, res) {
    return new Promise((fulfill, reject) => {

      const uid = res.locals.user.id;
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const confirmPassword = req.body.confirmPassword;

      this.UsersModel.findById(uid)
      .then((user) => {
        bcrypt.compare(oldPassword, user.password)
        .then((passwordMatch) => {
          if(passwordMatch){
            if(newPassword === confirmPassword) {
              bcrypt.hash(newPassword, 10)
              .then((hash) => {
                this.UsersModel.findByIdAndUpdate(uid, { password: hash })
                .then(() => {
                  fulfill({
                    status: 200,
                    message: 'Password updated successfully!'
                  });
                })
                .catch((error) => {
                  reject({
                    status: 500,
                    message: 'Unable to update model',
                    error
                  });
                });
              })
              .catch((error) => {
                reject({
                  status: 500,
                  message: 'Unable to process password change'
                });
              });
            }else {
              reject({
                status: 400,
                message: 'Your new password do not match'
              });
            }
          } else {
            reject({
              status: 403,
              message: 'Old password is incorrect, access denied!'
            })
          }
        })
        .catch(() => {
          reject({
            status: 500,
            message: 'bcrypt error'
          })
        });
      })
      .catch((error) => {
        reject({
          status: 500,
          error
        });
      });

    });
  }

  updateEmail(req, res) {
    return new Promise((fulfill, reject) => {
      const uid = res.locals.user.id;
      const newEmail = req.body.email;
      this.UsersModel.findById(uid)
      .then((user) => {
        if(newEmail !== user.email) {
          // TODO send an email to the user
          fulfill({
            status: 200,
            message: 'Activation code has been sent to your new email!'
          })
        } else {
          reject({
            status: 400,
            message: 'New email is same as old'
          })
        }
      })
      .catch((error) => {
        reject({
          status: 500,
          error
        });
      });
    });
  }

  updateAvatar(req, res) {
    return new Promise((fulfill, reject) => {
      const uid = res.locals.user.id;
      const photo = (req.files) ? req.files[0] : undefined;

      if(photo) {
        const fileExtension =  photo.mimetype.split('/')[1];
        const img = ['jpg', 'jpeg', 'png'];
        if(img.indexOf(fileExtension) >= 0) {

          let currentTime = new Date().getTime();

          let newFileName = 
          `${photo.destination + uid + '.' + currentTime + '.' + fileExtension}`;
          fs.renameSync(photo.path, newFileName);
          cloudinary.uploader.upload(newFileName, (result) => {
            fs.unlinkSync(newFileName);
            let update = { photo: result.secure_url };
            this.UsersModel.findByIdAndUpdate(uid, update)
            .then((user) => {
              fulfill({
                status: 200,
                message: 'Profile picture updated!',
                data: Object.assign(user, update)
              })
              .catch((error) => {
                reject({
                  status: 500,
                  error
                });
              })
            })
          });
        } else {
          reject({
            status: 400,
            message: 'You can only use an image as an avatar'
          })
        }
      } else {
        reject({
          status: 400,
          message: 'No image selected!'
        })
      }
    });
  }

  remove(req, res) {
    return new Promise((fulfill, reject) => {
      const uid = res.locals.user.id;
      this.UsersModel.remove({ _id : uid })
      .then(() => {
        fulfill({
          status: 200,
          message: 'Your account has been deleted!'
        });
      })
      .catch(() => {
        reject({
          status: 500,
          message: 'Unable to delete account!'
        })
      });
    });
  }

  /**
    * @method search
    * @param {Object} userObject
    * @desc allows you search for a user based on username or fullname or email
    * @return {Promise} a promise object
  */
  search(userObject) {
    return new Promise((fulfill, reject) => {
      const { username, fullname, email } = userObject;
      const pattern = { $or: []};

      if(username) {
        let u = { $regex: new RegExp(username, 'ig') };
        pattern['$or'].push({ username: u  });
      }

      if(fullname) {
        let f = { $regex: new RegExp(fullname, 'ig') };
        pattern['$or'].push({ fullname: f  });
      }

      if(email) {
        let e = { $regex: new RegExp(email, 'ig') };
        pattern['$or'].push({ email: e  });
      }

      this.UsersModel.find(pattern)
      .then((result) => {
        if(result.length) {
          fulfill({
            status: 200,
            message: 'Search results found:',
            data: result
          });
        } else {
          reject({
            status: 404,
            message: 'Search result not found!'
          })
        }

      })
      .catch((error) => {
        reject({
          status: 500,
          error
        });
      })
    });
  }

}

export default UsersModel;

