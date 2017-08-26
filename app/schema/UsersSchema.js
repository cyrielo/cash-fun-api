import mogoose from 'mongoose';
import Validation from "../helpers/Validation";

const Schema = mogoose.Schema;

const UsersSchema = new Schema({
  fullname: {
    type: String,
    maxlength: 30,
    required: true,
    default: ''
  },

  photo: {
    type: String
  },
  
  username: {
    type: String,
    validate: [{
      validator: Validation.isValidUsername,
      msg: 'Invalid username! Ensure username has no space'
    }],
    unique: [true, 'Username is already taken'],
    maxlength: [30, 'Username is too long, try something shorter'],
    minlength: [3, 'Username is too short, try at least 3 characters'],
    required: true
  },

  email: {
    type: String,
    validate: [{
      validator: Validation.isValidEmail,
      msg: 'Invalid email, ensure the @ comes before the domain name'
    }],
    required: true,
    unique: [true, 'This email `{VALUE}` already exists'],
    maxlength: [100, 'Email is too long']
  },

  bio: {
    type: String,
    maxlength: 140
  },

  gender: {
    type: String,
    maxlength: 6,
    minlength: 4,
    required: true,
    default: 'None'
  },

  phone: {
    type: String,
    maxlength: 15
  },

  password: {
    type: String,
    required: true
  },

  date_joined: {
    type: Date,
    default: Date.now
  }
});

export default UsersSchema;
