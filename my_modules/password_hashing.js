const crypto = require('crypto');

var gen_pword = (password) => {
  var salt = crypto.randomBytes(32).toString('hex');
  var hashed = crypto.pbkdf2Sync(password, salt, 5000, 64, 'sha512').toString('hex');

  return {
    hashed: hashed,
    salt: salt
  }
}

var is_password_valid = (password, hashed, salt) => {
  var new_hash = crypto.pbkdf2Sync(password, salt, 5000, 64, 'sha512').toString('hex');
  return (hashed === new_hash);
}

module.exports = {
  gen_pword: gen_pword,
  is_password_valid: is_password_valid
}
