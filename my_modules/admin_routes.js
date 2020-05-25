const cmanager = require('./content_manager');
const isAuthAdmin = require('./isAuth').isAuthAdmin;

module.exports.init = (app, upload) => {
  //************GET routes********************************************************
  app.get('/admin', isAuthAdmin, (req, res) => {
    res.render('admin');
  });

  app.get('/newproduct', isAuthAdmin, (req, res) => {
    res.render('newproduct', { category: req.category });
  });

  app.get('/stock', isAuthAdmin, (req, res) => {
    res.render('stock');
  });

  app.get('/selectproduct', isAuthAdmin, (req, res) => {
    cmanager.get_products_list(req, res);
  });

  app.get('/modifystock', isAuthAdmin, cmanager.get_product, (req, res) => {
    res.render('modifystock', {
      product : req.product
    });
  });

  app.get('/modifyproduct', isAuthAdmin, cmanager.get_product, (req, res) => {
    res.render('modifyproduct', {
      product : req.product,
      category: req.category
    });
  });

  app.get('/addoption', isAuthAdmin, (req, res) => {
    cmanager.add_option(req, res);
  });

  app.get('/uploadphotos', isAuthAdmin, cmanager.get_product, (req, res) => {
    res.render('uploadimages', {
      product : req.product,
      pcode : req.product.code
    });
  });

  app.get('/delphotos', isAuthAdmin, cmanager.get_product, (req, res) => {
    res.render('delphotos', {
      static_root_url : cmanager.static_root_url,
      product : req.product
    });
  });

  app.get('/unlinkphoto', isAuthAdmin, (req, res) => {
    cmanager.unlink_photo(req, res);
  });

  //************POST routes*******************************************************
  app.post('/addproduct', isAuthAdmin, cmanager.product_entry, (req, res) => {
    res.render('uploadimages', {
      product : req.body,
      pcode : req.product_code
    });
  });

  app.post('/uploadimages', isAuthAdmin, upload.array("images"), (req, res) => {
    cmanager.to_dbase(req, res);
  });

  app.post('/updateproduct', isAuthAdmin, (req, res) => {
    cmanager.update_product(req, res);
  });
}
