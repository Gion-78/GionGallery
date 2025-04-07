/**
 * Test script for verifying email sending functionality
 * Usage: node test-email.js your-email@example.com
 */

const nodemailer = require('nodemailer');

// Test email credentials (same as in index.js)
const emailConfig = {
  user: 'simonbrown6427@gmail.com', // Using the same email from index.js
  pass: 'mbbw tgjh rfbb gdhc'       // Using the same password from index.js
};

// Generate a test verification code
const generateTestCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure nodemailer with your email service provider
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

// Main function to send a test email
const sendTestEmail = async (recipientEmail) => {
  const testCode = generateTestCode();
  
  console.log(`Sending test email to: ${recipientEmail}`);
  console.log(`Test verification code: ${testCode}`);
  
  try {
    // Email template
    const mailOptions = {
      from: `"Gion Gallery Test" <${emailConfig.user}>`,
      to: recipientEmail,
      subject: 'TEST - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">TEST - Verification Code</h2>
          <p style="font-size: 16px; color: #555;">This is a TEST email. Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${testCode}
          </div>
          <p style="font-size: 14px; color: #777;">This is a test email to verify your email sending configuration.</p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

// Get the recipient email from command line arguments
const args = process.argv.slice(2);
const recipientEmail = args[0];

if (!recipientEmail) {
  console.error('Please provide a recipient email address as a command line argument.');
  console.error('Usage: node test-email.js your-email@example.com');
  process.exit(1);
}

// Send the test email
sendTestEmail(recipientEmail)
  .then(success => {
    if (success) {
      console.log('\nTest completed successfully!');
      console.log('✅ Your email configuration is working properly.');
    } else {
      console.log('\nTest failed.');
      console.log('❌ Please check your email configuration and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\nTest failed with an unexpected error:', error);
    process.exit(1);
  }); 