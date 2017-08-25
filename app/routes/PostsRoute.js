import express from 'express';
import multer from 'multer';
import path from 'path';
import MediaHelper from '../helpers/MediaHelper';
import Authentication from '../middleware/Authentication';
import PostsController from '../controllers/PostsController';

class PostsRoute {
  constructor() {
    const dest = 'uploads/';
    this.PostsController = new PostsController();
    this.router = express.Router();
    this.uploader = multer({ dest, fileFilter: function(req, file, cb) {
      const mimetype = file.mimetype;
      if(MediaHelper.isAllowedFile(mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }});
  }

  loadRoutes() {
 
    this.create();
    this.view();
    this.update();
    this.remove();
    return this.router;
  }

  create() {
    this.router.post('/', Authentication.authenticate, 
      this.uploader.array('media'), (req, res) => {

      this.PostsController.create(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((response) => {
        res.status(response.status).json(response);
      });
    });
  }

  view() {
    this.router.get('/', Authentication.authenticate, (req, res) => {
      this.PostsController.view(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((response) => {
        res.status(response.status).json(response);
      });
    });
  }

  update() {
    this.router.put('/', Authentication.authenticate, (req, res) => {
      this.PostsController.update(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((response) => {
        res.status(response.status).json(response);
      });
    });
  }

  remove() {
    this.router.delete('/', Authentication.authenticate, (req, res) => {
      this.PostsController.remove(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((response) => {
        res.status(response.status).json(response);
      });
    });
  }
}

export default PostsRoute;
