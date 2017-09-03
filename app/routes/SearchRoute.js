import express from 'express';
import Authentication from '../middleware/Authentication';
import SearchController from '../controllers/SearchController';
import HashTagModel from '../models/HashTagModel';

class SearchRoute {
  constructor() {
    this.router = express.Router();
    this.SearchController = new SearchController();
  }

  loadRoutes() {
    this.hashtag(); // a route for searching for hashtags
    this.user(); // a route for searching user
    this.all(); // search for both hashtags and users
    this.suggest(); // suggest result
    return this.router;
  }

  all() {
    this.router.get('/:term', Authentication.authenticate, (req, res) => {
      this.SearchController.all(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((error) => {
        res.status(error.status).json(error);
      });
    });    
  }

  suggest() {
    this.router.get('/suggest/:term', Authentication.authenticate, (req, res) => {
      this.SearchController.suggest(req)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((error) => {
        res.status(error.status).json(error);
      });
    });   
  }

  hashtag() {
    this.router.get('/hashtag/:hashtag', Authentication.authenticate, 
      (req, res) => {
      this.SearchController.hashtag(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((error) => {
        res.status(error.status).json(error);
      });
    });
  }

  user() {
    this.router.get('/user/:user', Authentication.authenticate, (req, res) => {
      this.SearchController.user(req, res)
      .then((response) => {
        res.status(response.status).json(response);
      })
      .catch((error) => {
        res.status(error.status).json(error);
      });
    });
  }

}

export default SearchRoute;
