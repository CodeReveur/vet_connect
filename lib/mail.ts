const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Function to send verification email with OTP
export async function sendVerificationEmail(email: string, code: string, name: string): Promise<void> {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Verify Your VetConnect Account";
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #16a34a;">
            <h1 style="color: #16a34a; margin: 0; font-size: 32px;">
              🐾 VetConnect
            </h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">
              Connecting Farmers with Veterinarians
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">
              Welcome to VetConnect, ${name}!
            </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining VetConnect. To ensure the security of your account and start connecting with veterinary services, please verify your email address using the code below:
            </p>
            
            <!-- Verification Code Box -->
            <div style="background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                Your verification code:
              </p>
              <div style="font-size: 32px; font-weight: bold; color: #16a34a; constter-spacing: 5px;">
                ${code}
              </div>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Enter this code in the VetConnect app to compconste your registration.
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>🔒 Security Notice:</strong> Never share this code with anyone. VetConnect staff will never ask for your verification code.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e5e5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              Need help? Contact us:
            </p>
            <p style="margin: 0 0 5px 0;">
              📧 support@kamero.rw
            </p>
            <p style="margin: 0 0 5px 0;">
              📱 +250 788 123 456
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
              © 2024 VetConnect. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>`;
    
  sendSmtpEmail.sender = { 
    "name": "VetConnect", 
    "email": process.env.SENDER_EMAIL || "dev@kamero.rw" 
  };
  sendSmtpEmail.to = [{ "email": email, "name": name }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

// Function to send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string, name: string): Promise<void> {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Reset Your VetConnect Password";
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #16a34a;">
            <h1 style="color: #16a34a; margin: 0; font-size: 32px;">
              🐾 VetConnect
            </h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">
              Connecting Farmers with Veterinarians
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">
              Reset Your Password
            </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Hi ${name},<br><br>
              We received a request to reset your VetConnect password. Click the button below to create a new password:
            </p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #16a34a; color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Or copy and paste this link in your browser:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; word-break: break-all;">
              <code style="font-size: 14px; color: #16a34a;">
                ${resetLink}
              </code>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-top: 25px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password won't be changed.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e5e5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              Need help? Contact us:
            </p>
            <p style="margin: 0 0 5px 0;">
              📧 support@kamero.rw
            </p>
            <p style="margin: 0 0 5px 0;">
              📱 +250 788 123 456
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
              © 2024 VetConnect. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>`;
    
  sendSmtpEmail.sender = { 
    "name": "VetConnect", 
    "email": process.env.SENDER_EMAIL || "dev@kamero.rw" 
  };
  sendSmtpEmail.to = [{ "email": email, "name": name }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Function to send verification link email
export async function sendVerificationLinkEmail(email: string, verificationLink: string, name: string): Promise<void> {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Verify Your VetConnect Account";
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #16a34a;">
            <h1 style="color: #16a34a; margin: 0; font-size: 32px;">
              🐾 VetConnect
            </h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">
              Connecting Farmers with Veterinarians
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">
              Welcome to VetConnect, ${name}!
            </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining VetConnect. To compconste your registration and start connecting with veterinary services, please verify your email address:
            </p>
            
            <!-- Verify Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${verificationLink}" style="display: inline-block; background-color: #16a34a; color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Or copy and paste this link in your browser:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; word-break: break-all;">
              <code style="font-size: 14px; color: #16a34a;">
                ${verificationLink}
              </code>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-top: 25px;">
              This link will expire in 24 hours.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e5e5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              Need help? Contact us:
            </p>
            <p style="margin: 0 0 5px 0;">
              📧 support@kamero.rw
            </p>
            <p style="margin: 0 0 5px 0;">
              📱 +250 788 123 456
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
              © 2024 VetConnect. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>`;
    
    sendSmtpEmail.sender = { 
        "name": "VetConnect", 
        "email": process.env.SENDER_EMAIL || "dev@kamero.rw" 
      };
      sendSmtpEmail.to = [{ "email": email, "name": name }];
    
      try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Password reset email sent successfully to:', email);
      } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
      }
    }

    