import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import DB from './config/DB';

dotenv.config();


DB.connect('mongodb://localhost:27017/cashfun')
.then(() => {
  const app = express();
  const router = express.Router();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.listen(process.env.PORT, () => {
    console.log('Application started on port', process.env.PORT);
  });

})
.catch((error) => {
  console.log('Unable to connect to the database!', error);
});