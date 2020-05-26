const nodemailer = require('nodemailer');

var service = process.env.ADMIN_MAIL_SERVICE;
var email = process.env.ADMIN_MAIL;
var password = process.env.ADMIN_MAIL_PWD;

const transporter = nodemailer.createTransport({
  service: service,
  auth: {
    user: email,
    pass: password'
  }
});

const send_mail = (mail, res) => {

  var mailOptions = {
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    text: mail.content
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.send("email not sent");
    } else {
      console.log('Email sent: ' + info.response);
      res.send("email sent");
    }
  });
};
