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
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  update(req, res) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.update(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  updatePassword(req, res) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.updatePassword(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  updateEmail(req, res) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.updateEmail(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  updateAvatar(req, res) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.updateAvatar(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((error) => {
        reject(error);
      });
    });    
  }

  remove(req, res) {
    return new Promise((fulfill, reject) => {
      this.UsersModel.remove(req, res)
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
