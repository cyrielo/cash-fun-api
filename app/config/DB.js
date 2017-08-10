import mongoose from 'mongoose';

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
      mongoose.connect(connectionUri);
      const connection = mongoose.connection;

      connection.on('error', () => {
        reject('Unable to connect to the database');
      });
      connection.once('open', () => {
        fufill(true);
      });
    });
  }
}

export default DB;
