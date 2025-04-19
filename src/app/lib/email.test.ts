import nodemailer from 'nodemailer';

// Immediately log to verify script is running
process.stdout.write('Script started\n');

const main = async () => {
  try {
    process.stdout.write('Creating email transporter...\n');
    
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@drapp.ai',
        pass: '!4d4SZ2pY81mV5Jg'
      }
    });

    process.stdout.write('Verifying connection...\n');
    await transporter.verify();
    process.stdout.write('Connection verified!\n');

    process.stdout.write('Sending test email...\n');
    const info = await transporter.sendMail({
      from: '"Drapp.ai Test" <info@drapp.ai>',
      to: '30pips@gmail.com',
      subject: 'Test Email from Node.js ' + new Date().toISOString(),
      text: 'This is a test email sent from Node.js',
      html: '<b>This is a test email sent from Node.js</b>'
    });

    process.stdout.write('✅ Email sent successfully!\n');
    process.stdout.write(`Message ID: ${info.messageId}\n`);
    process.stdout.write(`Response: ${info.response}\n`);

  } catch (error) {
    process.stderr.write('❌ Error occurred:\n');
    process.stderr.write(error.message + '\n');
    if (error.stack) {
      process.stderr.write(error.stack + '\n');
    }
    process.exit(1);
  }
};

// Run the main function
main().then(() => {
  process.stdout.write('Test completed successfully\n');
  process.exit(0);
}).catch(error => {
  process.stderr.write('Fatal error: ' + error.message + '\n');
  process.exit(1);
}); 