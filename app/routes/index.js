import UsersRoute from './UsersRoute';
/**
 @class BaseRoute
 @desc Initialize all routes in the application
 */
class BaseRoute {
  /**
   @method constructor
   @param {Object} router  express router obj
   */
  constructor(router) {
    this.router = router;
    this.UsersRoute = new UsersRoute();
  }

  /**
   @method routes
   @desc loads all relevant routes for the app
   @return {Object} express router object
   */
  routes() {
    this.router.use('/users', this.UsersRoute.loadRoutes());
    this.router.use('/', (req, res) => {
      res.status(200).send('Api root!');
    });

    return this.router;
  }
}

export default BaseRoute;
