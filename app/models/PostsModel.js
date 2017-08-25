import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import config from '../config';
import PostsSchema from '../schema/PostsSchema';

class PostsModel {
  constructor() {
    this.PostsModel = mongoose.model('posts', PostsSchema);
  }

  /**
    * @method create
    * @param {Object} req
    * @param {Object} res
    * @desc creates a new post for a user and uploads the user's media
    * @return {Promise} a promise object
    *
  */
  create(req, res) {
    return new Promise((fulfill, reject) => {
      const media = req.files;
      const caption = req.body.caption || undefined;
      const description = req.body.description || undefined;
      const uid = res.locals.user.id;
      let has_cash = 
        (req.body.has_cash && req.body.has_cash === 'true') ? true : false;

      const newPost = { has_cash, uid };
      const errors = {};

      if(caption) {
        if(caption.trim().length < 1) {
          errors.caption = 'Caption is empty';
        } else {
          newPost.caption = caption;
        }
      }

      if(description) {
        if(description.trim().length < 1) {
          errors.description = 'description is empty';
        } else {
          newPost.description = description;
        }        
      }

      if(!media) {
        errors.media = 'Make a multipart post request to upload a media file';
      } else {
        newPost.media = [];
      }

      // a counter to ensure media have been uploaded before ending the request
      let counter = 1;
      if(Object.keys(errors).length < 1) {
        media.forEach((file, index) => {
          let currentTime = new Date().getTime();
          let newFileName = `${file.destination + uid + '.' + currentTime}.jpg`;
          fs.renameSync(file.path, newFileName);
          cloudinary.uploader.upload(newFileName, (result) => {
            fs.unlinkSync(newFileName);
            newPost.media.push({
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
            if(counter === media.length) {
              const NewPost = new this.PostsModel(newPost);
              NewPost.save()
              .then(() => {
               fulfill({
                  status: 201,
                  message: 'Post submitted!',
                  data: newPost
                });
              })
              .catch((errors) => {
                reject({
                  status: 400,
                  message: 'You have an error in your post',
                  data: errors
                });
              });
            }
            counter++;
          });
        });
      } else {
        reject({
          status: 400,
          message: 'You have an error in your post',
          data: errors
        });
      }
    });
  }

  view(req, res) {
    return new Promise((fulfill, reject) => {
      const postId = req.query.id || undefined;
      const uid = req.query.user || res.locals.user.id;
      const page = req.query.page || undefined;
      const limit = parseInt(req.query.limit) || 10;
      let findBy = {};

      if(postId) {
        findBy = { _id : postId };
      } else {
        findBy = {uid};
      }

      if(page) {
        console.log('The limit is', limit);
        this.PostsModel.find(findBy)
        .skip(page * limit)
        .limit(limit)
        .then((posts) => {
          fulfill({
            status: 200,
            message: 'All posts listed!',
            data: posts
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            error
          });
        });
      } else {
        this.PostsModel.find(findBy)
        .then((posts) => {
          console.log('Found posts', posts);
          fulfill({
            status: 200,
            message: 'All posts listed!',
            data: posts
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            error
          });
        });
      }
    });
  }

  update(req, res) {
    return new Promise((fulfill, reject) => {
      const postId = (req.body.id || req.query.id) || undefined;
      const uid = res.locals.user.id;
      const caption = req.body.caption || undefined;
      const description = req.body.description || undefined;
      let has_cash = 
        (req.body.has_cash && req.body.has_cash === 'true') ? true : false;

      const update = {};

      if(caption) {
        update.caption = caption;
      }

      if(description) {
        update.description = description;
      }

      if(postId) {
        this.PostsModel.findById(postId)
        .then((post) => {
          if(uid === post.uid) {
            if(!post.has_cash) {
              update.has_cash = has_cash;
            }
            this.PostsModel.findByIdAndUpdate(postId, update)
            .then((updatedPost) => {
              fulfill({
                status: 200,
                message: 'Post updated successfully!',
                data: Object.assign(post, update) 
              });
            })
            .catch((error) => {
              reject({
                status: 500,
                error
              });
            });
          } else {
            reject({
              status: 403,
              message: 'Permission denied!'
            })
          }
        })
        .catch((error) => {
          reject({
            status: 500,
            message: 'Unable to find the post',
            error
          });
        });        
      } else {
        reject({
          status: 400,
          message: 'Unable to update, post id not provided!'
        })
      }
    });
  }

  remove(req, res) {
    return new Promise((fulfill, reject) => {
      const _id = req.query.id;
      const uid = res.locals.user.id;
      this.PostsModel.findById(_id)
      .then((post) => {
        if(uid === post.uid) {
          this.PostsModel.remove({ _id })
          .then(() => {
            fulfill({
              status: 200,
              message: 'Post deleted!'
            });
          })
          .catch((error) => {
            reject({
              status: 500,
              error
            });
          });
        } else {
          reject({
            status: 403,
            message: 'Permission denied!'
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

}

export default PostsModel;
