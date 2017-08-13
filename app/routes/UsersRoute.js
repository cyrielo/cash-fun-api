import express from 'express';
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
  }

  /**
   @method loadRoutes
   @desc provides the router access for current route
   @return {Object}
   */
  loadRoutes() {
    this.getUsers(); // fetching user route
    this.addUser(); // adding new user route
    this.removeUser(); // removing user route
    this.searchUser(); // searching for existing users
    this.updateUser(); // a route to handle updating user details
    this.getPaginatedUsers(); // a route to get users in pages
    return this.router;
  }

  /**
   *@method getUsers
   @desc provide routes to list all users
   */
  getUsers() {
    this.router.get('/', (req, res) => {
      this.UsersController.getUsers()
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
  updateUser() {
    this.router.patch('/:id', (req, res) => {
      this.UsersController.updateUser(req)
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
  removeUser() {
    this.router.delete('/:id', (req, res) => {
      this.UsersController.removeUser(req)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }

  /**
   @method getPaginatedUsers
   @desc provide a route to get paginated users
   */
  getPaginatedUsers() {
    this.router.get('/filter', (req, res) => {
      this.UsersController.getPaginatedUsers(req)
        .then((response) => {
          res.status(response.status).json(response);
        })
        .catch((error) => {
          res.status(error.status).json(error);
        });
    });
  }

  /**
   @method searchUser
   @desc provide a route to search for users
   */
  searchUser() {
    this.router.get('/search/:term', (req, res) => {
      this.UsersController.searchUser(req)
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
