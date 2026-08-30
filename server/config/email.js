const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // In development, log emails to console if no SMTP configured or using default placeholders
  if (process.env.EMAIL_USER === 'noreply@worklinkai.com' || process.env.EMAIL_PASS === 'placeholder_password') {
    console.log('📧 [SMTP] Missing credentials. Email service running in console-log mode.');
    return null;
  }

  const isGmail = process.env.EMAIL_HOST?.includes('gmail');

  return nodemailer.createTransport({
    service: isGmail ? 'gmail' : undefined,
    host: isGmail ? undefined : process.env.EMAIL_HOST,
    port: isGmail ? undefined : process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

// Verify connection configuration
if (transporter) {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ SMTP Connection Error:', error.message);
    } else {
      console.log('✅ SMTP Server is ready to send emails');
    }
  });
}

module.exports = transporter;
