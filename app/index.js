import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import DB from './config/DB';
import config from './config';
import BaseRouter from './routes';

dotenv.config();

DB.connect(config.mongodb_uri)
.then(() => {
  const app = express();
  const router = express.Router();
  const baseRouter = new BaseRouter(router);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(`/api/${config.version.name}/`, baseRouter.routes());
  app.listen(config.port, () => {
    console.log('Application started on port', config.port);
  });

})
.catch((error) => {
  console.log('Unable to connect to the database!', error);
});
