const { sendWelcomeEmail } = require('./email');

async function testWelcomeEmail() {
  try {
    console.log('Sending welcome email test...');
    const result = await sendWelcomeEmail('30pips@gmail.com', 'Tomer');
    console.log('Welcome email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

// Run the test
testWelcomeEmail(); 