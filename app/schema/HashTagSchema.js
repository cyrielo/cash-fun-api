import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const HashTagSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },

  post_ids: {
    type: Array,
    required: true
  },

  total_posts: {
    type: Number,
    required: true
  }
});

export default HashTagSchema;
