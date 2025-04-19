import nodemailer from 'nodemailer';
import { getWelcomeEmailTemplate } from '../app/lib/emailTemplates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'info@drapp.ai',
    pass: process.env.SMTP_PASSWORD
  },
  name: 'WeShow'
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: '"WeShow" <info@drapp.ai>',
      replyTo: 'info@drapp.ai',
      to,
      subject,
      text,
      html: html || text
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, studioName: string, firstName: string) {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://weshow.drapp.ai'}/studio/auth/login`;
    const template = getWelcomeEmailTemplate({
      firstName: firstName,
      loginUrl
    });

    await sendEmail({
      to,
      subject: template.subject,
      text: `
        Welcome to WeShow!
        
        Hi ${firstName},
        
        Thanks for signing up for WeShow. We're very excited to have you on board.
        
        To get started using WeShow, please login to your account here: ${loginUrl}
        
        Need help getting started? Check out our documentation or reply to this email with any questions.
        The WeShow support team is always excited to help you.
        
        Thanks,
        The WeShow.Drapp.ai Team
      `,
      html: template.html
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
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@weshow.ai',
      subject: 'New Studio Registration',
      text: `
        New Studio Registration
        
        A new studio has registered:
        
        - Studio Name: ${studioDetails.name}
        - Email: ${studioDetails.email}
        - Contact Name: ${studioDetails.contactName}
        - Subscription Tier: ${studioDetails.subscriptionTier}
        
        Please review the registration in the master admin dashboard.
      `,
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
      `
    });
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
} 