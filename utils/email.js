const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    //activate in gmail "less secure app" option
    tls: {
      rejectUnauthorized: false,
    },
  });
  // 2) define the email options
  const mailOptions = {
    From: 'SpaceZone ORG <spacezonemailer@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.massage,
    html: options.html,
  };
  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
