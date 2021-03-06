import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import fs from 'fs';
import PostsSchema from '../schema/PostsSchema';
import UsersModel from '../models/UsersModel';
import HashTagHelper from '../helpers/HashTagHelper';
import HashTagModel from '../models/HashTagModel';

class PostsModel {
  constructor() {
    this.PostsModel = mongoose.model('posts', PostsSchema);
    this.UsersModel = new UsersModel();
    this.HashTagModel = new HashTagModel();
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
      const hashCash = (req.body.has_cash && req.body.has_cash === 'true');

      const newPost = { has_cash: hashCash, uid };
      const errors = {};

      if (caption) {
        if (caption.trim().length < 1) {
          errors.caption = 'Caption is empty';
        } else {
          newPost.caption = caption.trim();
        }
      }

      if (description) {
        if (description.trim().length < 1) {
          errors.description = 'description is empty';
        } else {
          newPost.description = description.trim();
        }
      }

      if (!media) {
        errors.media = 'Make a multipart post request to upload a media file';
      } else {
        newPost.media = [];
      }

      // a counter to ensure media have been uploaded before ending the request
      let counter = 1;
      if (Object.keys(errors).length < 1) {
        media.forEach((file) => {
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
            if (counter === media.length) {
              const NewPost = new this.PostsModel(newPost);
              NewPost.save()
              .then((savedPost) => {
                let postContent = (caption) ? caption.trim() : ''; 
                postContent += (description) ? ' '+ description.trim() : '';
                const hashtagsInfos = [];
                const hashtags = HashTagHelper.getHashTag(postContent);

                hashtags.forEach((title) => {
                  hashtagsInfos.push({ title, post_id: savedPost._id });
                });
                this.HashTagModel.saveMultiple(hashtagsInfos)
                .then(() => {
                  fulfill({
                    status: 201,
                    message: 'Post submitted!',
                    data: newPost
                  }); 
                })
                .catch(() => {
                  reject({
                    status: 400,
                    message: 'Error unable to save hashtags!',
                    data: errors
                  });
                });
              })
              .catch((errors) => {
                reject({
                  status: 400,
                  message: 'Error saving post, you have an error in your post',
                  data: errors
                });
              });
            }
            counter += 1;
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

  /**
    * @method view
    * @param {Object} req
    * @param {Object} res
    * @desc view posts
    * @return {Promise} a promise object
  */
  view(req, res) {
    return new Promise((fulfill, reject) => {
      const postId = req.query.id || undefined;
      const user = req.query.user || res.locals.user.username;
      const page = req.query.page || undefined;
      const limit = parseInt(req.query.limit) || 10;

      if(postId) {
        this.PostsModel.findById(postId)
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
        const a = { query: { user } };
        this.UsersModel.getUsers(a)
        .then((response) => {
          const userId = response.data._id;
          this.PostsModel.find({ uid: userId })
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
        });
      }
    });
  }

  /**
    * @method update
    * @param {Object} req
    * @param {Object} res
    * @desc update a post
    * @return {Promise} a promise object
  */
  update(req, res) {
    return new Promise((fulfill, reject) => {
      const postId = (req.body.id || req.query.id) || undefined;
      const uid = res.locals.user.id;
      const caption = req.body.caption || undefined;
      const description = req.body.description || undefined;
      const hashCash = (req.body.has_cash && req.body.has_cash === 'true');

      const update = {};

      if (caption) {
        update.caption = caption.trim();
      }

      if (description) {
        update.description = description.trim();
      }

      if (postId) {
        this.PostsModel.findById(postId)
        .then((post) => {
          if (uid === post.uid) {
            if (!post.has_cash) {
              update.has_cash = hashCash;
            }

            const oldPostContent = `${post.caption} ${post.description}`;

            let newPostContent = (caption) ? caption.trim() : '';
            newPostContent += (description) ? ` ${description.trim()}` : '';

            const oldHashtags = HashTagHelper.getHashTag(oldPostContent);
            const newHashtags = HashTagHelper.getHashTag(newPostContent);

            const compare = HashTagHelper.compare(oldHashtags, newHashtags);

            const newHashtagsInfos = [];
            compare.newer.forEach((hashtag) => {
              newHashtagsInfos.push({
                title: hashtag,
                post_id: post._id
              });
            });
            this.PostsModel.findByIdAndUpdate(postId, update)
            .then(() => {
              if (compare.obsolete.length) {
                this.HashTagModel.deleteMultiple(compare.obsolete, [post._id])
                .then(() => {
                  if (compare.newer.length) {
                    this.HashTagModel.saveMultiple(newHashtagsInfos)
                    .then(() => {
                      fulfill({
                        status: 200,
                        message: 'Post updated',
                        data: Object.assign(post, update)
                      });
                    })
                    .catch((error) => {
                      reject(error);
                    });
                  }
                })
                .catch((error) => {
                  reject(error);
                });
              } else if (compare.newer.length) {
                this.HashTagModel.saveMultiple(newHashtagsInfos)
                .then(() => {
                  fulfill({
                    status: 200,
                    message: 'Post updated',
                    data: Object.assign(post, update)
                  })
                  .catch((error) => {
                    reject(error);
                  });
                })
                .catch((error) => {
                  reject(error);
                });
              } else {
                fulfill({
                  status: 200,
                  message: 'Post updated',
                  data: Object.assign(post, update)
                });
              }
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
            });
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
        });
      }
    });
  }

  /**
    * @method remove
    * @param {Object} req
    * @param {Object} res
    * @desc remove a specific
    * @return {Promise} a promise object
  */
  remove(req, res) {
    return new Promise((fulfill, reject) => {
      const id = req.query.id;
      const uid = res.locals.user.id;
      this.PostsModel.findById(id)
      .then((post) => {
        if (uid === post.uid) {
          this.PostsModel.remove({ _id: id })
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
          });
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

  /**
    * @method search
    * @param {Object} req
    * @param {String} hashtag
    * @desc searches the Hastag collection and gets their postids and return
    * the posts
    * @return {Promise} a promise object
  */
  search(req, hashtag) {
    return new Promise((fulfill, reject) => {
      const limit = parseInt(req.query.limit, 10) || 5;
      const page = parseInt(req.query.page, 10) || 0;

      this.HashTagModel.search(hashtag)
      .then((response) => {
        const hashtags = response.data;

        if (hashtags) {
          const postIds = hashtags.post_ids;
          const pattern = { $or: [] };
          postIds.forEach((postId) => {
            pattern.$or.push({ _id: postId });
          });
          this.PostsModel.find(pattern)
          .skip(page * limit)
          .limit(limit)
          .then((result) => {
            if (result.length) {
              fulfill({
                status: 200,
                data: result
              });
            } else {
              reject({
                status: 404,
                message: 'No posts found!'
              });
            }
          })
          .catch((error) => {
            reject(error);
          });
        } else {
          reject({
            status: 404,
            message: 'No posts found!'
          });
        }
      })
      .catch((error) => {
        reject({
          status: 500,
          message: 'Something went wrong',
          error
        });
      });
    });
  }

}

export default PostsModel;
