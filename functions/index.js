const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Get email configuration from environment
// If running locally, use default values (be sure to set them in firebase config first with:
// firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password")
const getEmailConfig = () => {
  try {
    // Try to get from environment variables
    if (functions.config().email && functions.config().email.user && functions.config().email.password) {
      return {
        user: functions.config().email.user,
        pass: functions.config().email.password
      };
    }
  } catch (error) {
    console.warn('Could not load email config from environment. Using default values.');
  }
  
  // Default values for development
  return {
    user: 'simonbrown6427@gmail.com', // Replace with your email
    pass: 'mbbw tgjh rfbb gdhc'     // Replace with your app password
  };
};

const emailConfig = getEmailConfig();

// Configure nodemailer with your email service provider
// For production, you should use a proper email service like SendGrid, Mailgun, etc.
// For testing, you can use Gmail or create an account at Ethereal Email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

// Firebase Cloud Function to send verification code via email
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  // CORS is automatically handled for callable functions
  const { email, code } = data;
  
  if (!email || !code) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and verification code are required'
    );
  }

  try {
    // Email template
    const mailOptions = {
      from: `"Gion Gallery" <${emailConfig.user}>`, // Use the same email from config
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="font-size: 16px; color: #555;">Thank you for registering with Gion Gallery. Use the following code to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send verification email',
      error
    );
  }
});

// HTTP version of the function (useful for testing or direct API calls)
exports.sendVerificationCodeHttp = functions.https.onRequest((req, res) => {
  // Enable CORS using the 'cors' package
  return cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).send({ error: 'Email and verification code are required' });
        return;
      }

      // Email template
      const mailOptions = {
        from: `"Gion Gallery" <${emailConfig.user}>`, // Use the same email from config
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Verification Code</h2>
            <p style="font-size: 16px; color: #555;">Thank you for registering with Gion Gallery. Use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);
      
      res.status(200).send({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({ error: 'Failed to send verification email' });
    }
  });
}); 