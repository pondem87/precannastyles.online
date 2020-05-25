var con_pool = require('./content_manager').get_pool();
var pw_hashing = require('./password_hashing');

module.exports.register = (req, res, next) => {
  con_pool.getConnection((error, connection) => {
    if (error) throw error;

    //get hash and salt of password_hash
    var pw = pw_hashing.gen_pword(req.body.password2);

    var sql = 'INSERT INTO `user` (`forenames`, `surname`, `email`, `hashed`, `salt`, `address`, `phone`,`active`,`admin`) VALUES (?)';
    var values = [req.body.firstname, req.body.lastname, req.body.email, pw.hashed, pw.salt, req.body.address, req.body.phone, '1', '0'];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        if (error.code == 'ER_DUP_ENTRY') {
          console.log("if statement true...");
          var msg = {};
          msg.msg = 'Email: ' + req.body.email + ' is already in use. Try a different email or login to existing accout.';
          msg.links = [{ href: "register", text: "Register" },{ href: "login?msg=0", text: "Login" },{ href: "pwreset", text: "Forgot Password?" }];
          res.render('message', {msg: msg});
          connection.release();
        }
        else {
          connection.release();
          throw error;
        }
      }

      connection.release();

      if (results.affectedRows == 1) {
        res.redirect('login?msg=1');
      } else {
        res.redirect('register');
      }

    });
  });
};
