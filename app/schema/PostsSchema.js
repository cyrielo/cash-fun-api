import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const PostsSchema = new Schema({

  media: {
    type: Array,
    required: true
  },

  caption: {
    type: String,
    maxlength: [100, 'Caption is too long']
  },

  description: {
    type: String
  },

  uid: {
    type: String,
    required: true
  },

  likes: {
    type: Array
  },

  comments: {
    type: Array
  },

  date: {
    type: Date,
    default: Date.now
  },

  has_cash: {
    type: Boolean,
    default: false
  }
});

export default PostsSchema;
