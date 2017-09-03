import UsersRoute from './UsersRoute';
import PostsRoute from './PostsRoute';
import SearchRoute from './SearchRoute';

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
    this.PostsRoute = new PostsRoute();
    this.SearchRoute = new SearchRoute();
  }

  /**
   @method routes
   @desc loads all relevant routes for the app
   @return {Object} express router object
   */
  routes() {
    this.router.use('/users', this.UsersRoute.loadRoutes());
    this.router.use('/posts', this.PostsRoute.loadRoutes());
    this.router.use('/search', this.SearchRoute.loadRoutes());
    this.router.use('/', (req, res) => {
      res.status(200).send('Api root!');
    });

    return this.router;
  }
}

export default BaseRoute;
