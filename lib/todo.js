// todo route middlewares for the app
// require an acctive connection with rethinkdb
// as a property of req object
var r = require("rethinkdb");

function rdbConn(req) {
  var rdbConn = req._rdbConn;
  if (rdbConn) {
    return rdbConn;
  }
  else {
    return undefined;
  }
}

module.exports =  {
  get: function (req, res, next) {
    if (!rdbConn(req)) {
      next(new Error("active rethinkdb connection not found. Sorry :("))
    }
    else {
      r.table("todos").orderBy({index: "createdAt"})
        .run(rdbConn(req), function (error, cursor) {
          if (error) {
            next(error);
          }
          else {
            cursor.toArray(function (error, results) {
              if (error) {
                next(error);
              }
              res.json(results);
            })
          }
        })
    }
  },

  create: function (req, res, next) {
    // need a todo property in the req.body in order to proceed with the creation
    if (!req.body.todo) {
      return next();
    }

    r.table("todos").insert({
      todo: req.body.todo,
      createdAt: r.now()
    }).run(rdbConn(req), function (error, result) {
      if (error) {
        return next(error);
      }
      else {
        res.json(result);
      }
    });
  },

  update: function (req, res, next) {
    var body = req.body;
    if (body && body.id && body.todo) {
      // console.log(body);
      r.table("todos")
      .get(body.id)
      .update({todo: body.todo}, {returnChanges: true})
      .run(rdbConn(req), function (error, result) {
        if (error) {
          return next(error);
        }
        res.json(result);
      })
    }
    else {
      return next(new Error("id or todo is missing in the body"));
    }
  },

  delete: function (req, res, next) {
    var body = req.body;
    if (body && body.id) {
      r.table("todos")
        .get(body.id)
        .delete()
        .run(rdbConn(req), function (error, result) {
          if (error) {
            handleError(error);
          }
          else {
            res.json(result);
          }
        })
    }
  }
}
