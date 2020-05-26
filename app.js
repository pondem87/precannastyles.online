require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);
const cmanager = require('./my_modules/content_manager');
const db_updates = require('./my_modules/db_updates');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

//************initialize routing express app*************************************
const app = express();

//************setup multer for file uploads**************************************
var multerStore = multer.diskStorage({
  destination: (req, file, callback) => {
    var img_dir = cmanager.static_root_url.product_img + "products/img/" + req.body.code;
    if (!fs.existsSync(img_dir)) {
      fs.mkdirSync(img_dir);
    }
    console.log("Multer custom diskStorage return directory: ", img_dir);
    callback(null, img_dir + "/");
  },
  filename: (req, file, callback) => {
    var img_root = cmanager.static_root_url.product_img + "products/img/" + req.body.code + "/";
    var filename = '';
    var suffix = 0;
    do {
      suffix++
      filename = req.body.code + '_' + suffix + path.extname(file.originalname);
    } while (fs.existsSync(img_root + filename));
    console.log("Multer custom diskStorage return filename: ", filename);
    callback(null, filename);
  }
});

var upload = multer({ storage: multerStore });

//***********set up some middleware and static paths****************************
app.set('view engine', 'ejs');
app.use('/', express.static('assets'));
app.use('/products', express.static('products'));
app.use(express.urlencoded({ extended : true}));

//**********setup session storage***********************************************
const sessionStore = new MysqlStore({}, cmanager.get_pool());
//setup the session middleware with above storage
app.use(session({
    key: 'precanna_style',
    secret: 'Hjnj%OPk_jhsgbdhj87HHGgvcH',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge : 86400000 }
}));

//*********import passport configuration and initialize*************************
require('./my_modules/passport_config');
app.use(passport.initialize());
app.use(passport.session());

//*********CLIENTS ROUTES*******************************************************
require('./my_modules/client_routes').init(app, passport);

//**********admin routes********************************************************
require('./my_modules/admin_routes').init(app, upload);

//**********final catch error***************************************************
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.send(err.message)
}

app.use(errorHandler);

//***********Start The Servive**************************************************
const server_port = process.env.PORT;
console.log("Server listening on port: ", server_port);
app.listen(server_port);
