const mysql = require('mysql');


module.exports.create_pool = function (num) {
  var pool  = mysql.createPool({
    connectionLimit : num,
    host            : 'localhost',
    port            : '3306',
    user            : 'precanna.admin',
    password        : 'precanna@2020.',
    database        : 'precanna_db'
  });

  return pool;
}
