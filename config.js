module.exports = function () {
  var dbHost = "localhost" // localhost
  var dbPort = "28015" // default local rethinkdb post

  // in case if not (db) not specified. db will be the default 'test' one
   var rethinkdb = {
    host: dbHost,
    port: dbPort,
    db: "firstapp"
  }

  return {
    rethinkdb: rethinkdb
  }
}
