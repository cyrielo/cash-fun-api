import express from 'express';
import MediaHelper from '../helpers/MediaHelper';
import Authentication from '../middleware/Authentication';
import UsersController from './../controllers/UsersController';

/**
 @class UsersRoute
 @desc Route for user related activities
 */
class UsersRoute {

  /**
   @method constructor
   @desc constructor to create acces to the express router
   and provide acces to the UsersController
   */
  constructor() {
    this.UsersController = new UsersController();
    this.router = express.Router();
    this.uploader = MediaHelper.setupUploader();
  }

  /**
   @method loadRoutes
   @desc provides the router access for current route
   @return {Object}
   */
  loadRoutes() {
    this.getUsers(); // fetching user route
    this.addUser(); // adding new user route
    this.remove(); // removing user route
    this.update(); // a route to handle updating user details
    this.login(); // a route to authenticate a user and get a new token
    this.updatePassword(); //a route for updating the user's password
    this.updateEmail(); // a route to update the user's email address
    this.updateAvatar(); // update the user's avatar
    return this.router;
  }

  login() {
     this.router.post('/login', (req, res) => {
      this.UsersController.login(req)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });   
  }

  /**
   *@method getUsers
   @desc provide routes to list all users
   */
  getUsers() {
    this.router.get('/', Authentication.authenticate, (req, res) => {
      this.UsersController.getUsers(req)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }

  /**
   @method addUser
   @desc provide router to create a new user
   */
  addUser() {
    this.router.post('/', (req, res) => {
      this.UsersController.addUser(req)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }

  /**
   @method updateUser
   @desc provide a route to update user details
   */
  update() {
    this.router.put('/', Authentication.authenticate, (req, res) => {
      this.UsersController.update(req, res)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }

  /**
    * @method updatePassword
    * @desc a route for users to update their password
  */
  updatePassword() {
    this.router.put('/password', Authentication.authenticate, (req, res) => {
      this.UsersController.updatePassword(req, res)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });    
  }

  /**
    * @method updateEmail
    * @desc a route for users to update their email address
  */
  updateEmail() {
    this.router.put('/email', Authentication.authenticate, (req, res) => {
      this.UsersController.updateEmail(req, res)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });    
  }

  /**
    * @method updateAvatar
    * @desc a route for users to update profile picture
  */
  updateAvatar() {
    this.router.put('/avatar', Authentication.authenticate, 
      this.uploader.any(), (req, res) => {
      this.UsersController.updateAvatar(req, res)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });    
  }

  /**
   @method removeUser
   @desc provides a route to remove a user
   */
  remove() {
    this.router.delete('/', Authentication.authenticate, (req, res) => {
      this.UsersController.remove(req, res)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }
}

export default UsersRoute;
