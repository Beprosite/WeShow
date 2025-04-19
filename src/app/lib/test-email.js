const nodemailer = require('nodemailer');

console.log('Starting email test...');

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info@drapp.ai',
    pass: '!4d4SZ2pY81mV5Jg'
  }
});

console.log('Sending test email...');
transporter.sendMail({
  from: '"Drapp.ai Test" <info@drapp.ai>',
  to: '30pips@gmail.com',
  subject: 'Test Email from Node.js ' + new Date().toISOString(),
  text: 'This is a test email sent from Node.js',
  html: '<b>This is a test email sent from Node.js</b>'
})
.then(info => {
  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
})
.catch(error => {
  console.error('Failed to send email:', error);
}); 