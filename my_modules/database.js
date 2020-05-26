const mysql = require('mysql');

var host = process.env.DB_HOST;
var port = process.env.DB_PORT;
var user = process.env.DB_USR;
var password = process.env.DB_PWD;
var dbase = process.env.DBASE;

module.exports.create_pool = function (num) {
  var pool  = mysql.createPool({
    connectionLimit : num,
    host            : host,
    port            : port,
    user            : user,
    password        : password,
    database        : dbase
  });

  return pool;
}
