// middlewares related to rethinkdb
var r = require("rethinkdb");
var config = require("../config")();

module.exports = {
  createConnection: function (req, res, next) {
    r.connect(config.rethinkdb, function (error, conn) {
      if (error) {
        next(error);
      }
      else {
          req._rdbConn = conn;
          next();
      }
    })
  },

  closeConnection: function (req, res, next) {
    req._rdbConn.close();
    next();
  }
}
