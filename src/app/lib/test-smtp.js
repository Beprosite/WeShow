const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

console.log('Starting SMTP test...');

// Create SMTP transporter
const transport = nodemailer.createTransport(smtpTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info@drapp.ai',
    pass: '!4d4SZ2pY81mV5Jg'
  },
  debug: true,
  logger: true
}));

// Test connection
console.log('Testing SMTP connection...');
transport.verify((error, success) => {
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Server is ready to take our messages');
    
    // Send test email
    transport.sendMail({
      from: '"WeShow Test" <info@drapp.ai>',
      to: '30pips@gmail.com',
      subject: 'SMTP Test ' + new Date().toISOString(),
      text: 'This is a test email from SMTP transport',
      html: '<b>This is a test email from SMTP transport</b>'
    }, (err, info) => {
      if (err) {
        console.error('Failed to send email:', err);
      } else {
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
      }
      process.exit(0);
    });
  }
}); 