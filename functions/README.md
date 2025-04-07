# Firebase Functions for Email Verification

This directory contains Firebase Cloud Functions to handle email verification for user registration in Gion Gallery.

## Setup Instructions

1. **Configure your email service:**
   Open `index.js` and update the nodemailer transporter configuration with your email service credentials:
   ```javascript
   const transporter = nodemailer.createTransport({
     service: 'gmail', // Or your preferred email service
     auth: {
       user: 'your-email@gmail.com', // Replace with your email
       pass: 'your-app-password' // Replace with your app password
     }
   });
   ```

   Also update the "from" field in the mailOptions:
   ```javascript
   from: '"Gion Gallery" <your-email@gmail.com>', // Replace with your email
   ```

2. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase:**
   ```bash
   firebase login
   ```

4. **Important: Upgrade to Blaze Plan**
   Firebase Functions with outbound API calls (like sending emails) require the Blaze (pay-as-you-go) plan. Upgrade in the Firebase Console if you haven't already.

5. **Deploy the functions:**
   ```bash
   # Set region if needed (default is us-central1)
   firebase functions:config:set functions.region=us-central1

   # Deploy the functions
   firebase deploy --only functions
   ```

6. **Verify deployment:**
   After deployment, check in the Firebase Console that your functions are listed and active.

## CORS Configuration

The functions include CORS support for cross-origin requests:

1. The `sendVerificationCode` function is a Firebase Callable function that automatically handles CORS.
2. An HTTP version `sendVerificationCodeHttp` is also provided with explicit CORS handling.

If you're still encountering CORS issues:
- Make sure you're using the latest version of Firebase SDK on the client
- Check that your Firebase project is properly initialized on the client
- Verify that you're using the correct function URL

## Using Gmail for Testing

If you're using Gmail, you need to:
1. Enable 2-Step Verification for your Google account
2. Create an "App Password" specifically for this application
   - Go to your Google Account > Security > App Passwords
   - Select "Mail" and your device type
   - Click "Generate"
   - Use the 16-character password in your code (replacing 'your-app-password')

## Production Recommendations

For production, consider:
- Using dedicated email services like SendGrid, Mailgun, or Amazon SES
- Storing email credentials securely using Firebase environment configuration:
  ```bash
  # Store email configuration securely
  firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
  ```
  
  And then in your code:
  ```javascript
  const emailUser = functions.config().email.user;
  const emailPassword = functions.config().email.password;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
  ```
- Implementing rate limiting to prevent abuse
- Adding email templates with better branding

## Troubleshooting

If you encounter errors:
- Check Firebase Functions logs in the Firebase Console
- Verify your email service credentials
- Make sure your Firebase project is on the Blaze plan (required for external API calls)
- For CORS errors, ensure your client is making requests in the correct format for callable functions
- If deployment fails, check for any syntax errors in your functions code 