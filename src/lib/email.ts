import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, studioName: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"My Project Manager" <noreply@myprojectmanager.com>',
      to,
      subject: 'Welcome to My Project Manager!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to My Project Manager!</h1>
          <p>Dear ${studioName},</p>
          <p>Thank you for registering with My Project Manager. We're excited to have you on board!</p>
          <p>You can now log in to your studio dashboard using your email address.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The My Project Manager Team</p>
        </div>
      `,
    });
    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendStudioRegistrationNotification(studioDetails: {
  name: string;
  email: string;
  contactName: string;
  subscriptionTier: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"My Project Manager" <noreply@myprojectmanager.com>',
      to: process.env.ADMIN_EMAIL || 'admin@myprojectmanager.com',
      subject: 'New Studio Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>New Studio Registration</h1>
          <p>A new studio has registered:</p>
          <ul>
            <li>Studio Name: ${studioDetails.name}</li>
            <li>Email: ${studioDetails.email}</li>
            <li>Contact Name: ${studioDetails.contactName}</li>
            <li>Subscription Tier: ${studioDetails.subscriptionTier}</li>
          </ul>
          <p>Please review the registration in the master admin dashboard.</p>
        </div>
      `,
    });
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
} 