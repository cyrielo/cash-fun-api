import jwt from 'jsonwebtoken';
import config from '../config';
class Authentication {
  static authenticate(req, res, next) {
    if(req.headers.authorization) {
      const authorization = req.headers.authorization.split(' ');
      const strategy = authorization[0];

      if(strategy.toLowerCase() === 'bearer') {
        try {
          const token = authorization[1];
          res.locals.user = jwt.verify(token, config.auth_secret);
          next();
        }
        catch(error) {
          res.status(401).json({
            status: 401,
            message: 'Authorization failed, invalid token!',
            data: ''
          });
        }
      } else {
        res.status(401).json({
          status: 401,
          message: 'Authorization failed, not using the bearer strategy!',
          data: ''
        });
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Authorization failed, no token in request!',
        data: ''
      });
    }
  }
}

export default Authentication;
