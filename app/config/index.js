import dotenv from 'dotenv';

dotenv.config();

module.exports = {
  "appName": "CashFun",
  "version": {
    "name": "v1",
    "code": "1.0.0"
  },
  auth_secret: process.env.AUTH_SECRET,
  port: process.env.PORT,
  mongodb_uri: process.env.MONGODB_URI
};
