import UsersModel from '../models/UsersModel';

class UsersController {
  constructor() {
    this.UsersModel = new UsersModel();
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

}

export default UsersController;
