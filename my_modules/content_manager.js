const dbase = require('./database');
const fs = require('fs');
const str = require('@supercharge/strings');

var pool_size = process.env.DB_POOL_SIZE;

console.log(`content_manager: creating dbase pool, ${pool_size} connections`);
const pool = dbase.create_pool(pool_size);

const get_pool = function() {
  console.log("content_manager: returning dbase pool to caller");
  return pool;
}
//GET CONTENT VARIABLES
//get categories as express middleware and add category variable to req
//**** category variable structure *********************************************
// var category = [
//   {
//     id : 1,
//     name : `Women's Shoes`,
//     subcategory : [
//       { id : 1, name : `Heels`},
//       { id : 2, name : `Sneakers`}
//     ]
//   },
//   {
//     id : 2,
//     name : `Men's Shoes`,
//     subcategory : [
//       { id : 2, name : `Formal`}
//     ]
//   }];
//******************************************************************************

const get_category = function (req, res, next) {
  console.log("content_manager: get_category middleware called.");
  req.category = [];
  pool.getConnection((error, connection) => {
    if (error) throw error;

    console.log("content_manager: get_category: querying dbase: for categories");
    var sql = 'select `id`, `name` from `category`';
    connection.query(sql, (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      results.forEach((row) => {
        req.category.push({ id : row.id, name : row.name, subcategory : []});
      });

      console.log("content_manager: get_category: querying dbase: for subcategories");
      sql = 'select `id`, `name`, `category_id` from `subcategory`'
      connection.query(sql, (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        req.category.forEach((category) => {
          results.forEach((row) => {
            if (row.category_id === category.id) {
              category.subcategory.push(row);
            }
          });
        });
        connection.release();
        console.log("content_manager: get_category middleware done.");
        next();
      });
    });
  });
}
//******************************************************************************

//Get home variables using middleware format
//******home variable structure*************************************************
// var home = {
//   //home page banner_part
//   banner : {
//     h1_text : 'shoe-la-la!',
//     h5_text : 'Great Shoes Take You Great Places'
//   },
//   //home page feature_part variables
//   features : [
//     { feature_label : 'dresses',
//     product : 'CC6YR1'},
//     { feature_label : 'bag combos',
//     product : 'PEU55U'},
//     { feature_label : `men's casual`,
//     product : 'ONX655'}
//   ],
//   //home page new arrivals
//   new_arrivals : ['AABE33','CC6YR1','CCCET2','EET345','EU245E','GGH33E']
// }
//******************************************************************************

const get_home = function (req, res, next) {
  console.log("content_manager: get_home: middleware called");
  console.log("content_manager: get_home: getting and parsing home.json file");
  var home = JSON.parse(fs.readFileSync(__dirname + "/home.json"));
  req.home = home;

  console.log("content_manager: get_home: querying dbase");
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var sql = 'select * from `product` where `code` in (?)';
    var values = [];
    req.home.features.forEach((feature) => {
      values.push(feature.product);
    });

    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      req.home.features.forEach(function(feature) {
        results.forEach((row, index) => {
          if (row.code == feature.product) feature.product = row;
        });
      });

      connection.query(sql, [req.home.new_arrivals], (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        results.forEach((row, index) => {
          req.home.new_arrivals[index] = row;
        });

        connection.release();
        console.log("content_manager: get_home: middleware done.");
        next();
      });
    });
  });
}

const get_home_raw = function (req, res, next) {
  console.log("content_manager: get_home_raw: middleware called");
  console.log("content_manager: get_home_raw: getting and parsing home.json file");
  var home = JSON.parse(fs.readFileSync(__dirname + "/home.json"));
  req.home = home;
  next()
}

const set_home_raw = function (req, res) {
  var data = JSON.stringify(req.query.home);
  fs.writeFile(__dirname + "/home.json", data, function(error) {
    if (error) {
      res.send("error");
    } else {
      res.send("saved");
    }
  });
}
//******************************************************************************

//Get shipping information, as static variable
//**********variable form*******************************************************
// var shipping = {
//   shipping : 'Shipping available and charges depend on location and size of package. Contact support for more information.',
//   terms : 'Good terms and conditions to protect buyer from unforseen events.',
//   payments : 'Online payment methods will be available soon',
//   service : 'Online service always available. Email or whatsapp anytime, anyday.',
//   phone : '+26775081805',
//   email : 'perfectsole3@gmail.com',
//   address : 'Mokue Ward, Kanye, Botswana'
// }
//******************************************************************************

const get_shipping = function () {
  console.log("content_manager: get_shipping, sync function called.");
  var shipping = JSON.parse(fs.readFileSync(__dirname  + "/shipping.json"));
  console.log("content_manager: get_shipping, sync function returning json object.");
  return shipping;
}
//******************************************************************************

//Get single product, middleware
//**********variable form*******************************************************
// var product = {
//   code : 'sgh533',
//   img : ['sgh533-1.jpg','sgh533-2.jpg','sgh533-3.jpg'],
//   img_dir: 'womenshoes/sgh533/',
//   name : 'some kinda shoe',
//   category_id : `women's shoes`,
//   subcategory_id : '',
//   summary : 'you gotta love these wonderful shoes.. damn they so nice',
//   description : 'OMG nice style... oooh oh laka laka dismally mwaaaaa',
//   price: 199.99,
//   available : 10,
//   discount : 0.15,
//   rating : 3.0,
//   comments : [
//     { name: 'tomlaka laka', datetime: '5 May 2020, 1453', comment: 'chinhu chenyu hachiiti ba ichi' },
//     { name: 'tedwako laka', datetime: '5 May 2020, 1457', comment: 'chinhu chenyu ibho henyu imi'}
//   ],
//   reviews : [
//     { name: 'tomlaka laka', rating: 1, review: 'chinhu chenyu hachiiti ba ichi' },
//     { name: 'tedwako laka', rating: 5, review: 'chinhu chenyu ibho henyu imi'}
//   ],
//   review_stats : {
//     fivestar : 1,
//     fourstar : 0,
//     threestar : 0,
//     twostar : 0,
//     onestar : 1,
//     all : 2
//   },
//   found : false
// }
//********************************************************************************

const get_product = function (req, res, next) {
  console.log("content_manager: get_product middleware called.");
  //check if essential variables present in req
  if (req.query.code == undefined) {
    throw new Error("content_manager: get_product: Cannot perform request without product code");
  }

  var code = req.query.code;
  console.log("content_manager: get_product: with code: ", req.query.code);
  pool.getConnection((error, connection) => {
    if (error) throw error;

    connection.query('select * from `product` where `code` = ?', [code], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      req.product = results[0];
      if (req.product.code.localeCompare(code) === 0) req.product.found = true;

      connection.query('select * from `comments` where `product_id` = ?', [req.product.id], (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        req.product.comments = results;

        connection.query('select * from `reviews` where `product_id` = ?', [req.product.id], (error, results, fields) => {
          if (error) {
            connection.release();
            throw error;
          }

          req.product.reviews = results;

          connection.query('call reviewstats(?)', [req.product.id], (error, results, fields) => {
            if (error) {
              connection.release();
              throw error;
            }

            req.product.review_stats = results[0][0];
            var sql = '';

            if (req.query.all) {
              sql = 'select * from `stock` where `product_id` = ?';
            } else {
              sql = 'select * from `stock` where `product_id` = ? and `quantity` > 0';
            }

            connection.query(sql, [req.product.id], (error, results, fields) => {
              if (error) {
                connection.release();
                throw error;
              }

              req.product.options = results;

              connection.release();
              console.log("content_manager: get_product middleware done.");
              next();
            });
          });
        });
      });
    });
  });
}
//********************************************************************************

//Get category data, middleware
//******************variable format*********************************************
// var subcategory_page = {
//   id : 1,
//   name : `Women's Shoes`,
//   products : [
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'My Favourite Tee', price : 180, discount : 0 },
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'The Boss Wear', price : 180, discount : 0.1 },
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'Outa Mi Pocket 2', price : 180, discount : 0.2 }
//   ]
// }
//*******************************************************************************

const get_category_page = function (req, res, next) {
  console.log("content_manager: get_category_page middleware called.");
  var category_id = req.query.id;
  req.category_page = {};
  req.category_page.id = category_id;
  req.category.forEach((category) => {
    if (category.id == category_id) {
      req.category_page.name = category.name;
    }
  });

  pool.getConnection((error, connection) => {
      if (error) throw error;

      var sql = 'select * from `product` where `category_id` = ? and `available` > 0';
      connection.query(sql, [category_id], (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        req.category_page.products = results;

        connection.release();

        console.log("content_manager: get_category_page middleware done.");
        next();
      });
  });
}
//******************************************************************************

//Get subcategory data, middleware
//******************variable format*********************************************
// var subcategory_page = {
//   id : 1,
//   name : `Women's Shoes`,
//   products : [
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'My Favourite Tee', price : 180, discount : 0 },
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'The Boss Wear', price : 180, discount : 0.1 },
//     { code : 'sghex5', img : 'womenshoes/sgh533/sgh533-1.jpg', name : 'Outa Mi Pocket 2', price : 180, discount : 0.2 }
//   ]
// }
//*******************************************************************************

const get_subcategory_page = function (req, res, next) {
  console.log("content_manager: get_subcategory_page middleware called.");
  var subcategory_id = req.query.id;
  req.subcategory_page = {};
  req.subcategory_page.id = subcategory_id;
  req.category.forEach((category) => {
    category.subcategory.forEach((subcategory, i) => {
      if (subcategory.id == subcategory_id) {
        req.subcategory_page.name = subcategory.name;
      }
    });
  });

  pool.getConnection((error, connection) => {
      if (error) throw error;

      var sql = 'select * from `product` where `subcategory_id` = ? and `available` > 0';
      connection.query(sql, [subcategory_id], (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        req.subcategory_page.products = results;

        connection.release();

        console.log("content_manager: get_subcategory_page middleware done.");
        next();
      });
  });
}
//******************************************************************************

//Get shopping cart data
//*************variable form*****************************************************
//var cartlist = {
//  products : [
//    { code : '', img_dir : '', img : '', name : '', price : 1, discount : 0.0, quantity : 1, subtotal : 0 },
//    { code : '', img_dir : '', img : '', name : '', price : 1, discount : 0.0, quantity : 1, subtotal : 0 }
//  ],
//  subtotal : ''
//}
//*******************************************************************************

const get_cart = function (req, res, next) {
  console.log("content_manager: get_cart middleware called.");
  cartlist = {};

  pool.getConnection((error, connection) => {
    if (error) throw error;

    sql = 'call getcart(?)';
    connection.query(sql, [req.user.id], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      cartlist.products = results[0];
      cartlist.subtotal = 0;
      cartlist.products.forEach((product) => {
        product.subtotal = (product.price * (1.0 - product.discount)).toFixed(2) * product.quantity;
        cartlist.subtotal += product.subtotal;
      });

      req.cartlist = cartlist;
      connection.release();
      console.log("content_manager: get_cart middleware done.");
      next();
    });
  });
};
//*******************************************************************************

//Add product to cart
//*******************************************************************************
const add_to_cart = function (req, res) {
  console.log("content_manager: add_to_cart function called.");
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var sql = 'call addtocart(?)';
    var values = [req.user.id, req.query.code, req.query.quantity, req.query.option];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        console.log("content_manager: add_to_cart encountered an error.");
        connection.release();
        throw error;
      }

      console.log("content_manager: add_to_cart returning with no error.");
      res.send("added to cart");
      connection.release();
    });
  });
}
//*******************************************************************************

//Add update cart
//*******************************************************************************
var toUpdate = 0;
const update_cart = function (req, res) {
  console.log("content_manager: update_cart function called.");

  var values = [];
  req.query.updated.forEach((item, i) => {
    values.push([req.user.id, item.code, item.quantity, item.option]);
  });

  toUpdate = values.length;
  console.log("content_manager: update_cart: calling recursive function: index 0, toUpadte ", toUpdate);
  update(values, 0, res);
}

const update = (values, index, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var sql = 'call updatecart(?)';

    connection.query(sql, [values[index]], (error, results, fields) => {
      if (error) {
        console.log("content_manager: update_cart encountered an error.");
        connection.release();
        throw error;
      }

      toUpdate--;
      index++;

      if (toUpdate > 0) {
        connection.release();
        console.log("content_manager: update_cart: recalling recursive function: toUpadte ", toUpdate);
        update(values, index, res);
      } else {
        console.log("content_manager: update_cart returning with no error.");
        connection.release();
        res.send("cart updated");
      }
    });
  });
}

/////////////////////Admin functions////////////////////////////////////////////////////
//***************Add new product********************************************************
//**************************************************************************************
const product_entry = (req, res, next) => {
  console.log("content_manager: product entry middleware called.");
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var code = []
    for (var i=0; i<3; i++) {
      code[i] = str.random(6).toUpperCase();
    }

    console.log("product entry req.body:");
    console.log(req.body);
    var sql = 'call addproduct(?)';
    var values = [code[0],code[1],code[2],req.body.name,req.body.summary,req.body.description,req.body.price,req.body.discount,req.body.subcategory];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }
      console.log("insert result[0][0]:");
      console.log(results[0][0]);
      if (results[0][0])
      {
        req.product_code = results[0][0].pcode;
        connection.release();
        console.log("content_manager: product_entry middleware done.");
        next();
      } else {
        connection.release();
        throw new error("Custom: Product couldn't be created...");
      }
    });
  });
}
//*******************************************************************************

//save image locations to database
const to_dbase = (req, res) => {
  console.log("content_manager: to_dbase function called.");
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var sql = 'select `img` from `product` where `code` = ?';
    connection.query(sql, [req.body.code], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      if (results[0].img == null) {
        var img = [];
      } else {
        var img = JSON.parse(results[0].img);
      }

      req.files.forEach((file) => {
        img.push(file.filename);
      });

      var img_dir = "products/img/" + req.body.code + "/";

      sql = 'update `product` set `img_dir` = ?, `img` = ? where `code` = ?';
      values = [img_dir, JSON.stringify(img), req.body.code];
      connection.query(sql, values, (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        connection.release();

        console.log("content_manager: to_dbase function generating success response.");
        var msg = {};
        msg.msg = 'Uploaded ' + req.files.length + ' images successfully.';
        msg.links = [{ href: "/admin", text: "Go back to Admin home page" }];
        res.render('message', {msg: msg});
      });
    });
  });
};
//*******************************************************************************

//return list of products
const get_products_list = (req, res) => {
  console.log("content_manager: get_products_list function called.");
  pool.getConnection((error, connection) => {
    if (error) {
      connection.release();
      throw error;
    }

    sql = 'select * from `product`';
    connection.query(sql, (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      req.products = results;

      console.log("content_manager: get_products_list function generating response.");
      res.render('selectproduct', {
        next_url: req.query.next_url,
        products: req.products,
        static_root_url : static_root_url
      });
    });
  });
}
//*******************************************************************************

//add option to product
const add_option = (req, res) => {
  console.log("content_manager: add_option function called.");
  var option = req.query.option;
  pool.getConnection((error, connection) => {
    if (error) throw error;

    var sql = 'insert into `stock`(`color`,`size`,`quantity`,`product_id`) values(?)';
    var values = [option.color, option.size, option.quantity, option.product_id];
    connection.query(sql, [values], (error, results, fields) => {
      if (error) {
        if (error.code == 'ER_DUP_ENTRY') {
          console.log("content_manager: add_option function response, option already exists.");
          res.send("Option already exists!");
          connection.release();
        } else {
          connection.release();
          throw error;
        }
      } else {
        connection.release();
        console.log("content_manager: add_option function response, option created.");
        res.send("New option created!");
      }
    });
  });
}
//*********************************************************************************************

//update a product
const update_product = (req, res) => {
  console.log("content_manager: update_product func called.");
  pool.getConnection((error, connection) => {
    if (error) throw error;

    //get category_id in case subcategory was changed
    var category_id = 0;
    req.category.forEach((cat) => {
      cat.subcategory.forEach((subcat) => {
        if (subcat.id == req.body.subcategory) {
          category_id = subcat.category_id;
        }
      });
    });

    sql = 'update `product` set ? where `code` = ?';
    var sets = {
      name: req.body.name,
      summary: req.body.summary,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount,
      category_id: category_id,
      subcategory_id: req.body.subcategory,
      available: req.body.available
    }
    connection.query(sql, [sets, req.body.code], (error, results, fields) => {
      if (error) {
        connection.release();
        throw error;
      }

      connection.release();

      if (results.changedRows == 1) {
        console.log("content_manager: update_product: Response, 1 row affected.");

        var msg = {};
        msg.msg = 'Updated product: ' + req.body.code + ' successfully.';
        msg.links = [{ href: "/admin", text: "Go back to Admin home page" }];
        res.render('message', {msg: msg});
      } else {
        var msg = {};
        msg.msg = 'Unexpected result on updating product: ' + req.body.code + ' . Check product for changes.';
        msg.links = [{ href: "/admin", text: "Go back to Admin home page" }];
        res.render('message', {msg: msg});
      }
    });
  });
};
//*****************************************************************************************

//Remove a photo
const unlink_photo = (req, res) => {
  console.log("content_manager: unlink_photo func called.");
  fs.unlink(__dirname + '/..' + req.query.img_path, (error) => {
    if (error) {
      console.log("content_manager: unlink_photo: ", error.message);
      res.send("error");
      return;
    }

    pool.getConnection((error, connection) => {
      if (error) throw error;

      var sql = 'select `img` from `product` where `code` = ?';
      var values = req.query.product_code;
      connection.query(sql, values, (error, results, fields) => {
        if (error) {
          connection.release();
          throw error;
        }

        var img = JSON.parse(results[0].img);

        var splice_index = 0;

        img.forEach((image, i) => {
          if (image == req.query.img_file) splice_index = i;
        });

        img.splice(splice_index, 1);

        sql = 'update `product` set `img` = ? where `code` = ?';
        values = [JSON.stringify(img), req.query.product_code];
        connection.query(sql, values, (error, results , fields) => {
          if (error) {
            connection.release();
            throw error;
          }
          console.log("content_manager: unlink_photo: success response");
          res.send("deleted");
        });
      });
    });

  });
};


//root urls for resources e.g S3 resources
const static_root_url = {
  product_img : '/'
}

//currency variables
const currency = {
  symbol : 'P',
  multiplier : 1
}

//**********local function: send_error*******************************************
const send_error = (res, message) => {
  var msg = {};
  msg.msg = message;
  msg.links = []; //[{ href: "/admin", text: "Go back to Admin home page" }];
  res.render('message', {msg: msg});
}

//exports
module.exports = {
  get_shipping : get_shipping,
  static_root_url : static_root_url,
  currency : currency,
  get_product : get_product,
  get_category : get_category,
  get_home : get_home,
  get_home_raw: get_home_raw,
  set_home_raw: set_home_raw,
  get_category_page : get_category_page,
  get_subcategory_page : get_subcategory_page,
  get_pool : get_pool,
  get_cart: get_cart,
  add_to_cart : add_to_cart,
  product_entry : product_entry,
  to_dbase : to_dbase,
  get_products_list : get_products_list,
  add_option : add_option,
  update_product : update_product,
  unlink_photo : unlink_photo,
  update_cart : update_cart
}
