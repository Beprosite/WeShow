import nodemailer from 'nodemailer';
import { DESIGN_PATTERNS } from '../shared/constants/DESIGN_SYSTEM';

// Create production email transporter
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info@drapp.ai',
    pass: '!4d4SZ2pY81mV5Jg'
  }
});

export async function sendWelcomeEmail(to: string, firstName: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://weshow.drapp.ai'}/studio/auth/login`;
  
  const emailData = {
    from: '"WeShow" <info@drapp.ai>',
    to,
    subject: 'WeShow Registration Confirmation',
    text: `
      Hi ${firstName},
      Thanks for signing up for WeShow. We're very excited to have you on board.
      
      To get started using WeShow, please login to your account here: ${loginUrl}
      
      Need help getting started? Check out our documentation or reply to this email with any questions.
      The WeShow support team is always excited to help you.
      
      Thanks,
      The WeShow.Drapp.ai Team
    `,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WeShow</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: ${DESIGN_PATTERNS.COLORS.background.replace('bg-', '')}; font-family: Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background: linear-gradient(to bottom, #0A0A0A, black); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 163, 255, 0.15);">
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background-color: #0A0A0A; padding: 32px 20px; text-align: center;">
                      <img src="https://s3.eu-north-1.amazonaws.com/dev.drapp.ai-files/email-assets/logos/Weshow-logo-white_300px.png" 
                           alt="WeShow Logo" 
                           style="width: 180px; height: auto; display: inline-block;">
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="margin: 0 0 20px; color: white; font-size: 24px; font-weight: 300;">
                        Hi ${firstName},
                      </h1>
                      <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.6); font-size: 16px; line-height: 24px;">
                        Thanks for signing up for WeShow. We're very excited to have you on board.
                      </p>
                      <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.6); font-size: 16px; line-height: 24px;">
                        To get started using WeShow, please login to your account below:
                      </p>
                      
                      <!-- Login Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 30px;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}"
                               target="_blank"
                               style="display: inline-block; padding: 14px 32px; font-size: 16px; color: white; text-decoration: none; border-radius: 9999px; font-weight: 500; background-color: rgba(0, 163, 255, 0.2); border: 1px solid rgba(0, 163, 255, 0.3); box-shadow: 0 10px 15px -3px rgba(0, 163, 255, 0.2); backdrop-filter: blur(8px); transition: all 200ms;">
                              Login Your Account
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.6); font-size: 16px; line-height: 24px;">
                        Thanks,<br>
                        The WeShow.Drapp.ai Team
                      </p>
                      
                      <!-- Help Section -->
                      <table role="presentation" width="100%" style="margin: 40px 0; padding: 20px; background-color: rgba(0, 163, 255, 0.1); border: 1px solid rgba(0, 163, 255, 0.2); border-radius: 12px;">
                        <tr>
                          <td>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 20px;">
                              <strong style="color: white;">P.S.</strong> Need help getting started? Check out our 
                              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://weshow.drapp.ai'}/documentation" 
                                 style="color: #00A3FF; text-decoration: none; transition: color 200ms;">documentation</a>. 
                              Or, just reply to this email with any questions or issues you have. 
                              The WeShow support team is always excited to help you.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- URL Fallback -->
                      <p style="margin: 30px 0; color: rgba(255, 255, 255, 0.4); font-size: 14px; line-height: 20px;">
                        If you're having trouble clicking the Login Account button, copy and paste the URL below into your web browser:
                        <br>
                        <a href="${loginUrl}"
                           style="color: #00A3FF; text-decoration: none; word-break: break-all; transition: color 200ms;">
                          ${loginUrl}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0A0A0A; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 14px;">
                        © ${new Date().getFullYear()} Drapp.ai. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    const result = await transporter.sendMail(emailData);
    console.log('Welcome email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
} 