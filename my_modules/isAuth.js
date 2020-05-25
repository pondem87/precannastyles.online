module.exports.isAuth = (req, res, next) => {
  console.log("isAuth: checking authentication");
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login?msg=0');
  }
};

module.exports.isAuthAdmin = (req, res, next) => {
  console.log("isAuth: checking authentication and admin rights");
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else if (!req.isAuthenticated()) {
    res.redirect('/login?msg=0');
  } else {
    var msg = {};
    msg.msg = 'Your login credentials do not have administrator priviledges.';
    msg.links = [{ href: "logout", text: "Logout" }];
    res.render('message', {msg: msg});
  }
};
