import UsersModel from '../models/UsersModel';
import PostsModel from '../models/PostsModel';
import HashTagModel from '../models/HashTagModel';
import Validation from '../helpers/Validation';

class SearchController {
  constructor() {
    this.UsersModel = new UsersModel();
    this.PostsModel = new PostsModel();
    this.HashTagModel = new HashTagModel();
  }

  suggest(req) {
    return new Promise((fulfill, reject) => {
      const searchTerm = req.params.term;

      if(Validation.isAllowedString(searchTerm)) {

        this.UsersModel.search(req, {
          username: searchTerm,
          fullname: searchTerm
        })
        .then((usersResult) => {
          this.HashTagModel.searchSuggest(searchTerm)
          .then((hashtagsResult) => {
            fulfill({
              status: 200,
              users: usersResult.data,
              hashtags: hashtagsResult.data
            });
          })
          .catch(() => {
            fulfill({
              status: 200,
              users: usersResult.data,
              hashtags: []
            })
          });
        })
        .catch((error) => {
          if(error.status === 404) {
            this.HashTagModel.searchSuggest(searchTerm)
            .then((hashtagsResult) => {
              fulfill({
                status: 200,
                users: [],
                hashtags: hashtagsResult.data
              });
            })
            .catch((error) => {
              reject(error);
            });
          } else {
            reject(error);
          }
        }); 
      }
    });
  }

  all(req, res) {
    return new Promise((fulfill, reject) => {
      const searchTerm = req.params.term;
      if(Validation.isAllowedString(searchTerm)) {
        this.UsersModel.search(req, {
          username: searchTerm,
          fullname: searchTerm
        })
        .then((usersResult) => {
          this.PostsModel.search(req, searchTerm)
          .then((hashtagsResult) => {
            fulfill({
              status: 200,
              message: 'Showing result for search term',
              data: {
                users: usersResult.data,
                hashtags: hashtagsResult.data
              }
            });
          })
          .catch((error) => {
            if(error.status === 404) {
              fulfill({
                status: 200,
                message: 'Showing result for search term',
                data: {
                  users: usersResult.data,
                  hashtags: []
                }
              });
            } else {
              reject(error);
            }
          });
        })
        .catch((error) => {
          if(error.status === 404) {
            this.PostsModel.search(req, searchTerm)
              .then((hashtagsResult) => {
                fulfill({
                  status: 200,
                  message: 'Showing result for search term',
                  data: {
                    users: [],
                    hashtags: hashtagsResult.data
                  }
                });
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            reject(error);
          }
        });        
      } else {
        reject({
          status: 400,
          message: 'Search term not valid'
        });
      }
    });
  }

  hashtag(req, res) {
    return new Promise((fulfill, reject) => {
      const hashtag = req.params.hashtag;
      if(Validation.isAllowedString(hashtag)) {
        this.PostsModel.search(req)
        .then((response) => {
          fulfill(response);
        })
        .catch((error) => {
          reject(error);
        });        
      } else {
        reject({
          status: 400,
          message: 'Search term not valid'
        });
      }
    });
  }

  user(req, res) {
    return new Promise((fulfill, reject) => {
      const username = req.params.user;
      const searchTerms = { username, fullname: username };
      if(Validation.isAllowedString(username)) {
        this.UsersModel.search(req, searchTerms)
        .then((response) => {
          fulfill(response);
        })
        .catch((error) => {
          reject(error)
        });
      } else {
        reject({
          status: 400,
          message: 'Search term not valid'
        });
      }
    });
  }

}

export default SearchController;
