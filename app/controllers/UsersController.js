import UsersModel from '../models/UsersModel';

class UsersController {
  constructor() {
    this.UsersModel = new UsersModel();
  }

  login(req) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.login(req)
      .then((response) => {
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });   
  }

  addUser(req) {
    return new Promise((fulfill, reject) => {
      
      this.UsersModel.addUser(req)
        .then((response) => {
          fulfill(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getUsers(req) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.getUsers(req)
      .then((response) => {
        console.log('Got here', response);
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

}

export default UsersController;
