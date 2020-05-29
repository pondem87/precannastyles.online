const cmanager = require('./content_manager');
const isAuth = require('./isAuth').isAuth;
const ps = require('./pass_reset');
const db_updates = require('./db_updates');

module.exports.init = (app, passport) => {
  //custom middleware for managing content
  app.use(cmanager.get_category);

  //*****Get Routes***************************************************************
  app.get('/', function(req, res) {
    res.redirect('/home');
  });

  app.get('/home', cmanager.get_home, function(req, res) {
    res.render('index', {
      req: req,
      home: req.home,
      currency: cmanager.currency,
      static_root_url: cmanager.static_root_url,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/product', cmanager.get_product, function(req, res) {
    if (req.product.found === true) {
      res.render('product', {
        req: req,
        category: req.category,
        product: req.product,
        static_root_url: cmanager.static_root_url,
        currency: cmanager.currency,
        shipping: cmanager.get_shipping()
      });
    } else {
      res.send("Product code " + req.query.product + " not found")
    }
  });

  app.get('/category', cmanager.get_category_page, function(req, res) {
    res.render('category', {
      req: req,
      category: req.category,
      category_page : req.category_page,
      static_root_url: cmanager.static_root_url,
      currency: cmanager.currency,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/subcategory', cmanager.get_subcategory_page, function(req, res) {
    res.render('subcategory', {
      req: req,
      category: req.category,
      subcategory_page : req.subcategory_page,
      static_root_url: cmanager.static_root_url,
      currency: cmanager.currency,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/contact', function(req, res) {
    res.render('contact', {
      req: req,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', {
      req: req,
      msg: req.query.msg,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/register', function(req, res) {
    res.render('register', {
      req: req,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/cart', isAuth, cmanager.get_cart, function(req, res) {
    res.render('cart', {
      req: req,
      cartlist: cartlist,
      static_root_url: cmanager.static_root_url,
      currency: cmanager.currency,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    var msg = {};
    msg.msg = 'You have been logged out successfully.';
    msg.links = [];
    res.render('message', {msg: msg});
  });

  app.get('/addtocart', isAuth, function(req, res) {
    cmanager.add_to_cart(req, res);
  });

  app.get('/updatecart', isAuth, function(req, res) {
    cmanager.update_cart(req, res);
  });

  app.get('/checkout', isAuth, cmanager.get_cart, function(req, res) {
    res.render('checkout', {
      req: req,
      category: req.category,
      cartlist: req.cartlist
    });
  });

  app.get('/forgot', function(req, res) {
    res.render('forgot', {
      req: req,
      category: req.category,
      shipping: cmanager.get_shipping()
    });
  });

  app.get('/reset', function (req, res) {
    ps.check_token(req, res);
  });

  //*****Post Routes**************************************************************
  app.post('/review', function(req, res) {
    db_updates.addreview(req, res);
  });

  app.post('/comment', function(req, res) {
    db_updates.addcomment(req, res);
  });

  app.post('/auth', passport.authenticate('local', { failureRedirect: '/login?msg=2'}), (req, res) => {
    var msg = {};
    msg.msg = 'Welcome back ' + req.user.forenames + '. You can start your shopping! ';
    msg.links = [{ href: "/category?id=1", text: "Shop" }];
    res.render('message', {msg: msg});
  });

  app.post('/reg', require('./register').register);

  app.post('/sendmail', function(req, res) {
  });

  app.post('/reqreset', function(req, res) {
    ps.generate_token(req, res);
  });

  app.post('/reset', function(req, res) {
    ps.set_password(req, res);
  })
}
