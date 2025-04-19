import { sendWelcomeEmail } from './email';

async function testWelcomeEmail() {
  try {
    console.log('Sending welcome email test...');
    const result = await sendWelcomeEmail('30pips@gmail.com', 'Tomer');
    console.log('Welcome email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    process.exit(1);
  }
}

// Run the test
console.log('Starting welcome email test...');
testWelcomeEmail()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 