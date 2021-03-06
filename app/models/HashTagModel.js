import mongoose from 'mongoose';
import HashTagSchema from '../schema/HashTagSchema';

class HashTagModel {
  constructor() {
    this.HashTagModel = mongoose.model('hashtags', HashTagSchema);
  }

  /**
    * @method search
    * @param {String} title
    * @desc provides ability to search for hashtags that have been saved
    * @return {Promise} a promise object
  */
  search(title) {
    return new Promise((fulfill, reject) => {
      this.HashTagModel.findOne({
        title: { $regex: new RegExp(title, 'ig') }
      })
      .then((result) => {
        fulfill({
          status: 200,
          data: result
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

  /**
    * @method searchSuggest
    * @param {String} title
    * @desc provides ability to suggest search for hashtags
    * @return {Promise} a promise object
  */
  searchSuggest(title) {
    return new Promise((fulfill, reject) => {
      this.HashTagModel.find({
        title: { $regex: new RegExp(title, 'ig') }
      })
      .select('title')
      .limit(5)
      .then((result) => {
        if (result.length) {
          fulfill({
            status: 200,
            data: result
          });
        } else {
          reject({
            status: 404,
            message: 'No result found!'
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
    * @method delePost
    * @param {String} title
    * @param {String} post_id
    * @desc allows you to remove a postId associated to the specified hashtag
    * @return {Promise} a promise object
  */
  deletePost(title, post_id) {
    return new Promise((fulfill, reject) => {
      this.HashTagModel.findOne({ title })
      .then((hashtag) => {
        if (hashtag) {
          const post_ids = hashtag.post_ids;
          const pos = post_ids.indexOf(post_id);

          if (pos >= 0) {
            post_ids.splice(pos, 1); // delete the post id from array
            const total_posts = post_ids.length;
            this.HashTagModel.update({ title }, { post_ids, total_posts })
            .then(() => {
              fulfill({
                status: 200,
                message: 'hashtag details updated!'
              });
            })
            .catch((error) => {
              reject({
                status: 500,
                error
              });
            });
          } else {
            fulfill({
              status: 200,
              message: 'Hashtags and post were not associated!'
            });
          }
        } else {
          reject({
            status: 404,
            message: 'Unable to delete, hashtag not found!'
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
    * @method deleteMultiple
    * @param {Array} hashtags
    * @param {Array} post_ids
    * @desc deasociate specified hashtags from the specified post ids
    * @return {Promise} a promise object
  */
  deleteMultiple(hashtags, post_ids) {
    return new Promise((fulfill, reject) => {
      hashtags = Array.from(new Set(hashtags)); // remove duplicate hastags

      let cursor = post_ids.length - 1;
      let cursor2 = hashtags.length - 1;
      const d = () => {
        const c = () => {
          this.deletePost(hashtags[cursor2], post_ids[cursor])
          .then(() => {
            cursor2 -= 1;
            if (cursor2 >= 0) {
              c();
            } else if (cursor > 0) {
              cursor -= 1;
              cursor2 = hashtags.length - 1;
              d();
            } else {
              fulfill({
                status: 200,
                message: 'Deleted multiple hashtags from posts'
              });
            }
          })
          .catch((error) => {
            reject(error);
          });
        };
        c();
      };
      d();
    });
  }

  /**
    * @method view
    * @param {Object} req
    * @desc allows you to view and sort all hashtags in the system
    * @return {Promise} a promise object
  */
  view(req) {
    return new Promise((fulfill, reject) => {
      const orderBy = req.query.order_by;
      const order = req.query.order;

      switch (orderBy) {
        case 'posts':
          const direction = (order === 'asc') ? -1 : 1;
          this.HashTagModel.find()
          .sort({ total_posts: direction })
          .then((hashtags) => {
            fulfill({
              status: 200,
              message: 'Hastags listed!',
              data: hashtags
            });
          })
          .catch((error) => {
            reject({
              status: 500,
              error
            });
          });
        break;

        default:
          this.HashTagModel.find()
          .then((hashtags) => {
            fulfill({
              status: 200,
              message: 'Hastags listed!',
              data: hashtags
            });
          })
          .catch((error) => {
            reject({
              status: 500,
              error,
              message: 'Unable to list hashtags!'
            });
          });
      }
    });
  }

  /**
    * @method save
    * @param {String} title
    * @param {String} id
    * @desc associate a post id to the specified hashtag
    @return {Promise} a promise object
  */
  save(title, id) {
    return new Promise((fulfill, reject) => {
      this.exists(title)
      .catch(() => {
        const hashtag = {
          title,
          post_ids: [id],
          total_posts: 1
        };
        const newHashTag = new this.HashTagModel(hashtag);
        newHashTag.save((tag) => {
          fulfill({
            status: 201,
            message: 'Hashtag saved',
            data: tag
          });
        })
        .catch((error) => {
          reject({
            status: 500,
            error
          });
        });
      })
      .then((tag) => {
        const post_ids = tag.post_ids;
        if (post_ids.indexOf(id) < 0) {
          post_ids.push(id);
          this.HashTagModel.update({ title }, {
            post_ids,
            total_posts: post_ids.length
          })
          .then((oldTag) => {
            fulfill({
              status: 201,
              message: 'Hashtag saved',
              data: Object.assign(oldTag, { post_ids })
            });
          })
          .catch((error) => {
            reject({
              status: 500,
              error
            });
          });
        } else {
          fulfill({
            status: 201,
            message: 'Already saved hashtag!'
          });
        }
      });
    });
  }

  /**
    * @method saveMultiple
    * @param {Object} hashtags
    * @desc automatically calls the save method to calculate total post while
    * saving new hastags
    * @return {Promise} a promise object
  */
  saveMultiple(hashtags) {
    return new Promise((fulfill, reject) => {
      if (hashtags.length) {
        let cursor = hashtags.length - 1;
        const multipleSave = () => {
          this.save(hashtags[cursor].title, hashtags[cursor].post_id)
          .then(() => {
            cursor -= 1;
            if (cursor === -1) {
              fulfill({
                status: 201,
                message: 'Saved multiple hashtags!'
              });
            } else {
              multipleSave();
            }
          })
          .catch((error) => {
            reject(error);
          });
        };
        multipleSave();
      } else {
        reject({
          status: 200,
          message: 'Nothing to save'
        });
      }
    });
  }

  /**
    * @method exists
    * @param {String} title
    * @desc asserts if an the specified hashtag title exists
    * @return {Promise} a promise object
  */
  exists(title) {
    return new Promise((fulfill, reject) => {
      this.HashTagModel.findOne({ title })
      .then((result) => {
        if (result !== null) {
          fulfill(result);
        } else {
          reject('');
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  /**
    * @method remove
    * @param {String} title
    * @desc removes the hash tag from record
    * @return {Promise} a promise object
  */
  remove(title) {
    return new Promise((fulfill, reject) => {
      this.exists(title)
      .then(() => {
        this.HashTagModel.remove({ title })
        .then(() => {
          fulfill({
            status: 200,
            message: 'Hastag deleted!'
          });
        })
        .catch(() => {
          reject({
            status: 500,
            message: 'Unable to delete hashtag!'
          });
        });
      })
      .catch(() => {
        reject({
          status: 404,
          message: 'Unable to delete, hashtag not found!'
        });
      });
    });
  }

}

export default HashTagModel;
