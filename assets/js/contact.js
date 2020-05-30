$(document).ready(function(){
    //set stars
    $("#x1").hover(function() {
      $("#rated").html("1 Star");
      $("#rating").val(1);
    });

    $("#x2").hover(function() {
      $("#rated").html("2 Star");
      $("#rating").val(2);
    });

    $("#x3").hover(function() {
      $("#rated").html("3 Star");
      $("#rating").val(3);
    });

    $("#x4").hover(function() {
      $("#rated").html("4 Star");
      $("#rating").val(4);
    });

    $("#x5").hover(function() {
      $("#rated").html("5 Star");
      $("#rating").val(5);
    });

    //addtocart on product package
    $("#addtocart_1").click(function() {
      var code = $("#product_code").val();
      var quantity = $("#product_quantity").val();
      var option = $("#option").val();
      var query = {
        code: code,
        quantity: quantity,
        option: option
      }

      $.get('/addtocart', query, function (data, textStatus, jqXHR) {
          $("#addtocart_1").html(data);
          setTimeout(() => { $("#addtocart_1").html("add to cart"); }, 3500);
      });
    });

    //update cart
    $("#update_btn").click(function() {
      var updated = [];
      var sum = 0;
      $(".product").each(function() {
        var price = parseFloat($(this).find(".product_price").text());
        var quantity = parseInt($(this).find(".input-number").val());
        var code = $(this).find(".input-number").attr('id');
        var option = parseInt($(this).find(".option").val());
        $(this).find(".product_total").text((price * quantity).toFixed(2));
        sum += price * quantity;
        updated.push({ code: code, quantity: quantity, option: option });
      });

      $("#cart_subtotal").text((sum).toFixed(2));

      $.get('/updatecart', { updated: updated }, function (data, textStatus, jqXHR) {
        $("#update_btn").html(data);
        setTimeout(() => { $("#update_btn").html("update cart"); }, 3500);
      });
    });

    //modifystock page functions
    //add option
    $("#add-option").click(() => {
      var product_id = $("#product-id").val();
      var colour = $("#option-colour").val();
      var size = $("#option-size").val();
      var quantity = parseInt($("#option-quantity").val());

      if (colour.length < 1) {
        $("#add-option-msg").html("Warning. Colour is not defined!");
        return;
      }
      if (size.length < 1) {
        $("#add-option-msg").html("Warning. Size is not defined!");
        return;
      }
      if (quantity < 1 || Number.isNaN(quantity)) {
        $("#add-option-msg").html("Warning. Quantity not valid!");
        return;
      }
      $("#add-option-msg").html("operation in progress...");
      var option = {
        product_id: product_id,
        color: colour.toUpperCase(),
        size: size.toUpperCase(),
        quantity: quantity
      }
      $.get('/addoption', { option: option }, function (data, textStatus, jqXHR) {
        $("#add-option-msg").html(data);
        if (data == "New option created!") addoptionrow(option);
      });
    });

    var addoptionrow = (option) => {
      var markup = `<tr class="product-option" id="` + option.product_id
      + `"><td>Colour: ` + option.color + `, Size: ` + option.size
      + `</td><td><input class="product-option-quantity" value="`
      + option.quantity + `" ></td><td><button>update</button></td></tr>`;

      $(".product-option-table > tbody:last-child").append(markup);
    }

    //delete photos
    $(".delete-photo").click(function() {
      var button = $(this);
      var parent = $(this).parent();
      var img_path = parent.find(".img-path").val();
      var img_file = parent.find(".img-file").val();
      var product_code = parent.find(".product-code").val();

      var query = {
        img_path: img_path,
        img_file: img_file,
        product_code: product_code
      }

      $.get('/unlinkphoto', query, function (data, textStatus, jqXHR) {
        if (data == "deleted") {
          parent.find("span").html("Image has been removed!");
          button.remove();
        } else {
          button.next("span").val("An error occurred!")
        }
      });
    });

    //reset password
    $("#forgot-submit").click(() => {
      $("#forgot-submit").css('display', 'none');
      $(".loading").css('display', 'block');
      var email = $("#rstemail").val();
      $.post('/reqreset', { email: email }, function (data) {
        $("#forgot-response").html(data.text);
        $(".loading").css('display', 'none');
        $("#forgot-submit").css('display','block');
      });
    });

    //edithome
    $("#save_home").click(() => {
      var home = {};

      $("#save_home").css('display','none');

      home.banner = {};

      //get Headline
      home.banner.h1_text = $.trim($(".headline").find(".new_headline").val()) != "" ? $.trim($(".headline").find(".new_headline").val()) : $(".headline").find(".old_headline").html();
      //get tagline
      home.banner.h5_text = $.trim($(".tagline").find(".new_tagline").val()) != "" ? $.trim($(".tagline").find(".new_tagline").val()) : $(".tagline").find(".old_tagline").html();

      //get features
      home.features = [];
      $(".feature").each(function () {
        var product = $.trim($(this).find(".new_product_code").val()) != "" ? $(this).find(".new_product_code").val().toUpperCase() : $(this).find(".product_code").html();
        var feature_label = $.trim($(this).find(".new_feature_label").val()) != "" ? $(this).find(".new_feature_label").val() : $(this).find(".feature_label").html();
        home.features.push({ product: product, feature_label: feature_label});
      });

      //get new arrivals
      home.new_arrivals = [];
      $(".new_arrivals").each(function() {
        var product = $.trim($(this).find(".new_product_code").val()) != "" ? $(this).find(".new_product_code").val().toUpperCase() : $(this).find(".product_code").html();
        home.new_arrivals.push(product);
      });

      $.get('/savehome', { home: home }, function (data, textStatus, jqXHR) {
        if (data == "saved") {
          $("#save_home").css('display','block');
          $("#save_home").html("home saved");
          setTimeout(() => { $("#save_home").html("save changes"); }, 3500);
        } else {
          $("#save_home").css('display','block');
          $("#save_home").html("an error occurred");
          setTimeout(() => { $("#save_home").html("save changes"); }, 3500);
        }
      });
    });

    (function($) {
        "use strict";

    jQuery.validator.addMethod('answercheck', function (value, element) {
        return this.optional(element) || /^\bcat\b$/.test(value)
    }, "type the correct answer -_-");

    // validate comment form
    $(function() {
        $('#comment_form').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                subject: {
                    required: true,
                    minlength: 4
                },
                number: {
                    required: true,
                    minlength: 5
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    required: true,
                    minlength: 20
                }
            },
            messages: {
                name: {
                    required: "come on, you have a name, don't you?",
                    minlength: "your name must consist of at least 2 characters"
                },
                subject: {
                    required: "come on, you have a subject, don't you?",
                    minlength: "your subject must consist of at least 4 characters"
                },
                number: {
                    required: "come on, you have a number, don't you?",
                    minlength: "your Number must consist of at least 5 characters"
                },
                email: {
                    required: "no email, no message"
                },
                message: {
                    required: "um...yea, you have to write something to send this form.",
                    minlength: "thats all? really?"
                }
            }
        });

        $('#review_form').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                number: {
                    required: true,
                    minlength: 5
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    required: true,
                    minlength: 20
                }
            },
            messages: {
                name: {
                    required: "come on, you have a name, don't you?",
                    minlength: "your name must consist of at least 2 characters"
                },
                number: {
                    required: "come on, you have a number, don't you?",
                    minlength: "your Number must consist of at least 5 characters"
                },
                email: {
                    required: "no email, no message"
                },
                message: {
                    required: "um...yea, you have to write something to send this form.",
                    minlength: "thats all? really?"
                }
            }
        })

        $('#register_form').validate({
            rules: {
                firstname: {
                    required: true,
                    minlength: 2
                },
                lastname: {
                    required: true,
                    minlength: 2
                },
                phone: {
                    required: true,
                    minlength: 5
                },
                email: {
                    required: true,
                    email: true
                },
                address: {
                    required: true,
                    minlength: 10
                },
                password: {
                    required: true,
                    minlength: 6
                },
                password2: {
                    required: true,
                    minlength: 6,
                    equalTo: "#password"
                }
            },
            messages: {
                firstname: {
                    required: "come on, you have a name, don't you?",
                    minlength: "your name must consist of at least 2 characters"
                },
                lastname: {
                    required: "come on, you have a name, don't you?",
                    minlength: "your name must consist of at least 2 characters"
                },
                phone: {
                    required: "come on, you have a number, don't you?",
                    minlength: "your Number must consist of at least 5 characters"
                },
                email: {
                    required: "login after registration will require email"
                },
                address: {
                    required: "helps when placing orders. can be changed later",
                    minlength: "too short"
                },
                password: {
                    required: "password required",
                    minlength: "password should be at least 6 charactres"
                },
                password2: {
                    required: "password required",
                    minlength: "password should be at least 6 charactres",
                    equalTo: "passwords do not match"
                }
            }
        })

        $('#password_reset_form').validate({
            rules: {
                password: {
                    required: true,
                    minlength: 8
                },
                password2: {
                    required: true,
                    minlength: 8,
                    equalTo: "#password"
                }
            },
            messages: {
                password: {
                    required: "password required",
                    minlength: "password must be at least 8 characters"
                },
                password2: {
                    required: "password reset",
                    minlength: "password must be at least 8 characters",
                    equalTo: "passwords must match"
                }
            }
        })
    })

 })(jQuery)
})
