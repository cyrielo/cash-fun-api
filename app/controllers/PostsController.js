import PostsModel from '../models/PostsModel';


class PostsController {
  constructor() {
    this.PostsModel = new PostsModel();
  }

  create(req, res) {
    return new Promise((fulfill, reject) => {
      this.PostsModel.create(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((response) => {
        reject(response);
      });
    });
  }

  view(req, res) {
    return new Promise((fulfill, reject) => {
      this.PostsModel.view(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((response) => {
        reject(response);
      });
    });
  }

  update(req, res) {
    return new Promise((fulfill, reject) => {
      this.PostsModel.update(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((response) => {
        reject(response);
      });
    });
  }

  remove(req, res) {
    return new Promise((fulfill, reject) => {
      this.PostsModel.remove(req, res)
      .then((response) => {
        fulfill(response);
      })
      .catch((response) => {
        reject(response);
      });
    });
  }

}

export default PostsController;
