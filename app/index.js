import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import DB from './config/DB';
import config from './config/config.json';
import BaseRouter from './routes';
dotenv.config();


DB.connect('mongodb://localhost:27017/cashfun')
.then(() => {
  const app = express();
  const router = express.Router();
  const baseRouter = new BaseRouter(router);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(`/api/${config.version.name}/`, baseRouter.routes());
  app.listen(process.env.PORT, () => {
    console.log('Application started on port', process.env.PORT);
  });

})
.catch((error) => {
  console.log('Unable to connect to the database!', error);
});