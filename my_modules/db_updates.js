var cm = require('./content_manager');

console.log("db_updates: request dbpool from content_manager");
var pool = cm.get_pool();

var addreview = function(req, res) {
  console.log(req.body);

  pool.getConnection((error, connection) => {
    var sql = 'call addreview(?)';
    values = [req.body.product, req.body.rating, req.body.name, req.body.email, req.body.number, req.body.message];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      connection.release();
      res.redirect("/product?code=" + req.body.product);
    });
  });
}

var addcomment = function(req, res) {
  console.log(req.body);

  pool.getConnection((error, connection) => {
    var sql = 'call addcomment(?)';
    values = [req.body.product, req.body.name, req.body.email, req.body.number, req.body.message];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      connection.release();
      res.redirect("/product?code=" + req.body.product);
    });
  });
}

module.exports = {
  addreview : addreview,
  addcomment : addcomment
}
