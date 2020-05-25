const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'precannastyles@gmail.com',
    pass: 'yourpassword'
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
