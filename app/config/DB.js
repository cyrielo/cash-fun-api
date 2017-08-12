const mongoose = require('mongoose');
/**
  @class DB
  @desc provides connection configuration to database
*/
class DB {

  /**
    @method connect
    @param {String} connectionUri
    @desc perform the actual connection
    @return {Promise} return a new promise
  */
  static connect(connectionUri) {
    return new Promise((fufill, reject) => {
      mongoose.connect(connectionUri, { useMongoClient: true });
      const connection = mongoose.connection;

      connection.on('error', (error) => {
        reject(error);
      });
      connection.once('open', () => {
        fufill(true);
      });
    });
  }
}

export default DB;
