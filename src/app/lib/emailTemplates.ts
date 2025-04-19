interface WelcomeEmailData {
  firstName: string;
  loginUrl: string;
}

export const getWelcomeEmailTemplate = ({ firstName, loginUrl }: WelcomeEmailData) => ({
  subject: 'WeShow Registration Confirmation',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to WeShow</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0057FF 0%, #003399 100%); padding: 40px 20px; text-align: center;">
                    <img src="https://s3.eu-north-1.amazonaws.com/dev.drapp.ai-files/email-assets/logos/Weshow-logo-white_300px.png" alt="WeShow Logo" style="max-width: 200px; height: auto;">
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                      Hi ${firstName},
                    </h1>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thanks for signing up for WeShow. We're very excited to have you on board.
                    </p>
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      To get started using WeShow, please login to your account below:
                    </p>
                    
                    <!-- Login Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 30px;">
                      <tr>
                        <td align="center" style="border-radius: 50px; background: #0057FF;">
                          <a href="${loginUrl}" 
                             target="_blank"
                             style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">
                            Login
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 10px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Thanks,<br>
                      The WeShow.Drapp.ai Team
                    </p>
                    
                    <!-- Help Section -->
                    <table role="presentation" width="100%" style="margin: 40px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 20px;">
                            <strong>P.S.</strong> Need help getting started? Check out our 
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/documentation" style="color: #0057FF; text-decoration: none;">documentation</a>. 
                            Or, just reply to this email with any questions or issues you have. The WeShow support team is always excited to help you.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- URL Fallback -->
                    <p style="margin: 30px 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      If you're having trouble clicking the Login button, copy and paste the URL below into your web browser:
                      <br>
                      <a href="http://weshow.drapp.ai/studio/auth/login" style="color: #0057FF; text-decoration: none; word-break: break-all;">
                        http://weshow.drapp.ai/studio/auth/login
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 20px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">
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
}); 